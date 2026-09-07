"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Download, FileCheck2, RefreshCw, Send } from "lucide-react";
import {
  SOA_GENERATED_EVENT,
  requestSoaRegenerate,
  type SoaGeneratedDetail,
} from "@/lib/soa/generation-events";

interface Props {
  clientId: string;
  clientName: string;
}

/**
 * Sits in the generate page's right rail and stays empty until the runner
 * finishes. The CTA is the end of the journey, so it never disappears and
 * never moves the page under Brad. It carries the same actions as the review
 * panel, with the download promoted to the gold call to action.
 */
export function SoaReadyCta({ clientId, clientName }: Props) {
  const [ready, setReady] = useState<SoaGeneratedDetail | null>(null);

  useEffect(() => {
    function onGenerated(event: Event) {
      const detail = (event as CustomEvent<SoaGeneratedDetail>).detail;
      if (detail?.clientId === clientId) setReady(detail);
    }
    window.addEventListener(SOA_GENERATED_EVENT, onGenerated);
    return () => window.removeEventListener(SOA_GENERATED_EVENT, onGenerated);
  }, [clientId]);

  if (!ready) return null;

  const fileName = `${clientName.replace(/\s+/g, "-")}-soa.pdf`;

  return (
    <div className="soa-cta-enter rounded-lg glass-card glass-rim-gold overflow-hidden">
      <div className="px-5 py-4 border-b border-gold/20 bg-black/25 flex items-center gap-2.5">
        <FileCheck2 className="h-3.5 w-3.5 text-gold" />
        <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold/90">
          Statement of Advice Ready
        </h3>
      </div>
      <div className="px-5 py-5 space-y-4">
        <p className="text-[12.5px] leading-relaxed text-muted-foreground/85">
          {ready.sectionCount} sections generated for {clientName} · compliance
          score {ready.complianceScore}. The agent chain stays on screen for
          your records.
        </p>

        <a
          href={`/api/soa/${clientId}/pdf`}
          download={fileName}
          className="soa-cta-pulse flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-b from-gold-bright via-gold to-gold-dim px-5 py-3 text-[13px] font-semibold tracking-wide text-gold-foreground transition-transform hover:scale-[1.015] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
        >
          <Download className="h-4 w-4" />
          Download SOA as PDF
        </a>

        <div className="space-y-2.5 pt-1">
          <button
            onClick={() => requestSoaRegenerate(clientId)}
            title="Run the full agent chain again and produce a fresh draft"
            className="w-full inline-flex items-center justify-center gap-2 rounded border border-gold/35 bg-gold/[0.06] px-3 py-2 text-[12px] font-medium text-gold hover:border-gold/60 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Regenerate with agents
          </button>

          {/* Sending stays on the review page: it unlocks only once Brad has
              approved every section, which he does there, not here. */}
          <button
            disabled
            title="Approve every section on the review page before sending"
            className="w-full inline-flex items-center justify-center gap-2 rounded border border-border bg-card px-3 py-2 text-[12px] font-medium text-muted-foreground/55 cursor-not-allowed"
          >
            <Send className="h-3.5 w-3.5" />
            Send via DocuSign
          </button>

          <p className="text-[11px] text-muted-foreground/65 leading-relaxed">
            Approve every section on the review page to unlock sending. DocuSign
            integration is a stub for now and will be wired in Phase 5.
          </p>
        </div>

        <Link
          href={`/clients/${clientId}/soa`}
          className="block text-center text-[12px] text-muted-foreground hover:text-gold transition-colors"
        >
          Review and edit before sending
        </Link>
      </div>
    </div>
  );
}
