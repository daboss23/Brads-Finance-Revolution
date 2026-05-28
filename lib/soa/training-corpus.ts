// Tracks uploaded SOA documents that train Brad's voice. Stored client side
// for the Phase 4 demo; moves to object storage + vector index in Phase 5.

export type AuthorTag =
  | "written-by-brad"
  | "paraplanner-reviewed"
  | "offshore-paraplanner";

export const AUTHOR_LABEL: Record<AuthorTag, string> = {
  "written-by-brad": "Written by Brad",
  "paraplanner-reviewed": "Paraplanner reviewed",
  "offshore-paraplanner": "Offshore paraplanner",
};

export const AUTHOR_WEIGHT: Record<AuthorTag, number> = {
  "written-by-brad": 3,
  "paraplanner-reviewed": 2,
  "offshore-paraplanner": 1,
};

export type ProcessingStatus = "queued" | "extracting" | "indexed" | "failed";

export interface TrainingDoc {
  id: string;
  filename: string;
  sizeBytes: number;
  authorTag: AuthorTag;
  uploadedAt: string;
  status: ProcessingStatus;
}

const STORE_KEY = "bmk-crm-training-corpus-v1";

interface CorpusData {
  docs: TrainingDoc[];
}

function load(): CorpusData {
  if (typeof window === "undefined") return { docs: [] };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as CorpusData) : { docs: [] };
  } catch {
    return { docs: [] };
  }
}

function save(state: CorpusData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function makeId(): string {
  return `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function listTrainingDocs(): TrainingDoc[] {
  return [...load().docs].sort(
    (a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
  );
}

export function addTrainingDoc(input: {
  filename: string;
  sizeBytes: number;
  authorTag: AuthorTag;
}): TrainingDoc {
  const doc: TrainingDoc = {
    id: makeId(),
    filename: input.filename,
    sizeBytes: input.sizeBytes,
    authorTag: input.authorTag,
    uploadedAt: new Date().toISOString(),
    status: "queued",
  };
  const state = load();
  state.docs.push(doc);
  save(state);
  return doc;
}

export function setTrainingDocStatus(id: string, status: ProcessingStatus): void {
  const state = load();
  const target = state.docs.find((d) => d.id === id);
  if (target) {
    target.status = status;
    save(state);
  }
}

export function removeTrainingDoc(id: string): void {
  const state = load();
  state.docs = state.docs.filter((d) => d.id !== id);
  save(state);
}

export interface CorpusStats {
  totalDocs: number;
  bradAuthored: number;
  paraplannerReviewed: number;
  offshore: number;
  weightedTotal: number;
  voiceConfidence: number;
  estimatedQuality: number;
}

export function getCorpusStats(): CorpusStats {
  const docs = load().docs;
  const totalDocs = docs.length;
  const bradAuthored = docs.filter(
    (d) => d.authorTag === "written-by-brad",
  ).length;
  const paraplannerReviewed = docs.filter(
    (d) => d.authorTag === "paraplanner-reviewed",
  ).length;
  const offshore = docs.filter((d) => d.authorTag === "offshore-paraplanner").length;
  const weightedTotal = docs.reduce(
    (sum, d) => sum + AUTHOR_WEIGHT[d.authorTag],
    0,
  );
  // Voice fully calibrated at ~150 weighted points.
  const voiceConfidence = Math.min(100, Math.round((weightedTotal / 150) * 100));
  // Quality scales with diversity of authors plus volume.
  const diversity =
    [bradAuthored, paraplannerReviewed, offshore].filter((n) => n > 0).length;
  const estimatedQuality = Math.min(
    100,
    Math.round(voiceConfidence * 0.7 + diversity * 10),
  );
  return {
    totalDocs,
    bradAuthored,
    paraplannerReviewed,
    offshore,
    weightedTotal,
    voiceConfidence,
    estimatedQuality,
  };
}
