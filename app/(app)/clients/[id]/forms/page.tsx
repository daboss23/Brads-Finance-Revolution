import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CLIENTS } from "@/lib/data";
import { getClientProfile } from "@/lib/client-profiles";
import { getFactFindOrDemo } from "@/lib/sarah-fact-find-store";
import { recommendStrategies } from "@/lib/strategy-recommender";
import { ClientFormsWorkspace } from "@/components/forms/ClientFormsWorkspace";

export default function FormsPage({ params }: { params: { id: string } }) {
  const client = CLIENTS.find((c) => c.id === params.id);
  if (!client) notFound();

  const factFind = getFactFindOrDemo(client.id);
  const recommendations = factFind ? recommendStrategies(factFind) : [];
  const profile = getClientProfile(client.id);
  const defaultApproved = profile?.strategies ?? [];

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
          <p className="mt-2 text-[13px] text-muted-foreground/65 max-w-[560px]">
            Sarah suggests strategies based on the fact find. Brad approves
            what is relevant and the matching provider forms appear ready to
            generate and send.
          </p>
        </div>
      </div>

      <ClientFormsWorkspace
        clientId={client.id}
        clientName={client.name}
        recommendations={recommendations}
        defaultApproved={defaultApproved}
      />
    </div>
  );
}
