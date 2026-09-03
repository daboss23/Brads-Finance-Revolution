"use client";

import { NewcastleLogoFull } from "@/components/logo/newcastle-logo";

type Props = {
  /**
   * Voice sessions ask for the microphone the moment the client presses
   * begin, so the intro has to say so before the browser prompt appears.
   */
  mode: "voice" | "text";
  disabled?: boolean;
  onBegin: () => void;
};

const EXPECTATIONS: Record<Props["mode"], string[]> = {
  voice: [
    "Athena will speak with you. Just answer out loud, the way you would on a call.",
    "Rough answers are perfectly fine. Brad will refine the detail with you.",
    "No advice is given in this session. It is discovery only.",
    "Your information is handled securely and reviewed personally by Brad.",
  ],
  text: [
    "You can type your answers or simply speak them.",
    "Rough answers are perfectly fine. Brad will refine the detail with you.",
    "No advice is given in this session. It is discovery only.",
    "Your information is handled securely and reviewed personally by Brad.",
  ],
};

export function AthenaIntroScreen({ mode, disabled, onBegin }: Props) {
  return (
    <div className="relative flex flex-col items-center justify-start min-h-[100dvh] bg-background text-foreground px-6 py-10 overflow-hidden">
      {/* Ambient depth — warm gold horizon over near black */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,hsl(var(--gold)/0.09),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_80%,hsl(var(--gold-shadow)/0.22),transparent_60%)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[680px] w-[680px] rounded-full bg-[radial-gradient(circle,hsl(var(--teal-accent)/0.04),transparent_70%)] onboarding-glow-a" />

      {/* Card — large soft translucent glass panel */}
      <div className="glass-panel glass-panel-elevated glass-grain relative z-10 w-full max-w-[640px] rounded-[32px] px-8 pt-4 pb-8 flex flex-col items-center text-center sm:px-10">
        <div className="mb-2">
          <NewcastleLogoFull size={220} />
        </div>
        <h1 className="text-3xl md:text-5xl font-light tracking-wide text-foreground mb-3">
          Financial Discovery Session
        </h1>
        <p className="text-lg text-foreground/70 max-w-[520px] leading-relaxed">
          A relaxed conversation with Athena, your discovery assistant, so Brad
          can prepare properly for your meeting.
        </p>

        <div className="gold-rule my-6 w-full max-w-[420px]" />

        <ul className="mb-7 grid w-full max-w-[460px] gap-2.5 text-left">
          {EXPECTATIONS[mode].map((line) => (
            <li
              key={line}
              className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-foreground/65"
            >
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-gold/70" />
              {line}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={onBegin}
          disabled={disabled}
          className="onboarding-cta-shine btn-gold relative overflow-hidden rounded-xl px-12 py-5 text-[16px] font-bold tracking-[0.05em] uppercase transition-[filter] hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Begin My Financial Discovery
        </button>

        <p className="mt-5 text-[12px] text-muted-foreground/60 max-w-[440px] leading-relaxed">
          {mode === "voice"
            ? "Your browser will ask to use your microphone so Athena can hear you. Shared only with your Newcastle Financial Services adviser."
            : "Shared only with your Newcastle Financial Services adviser. You can pause at any time and pick up where you left off."}
        </p>

        {/* APP 5 collection notice — Privacy Act 1988 (Cth) */}
        <details className="mt-4 w-full max-w-[460px] text-left">
          <summary className="cursor-pointer text-[12px] text-muted-foreground/60 underline underline-offset-2 hover:text-muted-foreground">
            How your personal information is collected and used
          </summary>
          <div className="mt-2 space-y-2 rounded-xl bg-foreground/[0.03] p-4 text-[12px] leading-relaxed text-muted-foreground/70">
            <p>
              Newcastle Financial Services (BMK Financial Services, AFSL
              authorisation via Charter Financial Planning, AFSL 234665)
              collects the personal and financial information you share in this
              session to prepare your financial advice, meet legal obligations
              under the Corporations Act 2001 (Cth), and verify your identity
              where required.
            </p>
            <p>
              Your information is encrypted in storage, is reviewed only by your
              adviser and their support staff, and is disclosed only to product
              providers you ask us to deal with, our licensee for compliance
              purposes, or where the law requires it. It is not sold or used for
              marketing without your consent.
            </p>
            <p>
              You may request access to or correction of your information at any
              time, or make a privacy complaint, by contacting Brad Lonergan. If
              unresolved, you can contact the Office of the Australian
              Information Commissioner (oaic.gov.au). Providing information is
              optional, but without it we may not be able to give you
              appropriate advice.
            </p>
          </div>
        </details>
      </div>
    </div>
  );
}
