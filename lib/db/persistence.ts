// Encrypted persistence layer. Node runtime only.
//
// Two backends behind one interface:
//
//   PostgresAdapter — activates automatically when DATABASE_URL is set
//                     (Neon, Supabase, Vercel Postgres). Run db/schema.sql
//                     once against the database first.
//   FileAdapter     — sandbox fallback writing encrypted blobs to .data/
//                     (gitignored) so local development persists across
//                     restarts without any infrastructure.
//
// Every payload is encrypted with AES-256-GCM (lib/db/crypto.ts) BEFORE it
// reaches either backend. The database never sees plaintext client data.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { decryptJson, encryptJson } from "./crypto";
// Type-only import: erased at compile time, so no runtime cycle with the store.
import type { StoredFactFind } from "@/lib/sarah-fact-find-store";

export interface SecurityEventRow {
  event: string;
  at: string;
  meta: Record<string, unknown>;
}

export interface PersistenceAdapter {
  name: string;
  saveFactFind(entry: StoredFactFind): Promise<void>;
  loadFactFinds(): Promise<StoredFactFind[]>;
  recordSecurityEvent(row: SecurityEventRow): Promise<void>;
}

// ---------------------------------------------------------------------------

class FileAdapter implements PersistenceAdapter {
  name = "file";
  private file = path.join(process.cwd(), ".data", "fact-finds.enc.json");
  private eventsFile = path.join(process.cwd(), ".data", "security-events.log");

  private readAll(): Record<string, string> {
    if (!existsSync(this.file)) return {};
    try {
      return JSON.parse(readFileSync(this.file, "utf8")) as Record<string, string>;
    } catch {
      return {};
    }
  }

  async saveFactFind(entry: StoredFactFind): Promise<void> {
    const all = this.readAll();
    all[entry.clientId] = encryptJson(entry);
    mkdirSync(path.dirname(this.file), { recursive: true });
    writeFileSync(this.file, JSON.stringify(all, null, 2), { mode: 0o600 });
  }

  async loadFactFinds(): Promise<StoredFactFind[]> {
    const all = this.readAll();
    const out: StoredFactFind[] = [];
    for (const blob of Object.values(all)) {
      try {
        out.push(decryptJson<StoredFactFind>(blob));
      } catch {
        // Key rotated or blob damaged; skip rather than crash boot.
      }
    }
    return out;
  }

  async recordSecurityEvent(row: SecurityEventRow): Promise<void> {
    mkdirSync(path.dirname(this.eventsFile), { recursive: true });
    writeFileSync(this.eventsFile, JSON.stringify(row) + "\n", {
      flag: "a",
      mode: 0o600,
    });
  }
}

// ---------------------------------------------------------------------------



class PostgresAdapter implements PersistenceAdapter {
  name = "postgres";
  private sql: import("postgres").Sql;

  constructor(url: string) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const postgres = require("postgres") as typeof import("postgres");
    this.sql = postgres(url, { max: 1, connect_timeout: 10 });
  }

  async saveFactFind(entry: StoredFactFind): Promise<void> {
    const payload = encryptJson(entry);
    await this.sql`
      insert into fact_finds (client_id, payload, received_at)
      values (${entry.clientId}, ${payload}, ${entry.receivedAt})
      on conflict (client_id)
      do update set payload = excluded.payload, received_at = excluded.received_at
    `;
  }

  async loadFactFinds(): Promise<StoredFactFind[]> {
    const rows = await this.sql<{ payload: string }[]>`
      select payload from fact_finds
    `;
    const out: StoredFactFind[] = [];
    for (const row of rows) {
      try {
        out.push(decryptJson<StoredFactFind>(row.payload));
      } catch {
        // Skip undecryptable rows; never crash reads on one bad record.
      }
    }
    return out;
  }

  async recordSecurityEvent(row: SecurityEventRow): Promise<void> {
    await this.sql`
      insert into security_events (event, at, meta)
      values (${row.event}, ${row.at}, ${JSON.stringify(row.meta)})
    `;
  }
}

// ---------------------------------------------------------------------------

let adapter: PersistenceAdapter | null = null;

export function getPersistence(): PersistenceAdapter {
  if (adapter) return adapter;
  const url = process.env.DATABASE_URL;
  adapter = url ? new PostgresAdapter(url) : new FileAdapter();
  console.log(JSON.stringify({ type: "persistence", backend: adapter.name }));
  return adapter;
}
