"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Copy,
  Send,
  ExternalLink,
  CheckCircle2,
  Link as LinkIcon,
} from "lucide-react";
import { FACT_FIND_LINKS, LINK_STATUS_CONFIG } from "@/lib/athena-data";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  title?: string;
  description?: string;
}

/**
 * The single fact find link table. Athena and the Fact Find overview both
 * render it, so the copy, resend and open actions can never drift apart
 * between the two screens.
 */
export function FactFindLinksTable({
  title = "Fact Find Links",
  description = "All client fact find links — manage, resend, and monitor progress",
}: Props) {
  const [copied, setCopied] = useState<string | null>(null);
  const [resent, setResent] = useState<string | null>(null);

  function copyLink(token: string) {
    const url = `${window.location.origin}/onboarding/${token}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  }

  function resendLink(token: string) {
    setResent(token);
    setTimeout(() => setResent(null), 2500);
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="text-[14px] font-semibold text-foreground">{title}</h2>
          <p className="text-[12px] text-muted-foreground mt-1">
            {description}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-card">
              {[
                "Client",
                "Link Status",
                "Progress",
                "Sent",
                "Last Activity",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/80">
            {FACT_FIND_LINKS.map((link) => (
              <tr
                key={link.token}
                className="hover:bg-gold/[0.04] transition-colors duration-150 group"
              >
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted border border-border/80 text-[11px] font-bold text-foreground/70 tracking-tight">
                      {link.clientName
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div>
                      <p className="font-medium text-[13px] text-foreground">
                        {link.clientName}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {link.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <Badge className={LINK_STATUS_CONFIG[link.status].className}>
                    {LINK_STATUS_CONFIG[link.status].label}
                  </Badge>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2.5">
                    <progress
                      value={link.progress}
                      max={100}
                      className={cn(
                        "bmk-progress w-24",
                        link.status === "in-progress"
                          ? "bmk-progress-blue"
                          : "",
                      )}
                    />
                    <span className="text-[12px] text-muted-foreground tabular-nums w-8">
                      {link.progress}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-[13px] text-muted-foreground">
                    {link.sentDate ?? "—"}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <span className="text-[13px] text-muted-foreground">
                    {link.lastActivity ?? "—"}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    {/* Copy link */}
                    <button
                      onClick={() => copyLink(link.token)}
                      title="Copy fact find link"
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded border px-2.5 py-1.5 text-[11px] font-medium transition-colors duration-150",
                        copied === link.token
                          ? "border-success/30 bg-success/[0.08] text-success"
                          : "border-border/70 text-muted-foreground hover:border-border hover:text-foreground/80 hover:bg-white/[0.04]",
                      )}
                    >
                      {copied === link.token ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      {copied === link.token ? "Copied" : "Copy"}
                    </button>

                    {/* Resend */}
                    <button
                      onClick={() => resendLink(link.token)}
                      title="Resend fact find link"
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded border px-2.5 py-1.5 text-[11px] font-medium transition-all duration-150",
                        resent === link.token
                          ? "border-blue-800/50 bg-blue-950/40 text-blue-400"
                          : "border-border/70 text-muted-foreground hover:border-border hover:text-foreground/80 hover:bg-white/[0.04]",
                      )}
                    >
                      <Send className="h-3 w-3" />
                      {resent === link.token ? "Sent" : "Resend"}
                    </button>

                    {/* Open client experience */}
                    <Link
                      href={`/onboarding/${link.token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open client fact find experience"
                      className="inline-flex items-center gap-1.5 rounded border border-gold/30 bg-gold/[0.07] px-2.5 py-1.5 text-[11px] font-medium text-gold/80 hover:bg-gold/[0.12] hover:text-gold transition-colors duration-150"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Open
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Link format note */}
      <div className="mt-4 flex items-center gap-2 px-1">
        <LinkIcon className="h-3 w-3 text-muted-foreground/35 shrink-0" />
        <p className="text-[11px] text-muted-foreground/35">
          Links follow the format:{" "}
          <span className="font-mono text-muted-foreground/50">
            /onboarding/[token]
          </span>
        </p>
      </div>
    </div>
  );
}
