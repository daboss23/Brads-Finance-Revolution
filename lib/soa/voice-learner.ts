// Voice learning system. Every time Brad edits a generated section we
// record the before / after pair so future generations can adapt to his
// voice. Stored locally for now; will move to a vector store in Phase 5.
// All functions guard against SSR by checking for `window` before touching
// localStorage.

import type { SectionId } from "./soa-template";
import type { StrategyKey } from "../forms";

const STORE_KEY = "bmk-crm-voice-learning-v1";
const FULL_CALIBRATION_TARGET = 50;

export interface VoiceEdit {
  id: string;
  clientId: string;
  sectionId: SectionId;
  before: string;
  after: string;
  strategies: StrategyKey[];
  recordedAt: string;
}

export interface VoiceStats {
  plansGenerated: number;
  editsRecorded: number;
  voiceMatchScore: number;
  estimatedPlansUntilCalibrated: number;
}

interface VoiceStoreData {
  edits: VoiceEdit[];
  generatedClientIds: string[];
}

function load(): VoiceStoreData {
  if (typeof window === "undefined") return { edits: [], generatedClientIds: [] };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw
      ? (JSON.parse(raw) as VoiceStoreData)
      : { edits: [], generatedClientIds: [] };
  } catch {
    return { edits: [], generatedClientIds: [] };
  }
}

function save(state: VoiceStoreData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota
  }
}

function makeId(): string {
  return `edit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function recordPlanGenerated(clientId: string): void {
  const state = load();
  if (!state.generatedClientIds.includes(clientId)) {
    state.generatedClientIds.push(clientId);
    save(state);
  }
}

export function recordEdit(input: {
  clientId: string;
  sectionId: SectionId;
  before: string;
  after: string;
  strategies: StrategyKey[];
}): void {
  if (input.before.trim() === input.after.trim()) return;
  const state = load();
  state.edits.push({
    id: makeId(),
    ...input,
    recordedAt: new Date().toISOString(),
  });
  save(state);
}

export function getEditsForSection(sectionId: SectionId): VoiceEdit[] {
  return load().edits.filter((e) => e.sectionId === sectionId);
}

export function getStats(): VoiceStats {
  // Seed with two synthetic prior plans so the dashboard does not start
  // showing zero state for new demo accounts.
  const state = load();
  const plans = Math.max(state.generatedClientIds.length, 2);
  const edits = state.edits.length;
  const score = Math.min(100, Math.round((edits / FULL_CALIBRATION_TARGET) * 100));
  const remaining = Math.max(0, FULL_CALIBRATION_TARGET - edits);
  // Roughly four meaningful edits per generated plan.
  const plansUntilCalibrated = Math.ceil(remaining / 4);
  return {
    plansGenerated: plans,
    editsRecorded: edits,
    voiceMatchScore: score,
    estimatedPlansUntilCalibrated: plansUntilCalibrated,
  };
}

export function recentEdits(limit = 5): VoiceEdit[] {
  return [...load().edits]
    .sort(
      (a, b) =>
        new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
    )
    .slice(0, limit);
}
