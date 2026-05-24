// In-memory store of completed Sarah fact finds, keyed by clientId.
// Phase 1 mock: ephemeral per server instance. Real persistence will move
// to a database when integrations come online.

import type { SarahFactFind } from "./sarah-fact-find-schema";

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

export function getFactFind(clientId: string): StoredFactFind | undefined {
  return getStore().map.get(clientId);
}

export function listFactFinds(): StoredFactFind[] {
  return Array.from(getStore().map.values());
}
