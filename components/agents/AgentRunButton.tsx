"use client";

import { useState, useTransition } from "react";
import type { AgentId } from "@/lib/agents/types";
import { cn } from "@/lib/utils";

export function AgentRunButton({
  agentId,
  clientId,
  label = "Run",
  className,
}: {
  agentId: AgentId;
  clientId?: string;
  label?: string;
  className?: string;
}) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          setStatus("idle");
          const res = await fetch("/api/agents/run", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ agentId, clientId, force: true }),
          });
          setStatus(res.ok ? "success" : "error");
        })
      }
      className={cn(
        "inline-flex h-8 items-center justify-center rounded-md border border-gold/25 bg-gold/10 px-3 text-[11px] font-semibold text-gold transition hover:border-gold/45 hover:bg-gold/15 disabled:cursor-wait disabled:opacity-60",
        status === "success" && "border-emerald-400/30 bg-success/10 text-success",
        status === "error" && "border-orange-400/35 bg-warning/10 text-warning",
        className,
      )}
    >
      {isPending ? "Running" : status === "success" ? "Updated" : status === "error" ? "Retry" : label}
    </button>
  );
}
