import { cn } from "@/lib/utils";

export function NewcastleEmblem({
  size = 56,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Newcastle Financial Services"
    >
      <defs>
        <clipPath id="nfs-logo-clip">
          <circle cx="100" cy="100" r="97" />
        </clipPath>
      </defs>

      {/* Deep navy sky */}
      <circle cx="100" cy="100" r="97" fill="#0E2444" />

      {/* Sandy beach — lower left sweep */}
      <path
        d="M 0 200 L 0 128 C 16 116 38 119 60 128 C 78 134 93 144 108 150 C 121 156 135 151 145 146 C 128 174 93 200 0 200 Z"
        fill="#C8A84A"
        clipPath="url(#nfs-logo-clip)"
      />

      {/* Water — main body */}
      <path
        className="nfs-water-a"
        d="M 114 200 C 130 158 162 140 190 132 L 200 128 L 200 200 Z"
        fill="#2872AC"
        clipPath="url(#nfs-logo-clip)"
      />

      {/* Water — lighter surface shimmer */}
      <path
        className="nfs-water-b"
        d="M 154 200 C 167 168 184 156 200 151 L 200 200 Z"
        fill="#4D9FD8"
        clipPath="url(#nfs-logo-clip)"
        opacity={0.6}
      />

      {/* White cliff headland */}
      <path
        d="M -4 86 C 10 77 30 78 54 79 C 68 80 78 78 85 75 C 90 73 93 77 93 82 L 93 96 C 74 98 50 97 26 95 C 13 94 0 93 -4 93 Z"
        fill="white"
        clipPath="url(#nfs-logo-clip)"
        opacity={0.94}
      />

      {/* Castle — main tower */}
      <rect x="34" y="60" width="13" height="22" fill="white" clipPath="url(#nfs-logo-clip)" />
      {/* Main tower merlons */}
      <rect x="31" y="54" width="5" height="9" fill="white" clipPath="url(#nfs-logo-clip)" />
      <rect x="38" y="54" width="5" height="9" fill="white" clipPath="url(#nfs-logo-clip)" />
      <rect x="45" y="54" width="5" height="9" fill="white" clipPath="url(#nfs-logo-clip)" />
      {/* Lower gatehouse wing */}
      <rect x="49" y="69" width="22" height="14" fill="white" clipPath="url(#nfs-logo-clip)" />
      {/* Small left tower */}
      <rect x="17" y="65" width="12" height="17" fill="white" clipPath="url(#nfs-logo-clip)" />
      <rect x="16" y="60" width="5" height="8" fill="white" clipPath="url(#nfs-logo-clip)" />
      <rect x="23" y="60" width="5" height="8" fill="white" clipPath="url(#nfs-logo-clip)" />

      {/* Outer circle ring */}
      <circle cx="100" cy="100" r="95" fill="none" stroke="white" strokeWidth="3" opacity={0.35} />
      <circle cx="100" cy="100" r="97" fill="none" stroke="white" strokeWidth="1.5" opacity={0.12} />
    </svg>
  );
}

export function NewcastleLogoFull({
  className,
  size = 68,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div className={cn("flex items-center gap-5", className)}>
      <NewcastleEmblem size={size} />
      <div className="flex flex-col gap-0">
        <span
          className="font-light tracking-[0.38em] text-foreground uppercase leading-none"
          style={{ fontSize: `${Math.round(size * 0.29)}px` }}
        >
          Newcastle
        </span>
        <div className="h-px bg-gold/60 my-2.5" />
        <span
          className="font-semibold tracking-[0.28em] text-muted-foreground uppercase leading-none"
          style={{ fontSize: `${Math.round(size * 0.115)}px` }}
        >
          Financial Services
        </span>
      </div>
    </div>
  );
}
