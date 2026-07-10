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
            <div
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                isActive
                  ? stage === "reviewed"
                    ? "bg-success"
                    : stage === "complete"
                    ? "bg-gold"
                    : "bg-blue-accent"
                  : isPast
                  ? "bg-success/55"
                  : "bg-border"
              )}
            />
            {i < stages.length - 1 && (
              <div
                className={cn(
                  "h-px w-8",
                  isPast ? "bg-success/35" : "bg-border/50"
                )}
              />
            )}
          </div>
        );
      })}
      <span
        className={cn(
          "ml-3 text-[11px] font-medium whitespace-nowrap tracking-tight",
          stage === "reviewed"
            ? "text-success/95"
            : stage === "complete"
            ? "text-gold/85"
            : "text-blue-accent/85"
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
    <div className="rounded-xl border border-border/70 bg-card overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border/60 bg-[hsl(222_24%_6%)]">
            {["Client", "Progress", "Status", "Fact Find Stage", "Next Action", "Meeting", ""].map((h) => (
              <th
                key={h}
                className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/65"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/55">
          {CLIENTS.map((client) => {
            const stage = getStage(client.id, client.progress, client.status, bradReviewed);
            return (
              <tr
                key={client.id}
                className="hover:bg-white/[0.025] transition-colors duration-150 group"
              >
                <td className="pl-6 pr-10 py-5 align-middle">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted/80 border border-border/80 text-[11px] font-bold text-foreground/75 tracking-tight">
                      {client.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <span className="font-medium text-[13.5px] text-foreground tracking-tight">
                      {client.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 align-middle">
                  <div className="flex items-center gap-3">
                    <progress
                      value={client.progress}
                      max={100}
                      className={cn(
                        "bmk-progress w-28",
                        client.status === "in-progress" ? "bmk-progress-blue" : ""
                      )}
                    />
                    <span className="text-[12px] text-muted-foreground/85 w-9 tabular-nums shrink-0">
                      {client.progress}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 align-middle">
                  <Badge className={STATUS_CONFIG[client.status].className}>
                    {STATUS_CONFIG[client.status].label}
                  </Badge>
                </td>
                <td className="px-6 py-5 align-middle">
                  <StageIndicator stage={stage} />
                </td>
                <td className="px-6 py-5 align-middle max-w-[220px]">
                  <p className="text-[13px] text-muted-foreground/85 truncate tracking-tight">
                    {client.nextAction}
                  </p>
                </td>
                <td className="px-6 py-5 align-middle">
                  <span className="text-[13px] text-muted-foreground/85 whitespace-nowrap tabular-nums">
                    {client.meetingDate ?? "—"}
                  </span>
                </td>
                <td className="pr-5 pl-2 py-5 align-middle">
                  <Link
                    href={`/clients/${client.id}`}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center h-8 w-8 rounded-md hover:bg-white/[0.06]"
                  >
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/85" />
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
