export function OnboardingBackground() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base — same surface as the BMK app */}
      <div className="absolute inset-0 bg-background" />

      {/* Soft gold lift — top */}
      <div className="onboarding-glow-a onboarding-glow-gold absolute left-1/2 -top-[30vh] h-[58vh] w-[78vw] rounded-full blur-3xl" />

      {/* Faint blue depth — lower right */}
      <div className="onboarding-glow-b onboarding-glow-blue absolute -bottom-[32vh] -right-[16vw] h-[50vh] w-[48vw] rounded-full blur-3xl" />

      {/* Charcoal depth — left */}
      <div className="onboarding-glow-charcoal absolute top-1/3 -left-[26vw] h-[44vh] w-[42vw] rounded-full blur-3xl" />
    </div>
  );
}
