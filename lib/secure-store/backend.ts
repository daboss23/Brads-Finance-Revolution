// Dual-backend encrypted persistence.
//
// Records are namespaced key/value pairs; the value is ALWAYS an enc1
// ciphertext envelope produced by crypto.ts before it reaches either
// backend — neither backend ever sees plaintext.
//
//   - Postgres backend: switches on automatically when DATABASE_URL is set
//     (Neon, Supabase and Vercel Postgres all work). One-time setup: run
//     db/schema.sql against the database.
//   - File backend: encrypted JSON files under .data/secure-store so the
//     sandbox and local dev work with zero infrastructure.

import { promises as fs } from "fs";
import path from "path";

export interface SecureRecord {
  namespace: string;
  key: string;
  ciphertext: string;
  updatedAt: string;
}

export interface StoreBackend {
  name: string;
  put(record: SecureRecord): Promise<void>;
  get(namespace: string, key: string): Promise<SecureRecord | undefined>;
  list(namespace: string): Promise<SecureRecord[]>;
  append(namespace: string, ciphertext: string): Promise<void>;
  listAppended(namespace: string, limit?: number): Promise<SecureRecord[]>;
}

// ── File backend ─────────────────────────────────────────────────────────────

const DATA_DIR = process.env.SECURE_STORE_DIR ?? path.join(process.cwd(), ".data", "secure-store");

function safeName(s: string): string {
  return s.replace(/[^a-zA-Z0-9_-]/g, "_");
}

class FileBackend implements StoreBackend {
  name = "file";

  private fileFor(namespace: string): string {
    return path.join(DATA_DIR, `${safeName(namespace)}.json`);
  }

  private async read(namespace: string): Promise<SecureRecord[]> {
    try {
      const raw = await fs.readFile(this.fileFor(namespace), "utf8");
      return JSON.parse(raw) as SecureRecord[];
    } catch {
      return [];
    }
  }

  private async write(namespace: string, records: SecureRecord[]): Promise<void> {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const file = this.fileFor(namespace);
    const tmp = `${file}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(records, null, 2), "utf8");
    await fs.rename(tmp, file);
  }

  async put(record: SecureRecord): Promise<void> {
    const records = await this.read(record.namespace);
    const idx = records.findIndex((r) => r.key === record.key);
    if (idx >= 0) records[idx] = record;
    else records.push(record);
    await this.write(record.namespace, records);
  }

  async get(namespace: string, key: string): Promise<SecureRecord | undefined> {
    return (await this.read(namespace)).find((r) => r.key === key);
  }

  async list(namespace: string): Promise<SecureRecord[]> {
    return this.read(namespace);
  }

  async append(namespace: string, ciphertext: string): Promise<void> {
    const records = await this.read(namespace);
    records.push({
      namespace,
      key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ciphertext,
      updatedAt: new Date().toISOString(),
    });
    await this.write(namespace, records);
  }

  async listAppended(namespace: string, limit = 500): Promise<SecureRecord[]> {
    const records = await this.read(namespace);
    return records.slice(-limit);
  }
}

// ── Postgres backend ─────────────────────────────────────────────────────────

type PgPool = {
  query: (text: string, values?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }>;
};

class PostgresBackend implements StoreBackend {
  name = "postgres";
  private pool: PgPool | null = null;

  private async getPool(): Promise<PgPool> {
    if (!this.pool) {
      // pg is marked external in next.config.mjs so this resolves at runtime.
      const { Pool } = await import("pg");
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 5,
        ssl: process.env.DATABASE_URL?.includes("localhost") ? undefined : { rejectUnauthorized: false },
      }) as unknown as PgPool;
    }
    return this.pool;
  }

  async put(record: SecureRecord): Promise<void> {
    const pool = await this.getPool();
    await pool.query(
      `INSERT INTO secure_records (namespace, key, ciphertext, updated_at)
       VALUES ($1, $2, $3, now())
       ON CONFLICT (namespace, key)
       DO UPDATE SET ciphertext = EXCLUDED.ciphertext, updated_at = now()`,
      [record.namespace, record.key, record.ciphertext],
    );
  }

  async get(namespace: string, key: string): Promise<SecureRecord | undefined> {
    const pool = await this.getPool();
    const { rows } = await pool.query(
      `SELECT namespace, key, ciphertext, updated_at FROM secure_records
       WHERE namespace = $1 AND key = $2`,
      [namespace, key],
    );
    return rows[0] ? rowToRecord(rows[0]) : undefined;
  }

  async list(namespace: string): Promise<SecureRecord[]> {
    const pool = await this.getPool();
    const { rows } = await pool.query(
      `SELECT namespace, key, ciphertext, updated_at FROM secure_records
       WHERE namespace = $1 ORDER BY updated_at ASC`,
      [namespace],
    );
    return rows.map(rowToRecord);
  }

  async append(namespace: string, ciphertext: string): Promise<void> {
    const pool = await this.getPool();
    await pool.query(
      `INSERT INTO secure_events (namespace, ciphertext) VALUES ($1, $2)`,
      [namespace, ciphertext],
    );
  }

  async listAppended(namespace: string, limit = 500): Promise<SecureRecord[]> {
    const pool = await this.getPool();
    const { rows } = await pool.query(
      `SELECT namespace, id::text AS key, ciphertext, created_at AS updated_at
       FROM secure_events WHERE namespace = $1 ORDER BY id DESC LIMIT $2`,
      [namespace, limit],
    );
    return rows.map(rowToRecord).reverse();
  }
}

function rowToRecord(row: Record<string, unknown>): SecureRecord {
  return {
    namespace: String(row.namespace),
    key: String(row.key),
    ciphertext: String(row.ciphertext),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

// ── Backend selection ────────────────────────────────────────────────────────

let backend: StoreBackend | undefined;

export function getBackend(): StoreBackend {
  if (!backend) {
    backend = process.env.DATABASE_URL ? new PostgresBackend() : new FileBackend();
    console.log(`[secure-store] using ${backend.name} backend`);
  }
  return backend;
}
