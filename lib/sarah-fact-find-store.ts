// In-memory store of completed Sarah fact finds, keyed by clientId.
//
// This module stays dependency-free so client components can import the
// read helpers. Durability lives in lib/db/fact-find-persistence.ts
// (server-only): the API route write-throughs to it, and instrumentation.ts
// seeds this map from it at every server boot, so completed fact finds
// survive restarts and deploys.

import type { SarahFactFind } from "./sarah-fact-find-schema";
import { getDemoFactFind } from "./sarah-fact-find-demo";

export interface StoredFactFind {
  clientId: string;
  token: string;
  receivedAt: string;
  data: SarahFactFind;
}

const STORE_KEY = "__bmk_sarah_fact_find_store__";

type GlobalStore = { map: Map<string, StoredFactFind> };

function getStore(): GlobalStore {
  const g = globalThis as unknown as Record<string, GlobalStore | undefined>;
  if (!g[STORE_KEY]) g[STORE_KEY] = { map: new Map() };
  return g[STORE_KEY] as GlobalStore;
}

export function saveFactFind(entry: StoredFactFind): void {
  getStore().map.set(entry.clientId, entry);
  console.log(
    "[fact-find-store] saved",
    entry.clientId,
    "completion:",
    entry.data.completionPercentage,
    "missing:",
    entry.data.missingSections,
  );
}

// Boot-time seeding from persistence; never overwrites live entries.
export function seedFactFinds(entries: StoredFactFind[]): void {
  const store = getStore();
  for (const entry of entries) {
    if (!store.map.has(entry.clientId)) store.map.set(entry.clientId, entry);
  }
}

export function getFactFind(clientId: string): StoredFactFind | undefined {
  return getStore().map.get(clientId);
}

// Returns the live fact find when present, otherwise the demo payload so
// the recommender and form pre-fill have something to work with.
export function getFactFindOrDemo(clientId: string): SarahFactFind | undefined {
  const live = getStore().map.get(clientId);
  if (live) return live.data;
  return getDemoFactFind(clientId);
}

export function listFactFinds(): StoredFactFind[] {
  return Array.from(getStore().map.values());
}
