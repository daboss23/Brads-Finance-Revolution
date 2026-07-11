// In-memory store of completed Sarah fact finds, keyed by clientId.
//
// This module stays dependency-free so it can be imported from client
// components (the compliance checker runs in the browser against the demo
// data). Durable encrypted persistence lives in
// lib/secure-store/fact-find-persistence.ts, which is server-only and
// writes through this map.

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

// In-memory write only. On the server, prefer persistFactFind from
// lib/secure-store/fact-find-persistence.ts, which encrypts and stores
// durably before updating this map.
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
