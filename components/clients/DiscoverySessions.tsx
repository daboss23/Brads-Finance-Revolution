"use client";

import { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Clock,
  Mic,
  MessageSquare,
  RadioTower,
  PauseCircle,
} from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { cn } from "@/lib/utils";
import type {
  DiscoverySession,
  DiscoverySessionStatus,
} from "@/lib/athena/discovery-sessions";

type Props = {
  sessions: DiscoverySession[];
};

const STATUS: Record<
  DiscoverySessionStatus,
  {
    /** Chip text, beside the session. */
    label: string;
    /** Standalone heading, where there is no session row to read it against. */
    heading: string;
    note: string;
    className: string;
    icon: React.ElementType;
  }
> = {
  completed: {
    label: "Completed",
    heading: "Discovery session completed",
    note: "Athena finished and submitted the fact find.",
    className: "text-success border-success/30",
    icon: CheckCircle2,
  },
  live: {
    label: "In session now",
    heading: "Discovery session in progress",
    note: "The client is answering right now. Refresh to see more.",
    className: "text-gold border-gold/35",
    icon: RadioTower,
  },
  paused: {
    label: "Paused",
    heading: "Discovery session paused",
    note: "Stopped partway. Their link still resumes from the next question.",
    className: "text-warning border-warning/30",
    icon: PauseCircle,
  },
  abandoned: {
    label: "Abandoned",
    heading: "Discovery session abandoned",
    note: "Stopped partway and too old to resume. A fresh link starts over.",
    className: "text-muted-foreground border-foreground/15",
    icon: Clock,
  },
};

function whenLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "unknown";
  return d.toLocaleString("en-AU", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

// Named in the order the client actually used them, because "voice, then text"
// and "text, then voice" mean different things to whoever reads this: the first
// is a client the live agent dropped, the second is one who chose to switch.
function channelLabel(channels: Array<"voice" | "text">): string {
  if (channels.length === 0) return "Session";
  const names = channels.map((c) => (c === "voice" ? "Voice" : "Text"));
  return names.length === 1 ? names[0] : `${names[0]}, then ${names[1].toLowerCase()}`;
}

function durationLabel(seconds?: number): string | null {
  if (!seconds || seconds < 1) return null;
  const mins = Math.round(seconds / 60);
  return mins < 1 ? "under a minute" : `${mins} min`;
}

// What Athena heard, whether or not the client ever reached the end.
//
// This is the panel that closes the gap the capture route opened. A client who
// stops at question six has already given us their income, their debts and
// their goals, and until this existed that conversation was written to the
// encrypted store and read by nobody. An abandoned session and a session that
// never happened looked identical from here, which is the one thing they must
// never look like.
export function DiscoverySessions({ sessions }: Props) {
  if (sessions.length === 0) {
    return (
      <GlassPanel padding="default" className="mb-5">
        <Header count={0} />
        <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground/75">
          No discovery session has started yet. Once the client opens their
          Athena link, every answer appears here as they give it, whether or not
          they reach the end.
        </p>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel padding="default" className="mb-5">
      <Header count={sessions.length} />
      <div className="mt-4 space-y-3">
        {sessions.map((session) => (
          <SessionRow key={session.threadId} session={session} />
        ))}
      </div>
    </GlassPanel>
  );
}

function Header({ count }: { count: number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="cmd-label text-gold/75">Discovery Sessions</p>
      {count > 0 && (
        <span className="text-[11px] tabular-nums text-muted-foreground/70">
          {count === 1 ? "1 session" : `${count} sessions`}
        </span>
      )}
    </div>
  );
}

function SessionRow({ session }: { session: DiscoverySession }) {
  const [open, setOpen] = useState(false);
  const status = STATUS[session.status];
  const StatusIcon = status.icon;
  const duration = durationLabel(session.durationSeconds);

  return (
    <div className="rounded-xl border border-foreground/[0.08] bg-foreground/[0.02]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-foreground/[0.03] rounded-xl"
      >
        <StatusIcon
          className={cn("mt-0.5 h-4 w-4 shrink-0", status.className.split(" ")[0])}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "glass-chip rounded-md border px-2 py-0.5 text-[11px] font-medium",
                status.className,
              )}
            >
              {status.label}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
              {session.channels[0] === "voice" ? (
                <Mic className="h-3 w-3" />
              ) : (
                <MessageSquare className="h-3 w-3" />
              )}
              {channelLabel(session.channels)}
            </span>
          </div>

          <p className="mt-2 text-[13px] text-foreground/85">
            <span className="font-medium tabular-nums">
              {session.answerCount}
            </span>{" "}
            {session.answerCount === 1 ? "answer" : "answers"} captured
            {duration ? ` over ${duration}` : ""}
          </p>

          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground/70">
            {status.note}
          </p>

          <p className="mt-1.5 text-[11px] text-muted-foreground/55">
            Started {whenLabel(session.startedAt)} · Last activity{" "}
            {whenLabel(session.lastActivityAt)}
            {session.resumeCount > 0 &&
              ` · Resumed ${session.resumeCount === 1 ? "once" : `${session.resumeCount} times`}`}
          </p>
        </div>

        <ChevronDown
          className={cn(
            "mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="border-t border-foreground/[0.07] px-4 py-3">
          {session.summary && (
            <p className="mb-3 rounded-lg bg-foreground/[0.03] px-3 py-2 text-[12px] leading-relaxed text-foreground/70">
              {session.summary}
            </p>
          )}
          <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
            {session.turns.map((turn, i) => (
              <div key={i}>
                <p
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-[0.14em]",
                    turn.role === "user"
                      ? "text-gold/70"
                      : "text-muted-foreground/55",
                  )}
                >
                  {turn.role === "user" ? "Client" : "Athena"}
                </p>
                <p className="mt-0.5 whitespace-pre-wrap text-[13px] leading-relaxed text-foreground/80">
                  {turn.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// The one line the client overview owes Brad.
//
// The full panel lives on the fact find review, which is not where anyone looks
// when a client has no fact find yet, and a client with no fact find is exactly
// the one whose abandoned session is worth knowing about. This says so where
// Brad already is, and gets out of the way when there is nothing unfinished.
export function UnfinishedSessionNotice({
  sessions,
  clientId,
}: Props & { clientId: string }) {
  const unfinished = sessions.find(
    (s) => s.status !== "completed" && s.answerCount > 0,
  );
  // A later completed session settles it: the client got there in the end.
  if (!unfinished || sessions.some((s) => s.status === "completed")) return null;

  const status = STATUS[unfinished.status];
  const StatusIcon = status.icon;

  // A session still running is news, not a warning. Only a stalled one gets the
  // amber treatment, so the colour keeps meaning something.
  const live = unfinished.status === "live";

  return (
    <div
      className={cn(
        "glass-panel overflow-hidden",
        live ? "glass-rim-gold" : "glass-rim-amber",
      )}
    >
      <div className="flex">
        <div
          className={cn(
            "w-[3px] shrink-0 bg-gradient-to-b",
            live
              ? "from-gold/70 to-gold/20"
              : "from-warning/70 to-warning/20",
          )}
        />
        <div className="flex-1 px-6 py-4">
          <div className="mb-2 flex items-center gap-2.5">
            <StatusIcon
              className={cn(
                "h-4 w-4 shrink-0",
                live ? "text-gold" : "text-warning",
              )}
            />
            <p
              className={cn(
                "text-[10px] font-bold uppercase tracking-[0.18em]",
                live ? "text-gold" : "text-warning",
              )}
            >
              {status.heading}
            </p>
          </div>
          <p className="text-[13px] leading-relaxed text-foreground/80">
            Athena captured{" "}
            <span className="font-medium tabular-nums">
              {unfinished.answerCount}
            </span>{" "}
            {unfinished.answerCount === 1 ? "answer" : "answers"} before this
            client stopped, last on {whenLabel(unfinished.lastActivityAt)}.{" "}
            {status.note}
          </p>
          <a
            href={`/clients/${clientId}/fact-find-review`}
            className="mt-2.5 inline-block text-[12px] font-medium text-gold hover:text-gold/80 transition-colors"
          >
            Read what they told her
          </a>
        </div>
      </div>
    </div>
  );
}
