// Real client records, encrypted at rest. Server-only — do not import
// from client components (pulls in node crypto via the secure store).
//
// Demo clients stay in lib/data.ts; records created here are the live
// ones. Both are merged by lib/data/client-repository.ts so every page
// sees one client list.

import { randomBytes } from "crypto";
import type { Client, FactFindStatus } from "../data";
import { secureSet, secureList, secureGet } from "../secure-store";

const NAMESPACE = "clients";

export interface RealClient {
  id: string;
  name: string;
  email: string;
  mobile: string;
  notes: string;
  token: string;
  createdAt: string;
  status: FactFindStatus;
  progress: number;
  lastActivity: string;
}

export interface NewClientInput {
  name: string;
  email: string;
  mobile: string;
  notes?: string;
}

const STORE_KEY = "__bmk_real_clients__";

type GlobalStore = {
  map: Map<string, RealClient>;
  byToken: Map<string, string>;
  hydration: Promise<void> | null;
};

function getStore(): GlobalStore {
  const g = globalThis as unknown as Record<string, GlobalStore | undefined>;
  if (!g[STORE_KEY]) g[STORE_KEY] = { map: new Map(), byToken: new Map(), hydration: null };
  return g[STORE_KEY] as GlobalStore;
}

export function ensureClientsHydrated(): Promise<void> {
  const store = getStore();
  if (!store.hydration) {
    store.hydration = (async () => {
      try {
        const entries = await secureList<RealClient>(NAMESPACE);
        for (const { value } of entries) {
          store.map.set(value.id, value);
          store.byToken.set(value.token, value.id);
        }
        console.log(`[clients] hydrated ${entries.length} client records`);
      } catch (e) {
        console.error("[clients] hydration failed:", e instanceof Error ? e.message : e);
      }
    })();
  }
  return store.hydration;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function createRealClient(input: NewClientInput): Promise<RealClient> {
  await ensureClientsHydrated();
  const store = getStore();

  const base = slugify(input.name) || "client";
  let id = base;
  let n = 2;
  while (store.map.has(id)) id = `${base}-${n++}`;

  const record: RealClient = {
    id,
    name: input.name.trim(),
    email: input.email.trim(),
    mobile: input.mobile.trim(),
    notes: input.notes?.trim() ?? "",
    token: `${base.slice(0, 3)}-${randomBytes(5).toString("hex")}`,
    createdAt: new Date().toISOString(),
    status: "link-sent",
    progress: 0,
    lastActivity: "Just now",
  };

  // Encrypted persist first — fails closed like every other client write.
  await secureSet(NAMESPACE, record.id, record);
  store.map.set(record.id, record);
  store.byToken.set(record.token, record.id);
  return record;
}

export async function updateRealClient(
  id: string,
  patch: Partial<Pick<RealClient, "status" | "progress" | "lastActivity" | "notes">>,
): Promise<RealClient | undefined> {
  await ensureClientsHydrated();
  const store = getStore();
  const current = store.map.get(id) ?? (await secureGet<RealClient>(NAMESPACE, id));
  if (!current) return undefined;
  const next = { ...current, ...patch };
  await secureSet(NAMESPACE, id, next);
  store.map.set(id, next);
  return next;
}

export async function listRealClients(): Promise<RealClient[]> {
  await ensureClientsHydrated();
  return Array.from(getStore().map.values()).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export async function getRealClient(id: string): Promise<RealClient | undefined> {
  await ensureClientsHydrated();
  return getStore().map.get(id);
}

export async function getRealClientByToken(token: string): Promise<RealClient | undefined> {
  await ensureClientsHydrated();
  const store = getStore();
  const id = store.byToken.get(token);
  return id ? store.map.get(id) : undefined;
}

// Expand a stored record into the full Client shape the UI renders.
export function toClient(r: RealClient): Client {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    mobile: r.mobile,
    progress: r.progress,
    status: r.status,
    nextAction:
      r.status === "link-sent"
        ? "Send fact find link to client"
        : r.status === "in-progress"
          ? "Awaiting client discovery session"
          : "Review completed fact find",
    meetingDate: null,
    meetingStage: r.status === "ready-for-meeting" ? "Ready to Book" : "Awaiting Start",
    adviser: "Brad Lonergan",
    lastActivity: r.lastActivity,
    notes: r.notes,
    factFindSections: [
      { name: "Personal Details", status: r.progress > 0 ? "in-progress" : "missing" },
      { name: "Income & Employment", status: "missing" },
      { name: "Assets & Liabilities", status: "missing" },
      { name: "Expenses", status: "missing" },
      { name: "Superannuation", status: "missing" },
      { name: "Insurance", status: "missing" },
      { name: "Goals & Objectives", status: "missing" },
    ],
    timeline: [
      {
        date: new Date(r.createdAt).toLocaleDateString("en-AU", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        event: "Client record created",
        type: "system",
      },
    ],
  };
}
