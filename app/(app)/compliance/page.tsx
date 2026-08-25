import { Shield } from "lucide-react";
import {
  ATO_THRESHOLDS,
  LANGUAGE_TEMPLATES,
  REGULATORY_UPDATES,
  THRESHOLDS_FINANCIAL_YEAR,
  THRESHOLDS_LAST_UPDATED,
  UPDATES_LAST_CHECKED,
} from "@/lib/compliance/knowledge-base";
import { RegulatoryUpdatesCard } from "@/components/compliance/RegulatoryUpdatesCard";
import { LanguageLibraryCard } from "@/components/compliance/LanguageLibraryCard";
import { ThresholdsCard } from "@/components/compliance/ThresholdsCard";
import { ComplianceSettingsCard } from "@/components/compliance/ComplianceSettingsCard";

export default function CompliancePage() {
  return (
    <div className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-10">

      {/* Header */}
      <header className="mb-10 pb-8 border-b border-gold/[0.1]">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/10 border border-gold/30">
            <Shield className="h-4 w-4 text-gold" />
          </div>
          <p className="cmd-label text-gold/90">
            Compliance · Regulatory Control Room
          </p>
        </div>
        <h1 className="text-[28px] font-semibold tracking-tight text-foreground">
          Charter Financial Planning · AFSL 234665
        </h1>
        <p className="mt-3 text-[13px] text-muted-foreground/85 leading-relaxed max-w-[640px]">
          The compliance command centre for Newcastle Financial Services. Every
          piece of advice must pass through this layer before it reaches a
          client.
        </p>
      </header>

      <div className="space-y-9">
        <RegulatoryUpdatesCard
          updates={REGULATORY_UPDATES}
          lastChecked={UPDATES_LAST_CHECKED}
        />
        <LanguageLibraryCard templates={LANGUAGE_TEMPLATES} />
        <ThresholdsCard
          thresholds={ATO_THRESHOLDS}
          financialYear={THRESHOLDS_FINANCIAL_YEAR}
          lastUpdated={THRESHOLDS_LAST_UPDATED}
        />
        <ComplianceSettingsCard />
      </div>
    </div>
  );
}
