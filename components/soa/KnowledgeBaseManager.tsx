"use client";

import { useEffect, useRef, useState } from "react";
import {
  Upload,
  FileText,
  CheckCircle2,
  Loader2,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import {
  AUTHOR_LABEL,
  AUTHOR_WEIGHT,
  addTrainingDoc,
  getCorpusStats,
  listTrainingDocs,
  removeTrainingDoc,
  setTrainingDocStatus,
  type AuthorTag,
  type CorpusStats,
  type TrainingDoc,
} from "@/lib/soa/training-corpus";
import { cn } from "@/lib/utils";

const TAG_OPTIONS: AuthorTag[] = [
  "written-by-brad",
  "paraplanner-reviewed",
  "offshore-paraplanner",
];

const STATUS_ICON: Record<TrainingDoc["status"], React.ElementType> = {
  queued: Loader2,
  extracting: Loader2,
  indexed: CheckCircle2,
  failed: AlertTriangle,
};

const STATUS_TONE: Record<TrainingDoc["status"], string> = {
  queued: "text-muted-foreground/70",
  extracting: "text-warning",
  indexed: "text-success",
  failed: "text-red-400",
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function KnowledgeBaseManager() {
  const [docs, setDocs] = useState<TrainingDoc[]>([]);
  const [stats, setStats] = useState<CorpusStats>({
    totalDocs: 0,
    bradAuthored: 0,
    paraplannerReviewed: 0,
    offshore: 0,
    weightedTotal: 0,
    voiceConfidence: 0,
    estimatedQuality: 0,
  });
  const [selectedTag, setSelectedTag] = useState<AuthorTag>("written-by-brad");
  const [dragActive, setDragActive] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  function refresh() {
    setDocs(listTrainingDocs());
    setStats(getCorpusStats());
  }

  useEffect(() => {
    refresh();
  }, []);

  function processFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".pdf")) return;
    const doc = addTrainingDoc({
      filename: file.name,
      sizeBytes: file.size,
      authorTag: selectedTag,
    });
    refresh();
    setTimeout(() => {
      setTrainingDocStatus(doc.id, "extracting");
      refresh();
    }, 400);
    setTimeout(() => {
      setTrainingDocStatus(doc.id, "indexed");
      refresh();
    }, 1600);
  }

  function onFiles(files: FileList | null) {
    if (!files) return;
    for (const f of Array.from(files)) processFile(f);
    if (fileInput.current) fileInput.current.value = "";
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);
    onFiles(e.dataTransfer.files);
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total Documents" value={String(stats.totalDocs)} />
        <Stat
          label="Brad Authored"
          value={String(stats.bradAuthored)}
          accent
        />
        <Stat
          label="Voice Confidence"
          value={`${stats.voiceConfidence}%`}
        />
        <Stat
          label="Estimated Quality"
          value={`${stats.estimatedQuality}%`}
        />
      </div>

      {/* Author tag selector */}
      <div className="rounded-lg glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border/60 bg-black/25">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Tag uploads as
          </h3>
        </div>
        <div className="px-6 py-5 flex flex-wrap gap-2">
          {TAG_OPTIONS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={cn(
                "rounded px-3 py-1.5 text-[12px] font-medium border transition-colors",
                selectedTag === tag
                  ? "border-gold/45 bg-gold/10 text-gold"
                  : "border-border bg-card text-foreground/75 hover:text-foreground hover:border-border/90",
              )}
            >
              {AUTHOR_LABEL[tag]}{" "}
              <span className="opacity-65">· {AUTHOR_WEIGHT[tag]}x</span>
            </button>
          ))}
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        className={cn(
          "rounded-lg border-2 border-dashed px-8 py-10 text-center transition-colors",
          dragActive
            ? "border-gold/55 bg-gold/[0.04]"
            : "border-border/65 bg-card",
        )}
      >
        <div className="flex flex-col items-center gap-3">
          <Upload className="h-6 w-6 text-muted-foreground/70" />
          <p className="text-[14px] font-medium text-foreground">
            Drop completed SOA PDFs here, or browse to upload
          </p>
          <p className="text-[12px] text-muted-foreground/75 max-w-[420px] leading-relaxed">
            Each document is processed for writing style, sentence patterns,
            reasoning structure and compliance language. Documents tagged{" "}
            <span className="text-gold">Written by Brad</span> are weighted 3x in
            voice training.
          </p>
          <button
            onClick={() => fileInput.current?.click()}
            className="mt-2 inline-flex items-center gap-2 rounded border border-gold/40 bg-gold/10 px-3 py-1.5 text-[12px] font-medium text-gold hover:border-gold/60 transition-colors"
          >
            <Upload className="h-3 w-3" />
            Browse Files
          </button>
          <input
            ref={fileInput}
            type="file"
            multiple
            accept="application/pdf"
            onChange={(e) => onFiles(e.target.files)}
            className="hidden"
          />
        </div>
      </div>

      {/* Document list */}
      <div className="rounded-lg glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border/60 bg-black/25 flex items-center justify-between">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Training Corpus
          </h3>
          <span className="text-[11px] text-muted-foreground/65 tabular-nums">
            {docs.length} document{docs.length === 1 ? "" : "s"}
          </span>
        </div>
        {docs.length === 0 ? (
          <div className="px-6 py-10 text-center text-[13px] text-muted-foreground/65">
            No documents in the corpus yet. Upload your first SOA above.
          </div>
        ) : (
          <ul className="divide-y divide-border/40">
            {docs.map((doc) => {
              const Icon = STATUS_ICON[doc.status];
              return (
                <li key={doc.id} className="px-6 py-4 flex items-center gap-4">
                  <FileText className="h-4 w-4 text-muted-foreground/75 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-medium text-foreground truncate">
                      {doc.filename}
                    </p>
                    <p className="text-[11.5px] text-muted-foreground/75 mt-0.5">
                      {AUTHOR_LABEL[doc.authorTag]} ·{" "}
                      {formatSize(doc.sizeBytes)} ·{" "}
                      {new Date(doc.uploadedAt).toLocaleDateString("en-AU", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 text-[11.5px] font-medium",
                      STATUS_TONE[doc.status],
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-3 w-3",
                        (doc.status === "queued" || doc.status === "extracting") &&
                          "animate-spin",
                      )}
                    />
                    {doc.status}
                  </span>
                  <button
                    onClick={() => {
                      removeTrainingDoc(doc.id);
                      refresh();
                    }}
                    className="rounded p-1 text-muted-foreground/55 hover:text-red-400 hover:bg-white/[0.03] transition-colors"
                    title="Remove document"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card px-5 py-5",
        accent ? "border-gold/30" : "border-border",
      )}
    >
      <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-muted-foreground/85 mb-2">
        {label}
      </p>
      <p
        className={cn(
          "text-[26px] font-semibold tracking-tight tabular-nums",
          accent ? "text-gold" : "text-foreground",
        )}
      >
        {value}
      </p>
    </div>
  );
}
