"use client";

import { useEffect, useState } from "react";
import { FileSignature } from "lucide-react";
import { getSoa } from "@/lib/soa/soa-store";
import { SOA_STATUS_COPY, type SoaDocument } from "@/lib/soa/soa-template";
import { cn } from "@/lib/utils";

const TONE_CLASS: Record<string, string> = {
  green: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30",
  amber: "text-amber-300 bg-amber-500/10 border-amber-500/30",
  blue: "text-blue-accent bg-blue-accent/10 border-blue-accent/30",
  neutral: "text-muted-foreground/80 bg-white/[0.04] border-border/55",
};

export function ClientSoaBadge({ clientId }: { clientId: string }) {
  const [doc, setDoc] = useState<SoaDocument | undefined>();

  useEffect(() => {
    setDoc(getSoa(clientId));
    const id = setInterval(() => setDoc(getSoa(clientId)), 2000);
    return () => clearInterval(id);
  }, [clientId]);

  if (!doc) return null;
  const status = SOA_STATUS_COPY[doc.status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium border tracking-tight",
        TONE_CLASS[status.tone],
      )}
    >
      <FileSignature className="h-2.5 w-2.5" />
      SOA · {status.label}
    </span>
  );
}
