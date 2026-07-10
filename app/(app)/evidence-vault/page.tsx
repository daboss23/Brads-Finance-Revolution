import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  FileCheck2,
  FileText,
  Fingerprint,
  FolderLock,
  Landmark,
  Lock,
  PenLine,
  ShieldCheck,
  Sparkles,
  Vault,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Evidence Vault - Newcastle Command Centre",
};

const COLLECTIONS = [
  {
    id: "uploaded-soas",
    name: "Uploaded SOAs",
    detail: "Completed Statements of Advice, weighted three times when written by Brad.",
    icon: FileText,
    count: 24,
    classification: "Advice records",
  },
  {
    id: "completed-fact-finds",
    name: "Completed Fact Finds",
    detail: "Discovery outputs captured by Sarah and structured by Beacon.",
    icon: FileCheck2,
    count: 18,
    classification: "Client discovery",
  },
  {
    id: "brad-methodology",
    name: "Brad Methodology",
    detail: "Strategy reasoning patterns and advice frameworks in Brad's own words.",
    icon: BookOpen,
    count: 7,
    classification: "Adviser IP",
  },
  {
    id: "compliance-templates",
    name: "Compliance Templates",
    detail: "Approved language, BID steps, safe harbour checklists and consent wording.",
    icon: ShieldCheck,
    count: 13,
    classification: "Regulatory",
  },
  {
    id: "product-research",
    name: "Product Research",
    detail: "Provider comparisons and product analysis for MLC, AIA and AMP MyNorth.",
    icon: Landmark,
    count: 9,
    classification: "Research",
  },
  {
    id: "evidence-library",
    name: "Evidence Library",
    detail: "Best interests evidence packets assembled by Orion for each advice file.",
    icon: FolderLock,
    count: 11,
    classification: "Best interests",
  },
  {
    id: "strategy-patterns",
    name: "Strategy Patterns",
    detail: "Seven reusable strategy reasoning patterns feeding ATLAS synthesis.",
    icon: Sparkles,
    count: 7,
    classification: "Strategy",
  },
  {
    id: "voice-examples",
    name: "Voice & Writing Examples",
    detail: "Before-and-after edit pairs training the engine to write like Brad.",
    icon: PenLine,
    count: 32,
    classification: "Voice learning",
  },
];

export default function EvidenceVaultPage() {
  const totalItems = COLLECTIONS.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-10">
      <PageHeader
        overline="Secure Repository"
        title="Evidence Vault"
        subtitle="The sealed knowledge layer behind every piece of advice: source documents, methodology, compliance language and best interests evidence."
      >
        <div className="flex items-center gap-2 rounded-full border border-success/25 bg-success/[0.08] px-3.5 py-2 text-[11px] font-semibold text-success">
          <Lock className="size-3.5" />
          Encrypted at rest · Adviser access only
        </div>
      </PageHeader>

      {/* Vault status band */}
      <section className="glass-panel edge-gold mb-8 overflow-hidden">
        <div className="grid gap-5 px-6 py-5 md:grid-cols-[auto_1fr_auto] md:items-center">
          <div className="grid size-14 place-items-center rounded-2xl border border-gold/30 bg-[radial-gradient(circle_at_35%_30%,hsl(44_80%_88%/0.14),transparent_40%),linear-gradient(180deg,hsl(var(--gold)/0.16),transparent)] text-gold shadow-[0_0_34px_-14px_hsl(var(--gold)/0.7)]">
            <Vault className="size-6" />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-foreground">
              Vault integrity verified
            </p>
            <p className="mt-1 text-[12.5px] leading-5 text-muted-foreground/72 max-w-[560px]">
              Every document is fingerprinted on entry and referenced by the
              agents through the knowledge base. Written-by-Brad sources carry
              triple weight in ATLAS synthesis.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <VaultStat label="Documents" value={String(totalItems)} />
            <VaultStat label="Brad-weighted" value="24" />
            <VaultStat label="Collections" value={String(COLLECTIONS.length)} />
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] bg-black/25 px-6 py-3.5">
          <div className="flex items-center gap-2 text-[11.5px] text-muted-foreground/65">
            <Fingerprint className="size-3.5 text-gold/70" />
            Last integrity sweep: today · No anomalies detected
          </div>
          <Link
            href="/settings/knowledge-base"
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-gold/85 transition hover:text-gold"
          >
            Upload to vault <ArrowRight className="size-3" />
          </Link>
        </div>
      </section>

      {/* Collections */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {COLLECTIONS.map((collection) => {
          const Icon = collection.icon;
          return (
            <div
              key={collection.id}
              className={cn(
                "glass-panel glass-hover group flex flex-col overflow-hidden p-5",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="grid size-11 place-items-center rounded-xl border border-gold/20 bg-gradient-to-b from-gold/[0.1] to-transparent text-gold/90">
                  <Icon className="size-[18px]" />
                </div>
                <span className="rounded-full border border-white/[0.09] bg-black/25 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/60">
                  {collection.classification}
                </span>
              </div>
              <p className="mt-4 text-[15px] font-semibold text-foreground">
                {collection.name}
              </p>
              <p className="mt-1.5 flex-1 text-[12px] leading-5 text-muted-foreground/68">
                {collection.detail}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3.5">
                <p className="text-[20px] font-semibold leading-none text-foreground tabular-nums">
                  {collection.count}
                  <span className="ml-1.5 text-[11px] font-medium text-muted-foreground/55">
                    items
                  </span>
                </p>
                <span className="text-muted-foreground/40 transition group-hover:text-gold">
                  <ArrowRight className="size-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}

function VaultStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right md:text-left">
      <p className="text-[22px] font-semibold leading-none text-foreground tabular-nums">
        {value}
      </p>
      <p className="mt-1.5 cmd-label text-muted-foreground/55">{label}</p>
    </div>
  );
}
