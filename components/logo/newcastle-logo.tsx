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
          <circle cx="100" cy="100" r="96" />
        </clipPath>
      </defs>

      {/* Navy sky background */}
      <circle cx="100" cy="100" r="96" fill="#1B3554" />

      {/* Sandy beach — lower left */}
      <path
        d="M 0 200 L 0 130 C 18 118 40 122 62 130 C 80 136 94 146 108 152 C 120 158 133 153 143 148 C 126 176 92 200 0 200 Z"
        fill="#C4A24E"
        clipPath="url(#nfs-logo-clip)"
      />

      {/* Water — main body, flowing right */}
      <path
        className="nfs-water-a"
        d="M 112 200 C 128 160 160 142 188 134 L 200 130 L 200 200 Z"
        fill="#2C6E9E"
        clipPath="url(#nfs-logo-clip)"
      />

      {/* Water — lighter surface layer */}
      <path
        className="nfs-water-b"
        d="M 152 200 C 164 170 182 158 200 153 L 200 200 Z"
        fill="#4B90C2"
        clipPath="url(#nfs-logo-clip)"
        opacity={0.65}
      />

      {/* White cliff / headland */}
      <path
        d="M -4 88 C 8 80 28 81 52 82 C 66 82 76 80 83 77 C 88 75 91 79 91 84 L 91 97 C 72 99 48 98 24 96 C 12 95 0 94 -4 94 Z"
        fill="white"
        clipPath="url(#nfs-logo-clip)"
        opacity={0.92}
      />

      {/* Castle — main tower */}
      <rect x="35" y="63" width="12" height="20" fill="white" clipPath="url(#nfs-logo-clip)" />
      {/* Main tower merlons */}
      <rect x="32" y="57" width="4" height="8" fill="white" clipPath="url(#nfs-logo-clip)" />
      <rect x="38" y="57" width="4" height="8" fill="white" clipPath="url(#nfs-logo-clip)" />
      <rect x="44" y="57" width="4" height="8" fill="white" clipPath="url(#nfs-logo-clip)" />
      {/* Lower gatehouse / wing */}
      <rect x="49" y="71" width="20" height="13" fill="white" clipPath="url(#nfs-logo-clip)" />
      {/* Small left tower */}
      <rect x="18" y="68" width="11" height="16" fill="white" clipPath="url(#nfs-logo-clip)" />
      <rect x="17" y="63" width="4" height="7" fill="white" clipPath="url(#nfs-logo-clip)" />
      <rect x="24" y="63" width="4" height="7" fill="white" clipPath="url(#nfs-logo-clip)" />

      {/* Circle border */}
      <circle cx="100" cy="100" r="96" fill="none" stroke="white" strokeWidth="2.5" opacity={0.4} />
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
      <div className="flex flex-col">
        <span className="text-[21px] font-extralight tracking-[0.32em] text-foreground/90 uppercase leading-none">
          Newcastle
        </span>
        <div className="h-px bg-gold/55 my-2" />
        <span className="text-[9px] font-semibold tracking-[0.32em] text-foreground/50 uppercase">
          Financial Services
        </span>
      </div>
    </div>
  );
}
