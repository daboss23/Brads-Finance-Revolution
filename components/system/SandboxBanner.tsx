import { FlaskConical } from "lucide-react";
import { isSandbox } from "@/lib/security/env";

// Rendered at the top of every page in non-production environments so it is
// always obvious when a build must only ever contain synthetic client data.
export function SandboxBanner() {
  if (!isSandbox()) return null;

  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 border-b border-warning/30 bg-warning/[0.08] px-4 py-1.5"
    >
      <FlaskConical className="size-3.5 text-warning" />
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-warning">
        Sandbox environment — synthetic data only, never enter real client information
      </p>
    </div>
  );
}
