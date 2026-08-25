import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Shield } from "lucide-react";
import { CLIENTS, STATUS_CONFIG } from "@/lib/data";
import { checkCompliance } from "@/lib/compliance/compliance-checker";
import { Badge } from "@/components/ui/badge";
import { ClientTabs } from "@/components/clients/ClientTabs";
import { ClientCompliancePanel } from "@/components/compliance/ClientCompliancePanel";
import { AuditTimeline } from "@/components/compliance/AuditTimeline";
import { findClient } from "@/lib/data/client-repository";

export default async function ClientCompliancePage({
  params,
}: {
  params: { id: string };
}) {
  const client = await findClient(params.id);
  if (!client) notFound();

  const initial = checkCompliance(client.id);

  return (
    <div className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-10">
      <Link
        href={`/clients/${client.id}`}
        className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors mb-9 tracking-wide"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to {client.name}
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-2.5">
            <Shield className="h-3.5 w-3.5 text-gold" />
            <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-gold/90">
              Compliance
            </p>
          </div>
          <h1 className="text-[24px] font-semibold tracking-tight text-foreground">
            {client.name}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge className={STATUS_CONFIG[client.status].className}>
              {STATUS_CONFIG[client.status].label}
            </Badge>
            <span className="text-[12px] text-muted-foreground/85">
              {client.meetingStage}
            </span>
          </div>
        </div>
      </div>

      <ClientTabs clientId={client.id} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-8 xl:items-start">
        <ClientCompliancePanel
          clientId={client.id}
          clientName={client.name}
          initial={initial}
        />
        <div className="sticky top-8">
          <AuditTimeline clientId={client.id} />
        </div>
      </div>
    </div>
  );
}
