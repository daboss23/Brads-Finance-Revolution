import Link from "next/link";
import { ArrowLeft, Database } from "lucide-react";
import { KnowledgeBaseManager } from "@/components/soa/KnowledgeBaseManager";

export default function KnowledgeBasePage() {
  return (
    <div className="px-10 py-12 max-w-[1100px]">
      <Link
        href="/settings"
        className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors mb-9 tracking-wide"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Settings
      </Link>

      <header className="mb-10 pb-7 border-b border-border/60">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/10 border border-gold/30">
            <Database className="h-4 w-4 text-gold" />
          </div>
          <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-gold/90">
            Knowledge Base
          </p>
        </div>
        <h1 className="text-[26px] font-semibold tracking-tight text-foreground">
          Brad&apos;s SOA Library
        </h1>
        <p className="mt-3 text-[13px] text-muted-foreground/85 leading-relaxed max-w-[620px]">
          Upload completed SOAs so the generator learns Brad&apos;s voice and
          reasoning. Brad authored documents weigh three times paraplanner
          reviewed documents in the voice model.
        </p>
      </header>

      <KnowledgeBaseManager />
    </div>
  );
}
