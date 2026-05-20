import { cn } from "@/lib/utils";

type Props = {
  message: string;
  compact?: boolean;
};

export function SarahPresence({ message, compact }: Props) {
  return (
    <div className={cn("flex items-start gap-3", compact ? "mb-6" : "mb-10")}>
      <div className="shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-gold/10 border border-gold/30">
        <span className="text-[11px] font-bold text-gold tracking-tight">SA</span>
      </div>
      <div className="flex flex-col gap-1 pt-0.5">
        <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-gold/60">
          Sarah · BMK Onboarding
        </p>
        <p
          className={cn(
            "text-muted-foreground/80 leading-relaxed",
            compact ? "text-[13px]" : "text-[14px]"
          )}
        >
          {message}
        </p>
      </div>
    </div>
  );
}
