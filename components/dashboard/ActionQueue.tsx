import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ACTION_QUEUE, PRIORITY_META, getAgent } from "@/lib/agents";
import { cn } from "@/lib/utils";

export function ActionQueue() {
  return (
    <div className="glass-panel h-full overflow-hidden">
      <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-white/[0.06]">
        <p className="cmd-label text-gold/90">Action Queue</p>
        <span className="inline-flex items-center rounded-full bg-white/[0.04] border border-border/70 px-2 py-0.5 text-[11px] font-medium text-muted-foreground/80 tabular-nums">
          {ACTION_QUEUE.length}
        </span>
      </div>
      <ul className="divide-y divide-white/[0.05]">
        {ACTION_QUEUE.map((item) => {
          const priority = PRIORITY_META[item.priority];
          const agent = getAgent(item.agentId);
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                className="group flex items-start gap-4 px-7 py-4 transition-colors hover:bg-white/[0.02]"
              >
                <span
                  className={cn(
                    "mt-0.5 shrink-0 inline-flex items-center rounded-md border px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.1em]",
                    priority.bg,
                    priority.border,
                    priority.text
                  )}
                >
                  {priority.label}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] text-foreground/85 leading-snug tracking-tight">
                    {item.label}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground/55 uppercase tracking-[0.08em] font-semibold">
                    {agent?.name}
                  </p>
                </div>
                <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/40 group-hover:text-gold transition-colors" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
