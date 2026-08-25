import { mirrorToServer, pullFromServer } from "./state-sync";

const STORAGE_KEY = "bmk-crm-review-v1";

interface ReviewStore {
  checkedSections: Record<string, string[]>;
  notes: Record<string, string>;
  bradReviewed: Record<string, boolean>;
  factFindCompleted: Record<string, boolean>;
}

const EMPTY: ReviewStore = {
  checkedSections: {},
  notes: {},
  bradReviewed: {},
  factFindCompleted: {},
};

function load(): ReviewStore {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

function save(state: ReviewStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  // Durable encrypted copy on the server — survives browser resets.
  mirrorToServer("review-store", "all", state);
}

// Seed the local cache from the encrypted server copy when this browser
// has no state yet (new machine, cleared storage).
if (typeof window !== "undefined" && !localStorage.getItem(STORAGE_KEY)) {
  void pullFromServer<ReviewStore>("review-store", "all").then((remote) => {
    if (remote && !localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
    }
  });
}

export function getReviewStore(): ReviewStore {
  return load();
}

export function getCheckedSections(clientId: string): string[] {
  return load().checkedSections[clientId] ?? [];
}

export function setCheckedSections(clientId: string, ids: string[]): void {
  const state = load();
  state.checkedSections[clientId] = ids;
  save(state);
}

export function getNotes(clientId: string): string {
  return load().notes[clientId] ?? "";
}

export function setNotes(clientId: string, notes: string): void {
  const state = load();
  state.notes[clientId] = notes;
  save(state);
}

export function isBradReviewed(clientId: string): boolean {
  return load().bradReviewed[clientId] ?? false;
}

export function markBradReviewed(clientId: string, reviewed: boolean): void {
  const state = load();
  state.bradReviewed[clientId] = reviewed;
  save(state);
}

export function markFactFindCompleted(clientId: string): void {
  const state = load();
  state.factFindCompleted[clientId] = true;
  save(state);
}

export function isFactFindCompleted(clientId: string): boolean {
  return load().factFindCompleted[clientId] ?? false;
}
