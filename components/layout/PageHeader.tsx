import type { ReactNode } from "react";
import { TodayLabel } from "@/components/dashboard/TodayLabel";

export function PageHeader({
  overline = "Newcastle Financial Services",
  title,
  subtitle,
  children,
  showDate = true,
}: {
  overline?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  showDate?: boolean;
}) {
  return (
    <header className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <p className="cmd-label text-gold/70">{overline}</p>
          {showDate && (
            <>
              <span className="size-1 rounded-full bg-gold/55" />
              <p className="text-[12px] text-muted-foreground/72">
                <TodayLabel />
              </p>
            </>
          )}
        </div>
        <h1 className="mt-2.5 text-[28px] font-semibold leading-none tracking-normal text-foreground sm:text-[32px]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-[680px] text-[13px] leading-6 text-muted-foreground/76">
            {subtitle}
          </p>
        )}
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          {children}
        </div>
      )}
    </header>
  );
}
