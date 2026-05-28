import Link from "next/link";
import { Database, ArrowRight, Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="px-10 py-12 max-w-[900px]">
      <div className="mb-10 pb-7 border-b border-border/60">
        <div className="flex items-center gap-3 mb-3">
          <SettingsIcon className="h-3.5 w-3.5 text-muted-foreground/85" />
          <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-muted-foreground/85">
            Settings
          </p>
        </div>
        <h1 className="text-[26px] font-semibold tracking-tight text-foreground">
          Platform Configuration
        </h1>
        <p className="mt-3 text-[13px] text-muted-foreground/85 leading-relaxed max-w-[620px]">
          Practice level configuration for Newcastle Financial Services.
        </p>
      </div>

      <Link
        href="/settings/knowledge-base"
        className="group block rounded-lg border border-border bg-card p-6 hover:border-gold/40 transition-colors"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 border border-gold/30 shrink-0">
            <Database className="h-4 w-4 text-gold" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-foreground">
                Knowledge Base
              </h2>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/55 group-hover:text-gold transition-colors" />
            </div>
            <p className="text-[12.5px] text-muted-foreground/85 leading-relaxed mt-1">
              Upload completed SOA documents so the engine learns Brad&apos;s
              voice and reasoning. Tag each document by author for weighted
              training.
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}
