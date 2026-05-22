"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { CLIENTS, STATUS_CONFIG } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { getReviewStore } from "@/lib/review-store";
import { cn } from "@/lib/utils";

type FactFindStage = "collecting" | "complete" | "reviewed";

function getStage(
  clientId: string,
  progress: number,
  status: string,
  bradReviewed: Record<string, boolean>
): FactFindStage {
  if (bradReviewed[clientId]) return "reviewed";
  if (progress === 100 || status === "complete" || status === "ready-for-meeting") return "complete";
  return "collecting";
}

function StageIndicator({ stage }: { stage: FactFindStage }) {
  const stages: { key: FactFindStage; label: string }[] = [
    { key: "collecting", label: "In Progress" },
    { key: "complete", label: "Complete" },
    { key: "reviewed", label: "Brad Reviewed" },
  ];

  const activeIdx = stages.findIndex((s) => s.key === stage);

  return (
    <div className="flex items-center gap-0">
      {stages.map((s, i) => {
        const isPast = i < activeIdx;
        const isActive = i === activeIdx;
        return (
          <div key={s.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  isActive
                    ? stage === "reviewed"
                      ? "bg-emerald-400"
                      : stage === "complete"
                      ? "bg-gold"
                      : "bg-blue-accent"
                    : isPast
                    ? "bg-emerald-400/60"
                    : "bg-border"
                )}
              />
            </div>
            {i < stages.length - 1 && (
              <div
                className={cn(
                  "h-px w-8",
                  isPast ? "bg-emerald-400/40" : "bg-border/50"
                )}
              />
            )}
          </div>
        );
      })}
      <span
        className={cn(
          "ml-3 text-[11px] font-medium whitespace-nowrap",
          stage === "reviewed"
            ? "text-emerald-400"
            : stage === "complete"
            ? "text-gold/80"
            : "text-blue-accent/80"
        )}
      >
        {stages[activeIdx].label}
      </span>
    </div>
  );
}

export function PipelineTable() {
  const [bradReviewed, setBradReviewed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const store = getReviewStore();
    setBradReviewed(store.bradReviewed ?? {});
  }, []);

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border" style={{ background: "hsl(222 28% 7%)" }}>
            {["Client", "Progress", "Status", "Fact Find Stage", "Next Action", "Meeting", ""].map((h) => (
              <th
                key={h}
                className="px-6 py-5 text-left text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {CLIENTS.map((client) => {
            const stage = getStage(client.id, client.progress, client.status, bradReviewed);
            return (
              <tr
                key={client.id}
                className="hover:bg-gold/[0.06] transition-colors duration-150 group"
              >
                <td className="pl-6 pr-10 py-6 align-middle">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted border border-border text-[11px] font-bold text-foreground/70 tracking-tight">
                      {client.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <span className="font-medium text-[13px] text-foreground">
                      {client.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-6 align-middle">
                  <div className="flex items-center gap-2.5">
                    <progress
                      value={client.progress}
                      max={100}
                      className={cn(
                        "bmk-progress w-28",
                        client.status === "in-progress" ? "bmk-progress-blue" : ""
                      )}
                    />
                    <span className="text-[12px] text-muted-foreground w-9 tabular-nums shrink-0">
                      {client.progress}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-6 align-middle">
                  <Badge className={STATUS_CONFIG[client.status].className}>
                    {STATUS_CONFIG[client.status].label}
                  </Badge>
                </td>
                <td className="px-6 py-6 align-middle">
                  <StageIndicator stage={stage} />
                </td>
                <td className="px-6 py-6 align-middle max-w-[220px]">
                  <p className="text-[13px] text-muted-foreground truncate">
                    {client.nextAction}
                  </p>
                </td>
                <td className="px-6 py-6 align-middle">
                  <span className="text-[13px] text-muted-foreground whitespace-nowrap">
                    {client.meetingDate ?? "—"}
                  </span>
                </td>
                <td className="px-6 py-6 align-middle">
                  <Link
                    href={`/clients/${client.id}`}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center h-7 w-7 rounded hover:bg-white/[0.08]"
                  >
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
