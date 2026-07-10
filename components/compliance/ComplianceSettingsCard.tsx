"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const STORE_KEY = "bmk-crm-compliance-settings-v1";

interface ComplianceSettings {
  requireCheckBeforeSoa: boolean;
  autoFlagIncompleteData: boolean;
  notifyOnRegulatoryUpdate: boolean;
  requireBidSignOff: boolean;
}

const DEFAULTS: ComplianceSettings = {
  requireCheckBeforeSoa: true,
  autoFlagIncompleteData: true,
  notifyOnRegulatoryUpdate: true,
  requireBidSignOff: true,
};

const TOGGLES: {
  key: keyof ComplianceSettings;
  label: string;
  description: string;
}[] = [
  {
    key: "requireCheckBeforeSoa",
    label: "Require compliance check before SOA generation",
    description:
      "The SOA engine will be blocked until a passing compliance check is on file.",
  },
  {
    key: "autoFlagIncompleteData",
    label: "Auto-flag when client data is incomplete",
    description:
      "Show a missing information warning on the client record whenever required fields are blank.",
  },
  {
    key: "notifyOnRegulatoryUpdate",
    label: "Send Brad notification when regulations update",
    description:
      "Email Brad whenever a relevant ASIC, ATO or Charter update is detected.",
  },
  {
    key: "requireBidSignOff",
    label: "Require best interests duty sign-off per client",
    description:
      "Every client must have a signed best interests duty certificate before advice is delivered.",
  },
];

export function ComplianceSettingsCard() {
  const [settings, setSettings] = useState<ComplianceSettings>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) setSettings({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {
      // ignore
    }
  }, []);

  function update(key: keyof ComplianceSettings) {
    setSettings((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

  return (
    <section className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-6 py-5 border-b border-border/60 bg-black/25">
        <h2 className="text-[14px] font-semibold text-foreground tracking-tight">
          Compliance Settings
        </h2>
        <p className="text-[11px] text-muted-foreground/75 mt-1">
          Practice level rules applied to every client file.
        </p>
      </div>
      <ul className="divide-y divide-border/40">
        {TOGGLES.map((toggle) => {
          const enabled = settings[toggle.key];
          return (
            <li key={toggle.key} className="px-6 py-5">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-foreground">
                    {toggle.label}
                  </p>
                  <p className="text-[12.5px] text-muted-foreground/80 leading-relaxed mt-1">
                    {toggle.description}
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked={enabled}
                  onClick={() => update(toggle.key)}
                  className={cn(
                    "relative h-6 w-11 shrink-0 rounded-full border transition-colors",
                    enabled
                      ? "bg-gold/25 border-gold/55"
                      : "bg-muted border-border"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full transition-all",
                      enabled
                        ? "left-[22px] bg-gold"
                        : "left-1 bg-muted-foreground/60"
                    )}
                  />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
