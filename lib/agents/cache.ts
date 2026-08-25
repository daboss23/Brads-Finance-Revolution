import { createHash } from "crypto";
import type { AgentId, AgentOutput } from "@/lib/agents/types";

type CacheEntry = {
  agentId: AgentId;
  inputHash: string;
  output: AgentOutput;
  createdAt: number;
  expiresAt: number | null;
};

const cache = new Map<string, CacheEntry>();

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(",")}}`;
}

export function hashAgentInput(input: unknown): string {
  return createHash("sha256").update(stableStringify(input)).digest("hex");
}

export function getAgentCache(agentId: AgentId, inputHash: string): AgentOutput | null {
  const entry = cache.get(`${agentId}:${inputHash}`);
  if (!entry) return null;
  if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
    cache.delete(`${agentId}:${inputHash}`);
    return null;
  }
  return entry.output;
}

export function setAgentCache(
  agentId: AgentId,
  inputHash: string,
  output: AgentOutput,
  ttlMs: number | null,
) {
  cache.set(`${agentId}:${inputHash}`, {
    agentId,
    inputHash,
    output,
    createdAt: Date.now(),
    expiresAt: ttlMs === null ? null : Date.now() + ttlMs,
  });
}

export function clearAgentCache(agentId?: AgentId) {
  if (!agentId) {
    cache.clear();
    return;
  }
  for (const key of Array.from(cache.keys())) {
    if (key.startsWith(`${agentId}:`)) cache.delete(key);
  }
}
