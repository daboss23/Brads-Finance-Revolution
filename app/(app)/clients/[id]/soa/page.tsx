import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CLIENTS } from "@/lib/data";
import { getClientProfile } from "@/lib/client-profiles";
import { generateSoa, SoaGenerationError } from "@/lib/soa/soa-generator";
import { ClientTabs } from "@/components/clients/ClientTabs";
import { SoaReviewView } from "@/components/soa/SoaReviewView";
import { findClient } from "@/lib/data/client-repository";

export default async function ClientSoaPage({
  params,
}: {
  params: { id: string };
}) {
  const client = await findClient(params.id);
  if (!client) notFound();

  let initial;
  try {
    initial = generateSoa(client.id);
  } catch (err) {
    if (err instanceof SoaGenerationError) {
      redirect(`/clients/${client.id}/soa/generate`);
    }
    throw err;
  }

  const profile = getClientProfile(client.id);
  const strategies = profile?.strategies ?? [];

  return (
    <div className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-10">
      <Link
        href={`/clients/${client.id}`}
        className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors mb-9 tracking-wide"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to {client.name}
      </Link>

      <ClientTabs clientId={client.id} />

      <SoaReviewView initial={initial} strategies={strategies as string[]} />
    </div>
  );
}
