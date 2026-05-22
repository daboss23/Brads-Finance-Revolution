export type OrbState = "idle" | "speaking" | "listening" | "thinking";

interface Props {
  state: OrbState;
}

export function SarahOrb({ state }: Props) {
  return (
    <div className={`sarah-orb sarah-orb--${state} w-[240px] h-[240px] md:w-[300px] md:h-[300px]`}>
      <div className="sarah-orb-aura" />
      <div className="sarah-orb-ring sarah-orb-ring-1" />
      <div className="sarah-orb-ring sarah-orb-ring-2" />
      <div className="sarah-orb-ring sarah-orb-ring-3" />
      <div className="sarah-orb-sphere">
        <div className="sarah-orb-inner" />
        <div className="sarah-orb-core" />
        <div className="sarah-orb-highlight" />
      </div>
    </div>
  );
}
