// Persistence for generated SOAs. Server side uses a global Map (ephemeral),
// client side mirrors to localStorage for the review UI to pick up changes
// without round-tripping.

import type { SoaDocument, SoaStatus, SectionId } from "./soa-template";

const STORE_KEY = "__bmk_soa_store__";
const CLIENT_STORE_KEY = "bmk-crm-soa-store-v1";

type GlobalStore = { map: Map<string, SoaDocument> };

function serverStore(): GlobalStore {
  const g = globalThis as unknown as Record<string, GlobalStore | undefined>;
  if (!g[STORE_KEY]) g[STORE_KEY] = { map: new Map() };
  return g[STORE_KEY] as GlobalStore;
}

function clientLoad(): Record<string, SoaDocument> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CLIENT_STORE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, SoaDocument>) : {};
  } catch {
    return {};
  }
}

function clientSave(map: Record<string, SoaDocument>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CLIENT_STORE_KEY, JSON.stringify(map));
  } catch {
    // ignore quota
  }
}

export function saveSoa(doc: SoaDocument): void {
  serverStore().map.set(doc.clientId, doc);
  if (typeof window !== "undefined") {
    const map = clientLoad();
    map[doc.clientId] = doc;
    clientSave(map);
  }
}

export function getSoa(clientId: string): SoaDocument | undefined {
  if (typeof window !== "undefined") {
    const map = clientLoad();
    if (map[clientId]) return map[clientId];
  }
  return serverStore().map.get(clientId);
}

export function listSoas(): SoaDocument[] {
  if (typeof window !== "undefined") {
    return Object.values(clientLoad());
  }
  return Array.from(serverStore().map.values());
}

export function updateSection(
  clientId: string,
  sectionId: SectionId,
  patch: Partial<{ body: string; reviewed: boolean; approved: boolean; comment: string }>,
): SoaDocument | undefined {
  const doc = getSoa(clientId);
  if (!doc) return undefined;
  const next: SoaDocument = {
    ...doc,
    sections: doc.sections.map((s) =>
      s.id === sectionId ? { ...s, ...patch } : s,
    ),
  };
  saveSoa(next);
  return next;
}

export function setStatus(clientId: string, status: SoaStatus): SoaDocument | undefined {
  const doc = getSoa(clientId);
  if (!doc) return undefined;
  const next = { ...doc, status };
  saveSoa(next);
  return next;
}
