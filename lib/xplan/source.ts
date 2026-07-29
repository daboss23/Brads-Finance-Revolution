// XPLAN as a client source.
//
// This is the seam the rest of the platform sees. It satisfies the same shape
// the client repository already uses, so nothing downstream — the fact find,
// the compliance gate, the SOA generator — knows or cares that a record came
// from XPLAN rather than from Sarah.
//
// Every call fails soft: if XPLAN is unconfigured, unreachable or rejects the
// credentials, the platform carries on with the records it already has. An
// integration outage must never take the practice's own CRM down with it.

import type { Client } from "@/lib/data";
import type { SarahFactFind } from "@/lib/sarah-fact-find-schema";
import { isXplanEnabled } from "./config";
import { ENDPOINTS, xplanGet } from "./client";
import {
  localIdFor,
  toFactFind,
  xplanDisplayName,
  xplanEmail,
  xplanMobile,
  type XplanEntity,
} from "./mapping";

export interface XplanClientRecord {
  client: Client;
  factFind: SarahFactFind;
  entityId: string;
}

function warn(err: unknown): void {
  const msg = err instanceof Error ? err.message : String(err);
  console.warn(`[xplan] ${msg}`);
}

/** XPLAN list responses are paged and the envelope varies by site build. */
function entitiesFrom(payload: unknown): XplanEntity[] {
  if (Array.isArray(payload)) return payload as XplanEntity[];
  if (payload && typeof payload === "object") {
    for (const key of ["items", "results", "data", "entities"]) {
      const v = (payload as Record<string, unknown>)[key];
      if (Array.isArray(v)) return v as XplanEntity[];
    }
  }
  return [];
}

function toClientRecord(entity: XplanEntity): XplanClientRecord {
  const factFind = toFactFind(entity);
  const client: Client = {
    id: localIdFor(entity),
    name: xplanDisplayName(entity),
    email: xplanEmail(entity),
    mobile: xplanMobile(entity),
    progress: factFind.completionPercentage,
    // Imported records always land as in-progress. Advancing the pipeline is
    // the platform's own decision, driven by its compliance gate, not by
    // whatever status XPLAN happened to carry.
    status: "in-progress",
    nextAction: "Review imported XPLAN record and fill the gaps",
    meetingDate: null,
    meetingStage: "Imported from XPLAN",
    adviser: "Brad Lonergan",
    lastActivity: "Imported from XPLAN",
    notes: "",
    factFindSections: [],
    timeline: [],
  };
  return { client, factFind, entityId: String(entity.entity_id) };
}

/** Every entity Brad's XPLAN login can see. Empty when unconfigured. */
export async function listXplanClients(): Promise<XplanClientRecord[]> {
  if (!isXplanEnabled()) return [];
  try {
    const payload = await xplanGet<unknown>(ENDPOINTS.entities);
    return entitiesFrom(payload).map(toClientRecord);
  } catch (err) {
    warn(err);
    return [];
  }
}

/** One record by its local `xplan-<entityId>` id. Null when unconfigured. */
export async function getXplanClient(
  localId: string,
): Promise<XplanClientRecord | null> {
  if (!isXplanEnabled() || !localId.startsWith("xplan-")) return null;
  const entityId = localId.slice("xplan-".length);
  try {
    const entity = await xplanGet<XplanEntity>(ENDPOINTS.entity(entityId));
    return entity ? toClientRecord(entity) : null;
  } catch (err) {
    warn(err);
    return null;
  }
}

export function isXplanId(clientId: string): boolean {
  return clientId.startsWith("xplan-");
}
