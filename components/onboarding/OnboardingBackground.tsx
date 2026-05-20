export function OnboardingBackground() {
  return (
    <div aria-hidden className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Base */}
      <div className="absolute inset-0 bg-background" />

      {/* Gold atmosphere — top */}
      <div className="onboarding-glow-a onboarding-glow-gold absolute left-1/2 -top-[22vh] h-[72vh] w-[88vw] rounded-full blur-3xl" />

      {/* Light-blue depth — lower right */}
      <div className="onboarding-glow-b onboarding-glow-blue absolute -bottom-[26vh] -right-[12vw] h-[62vh] w-[60vw] rounded-full blur-3xl" />

      {/* Charcoal depth — left */}
      <div className="onboarding-glow-charcoal absolute top-1/4 -left-[22vw] h-[56vh] w-[52vw] rounded-full blur-3xl" />

      {/* Vignette — focuses the centre, lifts text contrast */}
      <div className="onboarding-vignette absolute inset-0" />
    </div>
  );
}
