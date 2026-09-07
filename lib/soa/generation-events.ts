/**
 * Bridge between the generator runner (left column) and the download CTA
 * (right rail). Both are client components on the same page, so a window
 * event keeps the server page a server component with no shared provider.
 */
export const SOA_GENERATED_EVENT = "bmk:soa-generated";

export interface SoaGeneratedDetail {
  clientId: string;
  generatedAt: string;
  complianceScore: number;
  sectionCount: number;
}

export function announceSoaGenerated(detail: SoaGeneratedDetail) {
  window.dispatchEvent(
    new CustomEvent<SoaGeneratedDetail>(SOA_GENERATED_EVENT, { detail }),
  );
}

/**
 * Fired by the ready panel's "Regenerate with agents" button. The runner owns
 * the stream, so the panel asks it to start again rather than duplicating it.
 */
export const SOA_REGENERATE_EVENT = "bmk:soa-regenerate";

export function requestSoaRegenerate(clientId: string) {
  window.dispatchEvent(
    new CustomEvent<{ clientId: string }>(SOA_REGENERATE_EVENT, {
      detail: { clientId },
    }),
  );
}
