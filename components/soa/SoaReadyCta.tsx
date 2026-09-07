"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Download, FileCheck2 } from "lucide-react";
import {
  SOA_GENERATED_EVENT,
  type SoaGeneratedDetail,
} from "@/lib/soa/generation-events";

interface Props {
  clientId: string;
  clientName: string;
}

/**
 * Sits in the generate page's right rail and stays empty until the runner
 * finishes. The CTA is the end of the journey, so it never disappears and
 * never moves the page under Brad.
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
