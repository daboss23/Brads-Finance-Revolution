"use client";

import type { StrategyKey } from "./forms";

const STORE_KEY = "bmk-crm-client-strategies-v1";

interface StrategyStoreData {
  approved: Record<string, StrategyKey[]>;
}

function load(): StrategyStoreData {
  if (typeof window === "undefined") return { approved: {} };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as StrategyStoreData) : { approved: {} };
  } catch {
    return { approved: {} };
  }
}

function save(state: StrategyStoreData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function getApprovedStrategies(clientId: string): StrategyKey[] {
  return load().approved[clientId] ?? [];
}

export function setApprovedStrategies(
  clientId: string,
  strategies: StrategyKey[],
): void {
  const s = load();
  s.approved[clientId] = strategies;
  save(s);
}

export function approveStrategy(clientId: string, key: StrategyKey): void {
  const current = getApprovedStrategies(clientId);
  if (current.includes(key)) return;
  setApprovedStrategies(clientId, [...current, key]);
}

export function unapproveStrategy(clientId: string, key: StrategyKey): void {
  const current = getApprovedStrategies(clientId);
  setApprovedStrategies(
    clientId,
    current.filter((k) => k !== key),
  );
}
