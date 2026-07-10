import { ShieldAlert } from "lucide-react";
import { NewcastleLogoFull } from "@/components/logo/newcastle-logo";
import { OnboardingBackground } from "./OnboardingBackground";

type Props = {
  reason: "invalid" | "expired";
};

const COPY = {
  invalid: {
    title: "This link isn't active",
    body: "We couldn't verify this Financial Discovery link. It may have been typed incorrectly, or it hasn't been issued yet.",
  },
  expired: {
    title: "This link has expired",
    body: "For your security, Financial Discovery links are only valid for a limited time after they're sent.",
  },
} as const;

export function LinkUnavailable({ reason }: Props) {
  const copy = COPY[reason];

  return (
    <>
      <OnboardingBackground />
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-[480px] onboarding-fade-in space-y-8 text-center">
          <div className="flex justify-center">
            <NewcastleLogoFull size={56} />
          </div>

          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
            <div className="px-8 py-9 space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 border border-gold/30">
                <ShieldAlert className="h-5 w-5 text-gold" />
              </div>
              <h1 className="text-[24px] font-semibold tracking-tight text-foreground">
                {copy.title}
              </h1>
              <p className="text-[14.5px] text-foreground/70 leading-relaxed">
                {copy.body}
              </p>
              <p className="text-[14.5px] text-foreground/70 leading-relaxed">
                Please contact Brad Lonergan at Newcastle Financial Services and
                we'll send you a fresh link straight away.
              </p>
            </div>
          </div>

          <p className="text-[12.5px] text-muted-foreground/55">
            Your information is protected. No details are shared through
            unverified links.
          </p>
        </div>
      </div>
    </>
  );
}
