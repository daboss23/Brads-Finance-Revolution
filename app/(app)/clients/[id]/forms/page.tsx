import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CLIENTS } from "@/lib/data";
import { getClientProfile } from "@/lib/client-profiles";
import { getFormsForStrategies, STRATEGY_LABELS } from "@/lib/forms";
import { FormsPanel } from "@/components/forms/FormsPanel";

export default function FormsPage({ params }: { params: { id: string } }) {
  const client = CLIENTS.find((c) => c.id === params.id);
  if (!client) notFound();

  const profile       = getClientProfile(client.id);
  const strategies    = profile?.strategies ?? [];
  const requiredForms = getFormsForStrategies(strategies);

  return (
    <div className="px-14 py-12">

      {/* Back */}
      <Link
        href={`/clients/${client.id}`}
        className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground/55 hover:text-foreground transition-colors mb-9 tracking-wide"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to {client.name}
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-10 pb-9 border-b border-border/60">
        <div>
          <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-muted-foreground/45 mb-2">
            Provider Forms
          </p>
          <h1 className="text-[26px] font-semibold tracking-tight text-foreground">
            {client.name}
          </h1>
          {strategies.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {strategies.map((s) => (
                <span
                  key={s}
                  className="rounded border border-gold/30 bg-gold/5 px-2.5 py-1 text-[11px] font-medium text-gold/70"
                >
                  {STRATEGY_LABELS[s]}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-[12px] text-muted-foreground/45 italic">
              No strategy selected
            </p>
          )}
        </div>

        {requiredForms.length > 0 && (
          <div className="text-right">
            <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-muted-foreground/40 mb-1.5">
              Forms Required
            </p>
            <p className="text-[40px] font-semibold text-foreground tabular-nums leading-none">
              {requiredForms.length}
            </p>
          </div>
        )}
      </div>

      <FormsPanel clientId={client.id} strategies={strategies} />
    </div>
  );
}
