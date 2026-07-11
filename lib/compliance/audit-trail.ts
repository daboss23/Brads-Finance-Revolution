// BMK Compliance Audit Trail
// Immutable record of compliance actions for every client. Each entry is
// stamped with the checker version that produced it so an ASIC or Charter
// review can reconstruct exactly what rules applied at the time.

import { COMPLIANCE_CHECKER_VERSION } from "./compliance-checker";

export type AuditActor = "Brad" | "Colleen" | "System";

export type AuditActionType =
  | "check-run"
  | "blocker-resolved"
  | "warning-acknowledged"
  | "certificate-generated"
  | "sign-off-given";

export interface AuditEntry {
  id: string;
  clientId: string;
  action: AuditActionType;
  actor: AuditActor;
  timestamp: string;
  details: Record<string, unknown>;
  complianceVersion: string;
}

const STORE_KEY = "bmk-crm-compliance-audit-v1";

interface AuditStoreData {
  entries: AuditEntry[];
}

function load(): AuditStoreData {
  if (typeof window === "undefined") return { entries: [] };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as AuditStoreData) : { entries: [] };
  } catch {
    return { entries: [] };
  }
}

function save(state: AuditStoreData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota
  }
}

function makeId(): string {
  return `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function logAudit(
  clientId: string,
  action: AuditActionType,
  actor: AuditActor,
  details: Record<string, unknown> = {},
): AuditEntry {
  const entry: AuditEntry = {
    id: makeId(),
    clientId,
    action,
    actor,
    timestamp: new Date().toISOString(),
    details,
    complianceVersion: COMPLIANCE_CHECKER_VERSION,
  };
  const store = load();
  store.entries.push(entry);
  save(store);
  // Durable copy: append to the server's encrypted audit store. Fire and
  // forget — localStorage keeps the UI instant, the server copy is the
  // permanent record that survives browser and machine changes.
  if (typeof window !== "undefined") {
    void fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    }).catch(() => {
      // Offline or backend down — the local copy still exists.
    });
  }
  return entry;
}

export function getAuditTrail(clientId: string): AuditEntry[] {
  const all = load().entries.filter((e) => e.clientId === clientId);
  const seed = SEED_AUDIT[clientId] ?? [];
  const merged = [...seed, ...all];
  return merged.sort(
    (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

export function getSignOff(clientId: string): AuditEntry | undefined {
  return getAuditTrail(clientId).find((e) => e.action === "sign-off-given");
}

export const ACTION_LABELS: Record<AuditActionType, string> = {
  "check-run": "Compliance check run",
  "blocker-resolved": "Blocker resolved",
  "warning-acknowledged": "Warning acknowledged",
  "certificate-generated": "Certificate generated",
  "sign-off-given": "Adviser sign-off given",
};

// ── Seed audit trail for demo clients ───────────────────────────────────────

const SEED_AUDIT: Record<string, AuditEntry[]> = {
  "sarah-mitchell": [
    {
      id: "seed-sm-1",
      clientId: "sarah-mitchell",
      action: "check-run",
      actor: "Brad",
      timestamp: "2026-05-26T09:14:00.000Z",
      details: { score: 78, blockers: 0, warnings: 1 },
      complianceVersion: "1.0.0",
    },
    {
      id: "seed-sm-2",
      clientId: "sarah-mitchell",
      action: "warning-acknowledged",
      actor: "Brad",
      timestamp: "2026-05-26T09:22:00.000Z",
      details: {
        warning: "Income protection not assessed",
        note: "Flagged for review at upcoming meeting.",
      },
      complianceVersion: "1.0.0",
    },
    {
      id: "seed-sm-3",
      clientId: "sarah-mitchell",
      action: "sign-off-given",
      actor: "Brad",
      timestamp: "2026-05-26T09:35:00.000Z",
      details: {
        score: 78,
        acknowledgement:
          "Best interests duty met. Risk profile to be confirmed at meeting.",
      },
      complianceVersion: "1.0.0",
    },
  ],
  "james-fiona-carr": [
    {
      id: "seed-jfc-1",
      clientId: "james-fiona-carr",
      action: "check-run",
      actor: "Brad",
      timestamp: "2026-05-24T11:02:00.000Z",
      details: { score: 88, blockers: 0, warnings: 1 },
      complianceVersion: "1.0.0",
    },
    {
      id: "seed-jfc-2",
      clientId: "james-fiona-carr",
      action: "certificate-generated",
      actor: "Colleen",
      timestamp: "2026-05-24T11:15:00.000Z",
      details: { format: "PDF" },
      complianceVersion: "1.0.0",
    },
  ],
  "helen-davies": [
    {
      id: "seed-hd-1",
      clientId: "helen-davies",
      action: "check-run",
      actor: "Brad",
      timestamp: "2026-05-22T14:48:00.000Z",
      details: { score: 62, blockers: 0, warnings: 0, missing: 2 },
      complianceVersion: "1.0.0",
    },
  ],
  "tony-nguyen": [
    {
      id: "seed-tn-1",
      clientId: "tony-nguyen",
      action: "check-run",
      actor: "Brad",
      timestamp: "2026-05-25T16:30:00.000Z",
      details: { score: 71, blockers: 1 },
      complianceVersion: "1.0.0",
    },
  ],
};
