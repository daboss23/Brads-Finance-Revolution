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
