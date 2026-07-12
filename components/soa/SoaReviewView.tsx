"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import type { SoaDocument } from "@/lib/soa/soa-template";
import { SOA_STATUS_COPY } from "@/lib/soa/soa-template";
import { getSoa, saveSoa } from "@/lib/soa/soa-store";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SoaSection } from "./SoaSection";
import { SoaReviewPanel } from "./SoaReviewPanel";

interface Props {
  initial: SoaDocument;
  strategies: string[];
}

const STATUS_TONE: Record<string, string> = {
  green: "bg-success/15 text-success border-success/35",
  amber: "bg-warning/[0.15] text-warning border-warning/35",
  blue: "bg-blue-accent/15 text-blue-accent border-blue-accent/35",
  neutral: "bg-zinc-700/30 text-zinc-300 border-zinc-600/50",
};

export function SoaReviewView({ initial, strategies }: Props) {
  const [doc, setDoc] = useState<SoaDocument>(initial);

  useEffect(() => {
    // Pick up any local edits on mount. If none exist, seed localStorage
    // with the server rendered initial so subsequent edits persist.
    const live = getSoa(initial.clientId);
    // Reject legacy or corrupted cache entries stored under the wrong client
    // key. The server-rendered document is authoritative for identity.
    if (
      live?.clientId === initial.clientId &&
      live.clientName === initial.clientName
    ) {
      setDoc(live);
    } else {
      saveSoa(initial);
      setDoc(initial);
    }
  }, [initial]);

  const status = SOA_STATUS_COPY[doc.status];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/10 border border-gold/30">
            <FileText className="h-4 w-4 text-gold" />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-gold/90">
              Statement of Advice
            </p>
            <h2 className="text-[20px] font-semibold tracking-tight text-foreground">
              {doc.clientName}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={cn(STATUS_TONE[status.tone])}>{status.label}</Badge>
          <span className="text-[11.5px] text-muted-foreground/75">
            Generated{" "}
            {new Date(doc.generatedAt).toLocaleString("en-AU", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}{" "}
            · {doc.modelVersion}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-8 items-start">
        <div className="space-y-5">
          {doc.sections.map((section) => (
            <SoaSection
              key={section.id}
              doc={doc}
              section={section}
              strategies={strategies}
              onChange={setDoc}
            />
          ))}
        </div>
        <div className="sticky top-8">
          <SoaReviewPanel doc={doc} onChange={setDoc} />
        </div>
      </div>
    </div>
  );
}
