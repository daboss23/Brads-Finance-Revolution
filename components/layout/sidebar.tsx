"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, ClipboardList, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/fact-find", label: "Fact Find", icon: ClipboardList },
];

export function Sidebar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="flex h-screen w-60 flex-col shrink-0 border-r border-border bg-[hsl(224,26%,4%)]">
      {/* Brand area */}
      <div className="px-6 pt-7 pb-6 border-b border-border">
        <div className="flex items-baseline gap-[1px] mb-3">
          <span className="bmk-letter-pulse text-[32px] font-bold tracking-tight text-gold leading-none select-none">
            B
          </span>
          <span className="text-[32px] font-bold tracking-tight text-white/88 leading-none select-none">
            M
          </span>
          <span className="bmk-letter-pulse text-[32px] font-bold tracking-tight text-gold leading-none select-none">
            K
          </span>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <div className="h-px flex-1 bg-gradient-to-r from-gold/40 to-transparent" />
          <div className="h-px w-1.5 bg-gold/30" />
        </div>

        <p className="text-[10px] font-semibold tracking-[0.22em] text-blue-accent uppercase">
          Financial Services
        </p>
        <p className="text-[9px] tracking-[0.14em] text-gold/35 mt-1 uppercase font-medium">
          Plan · Grow · Prosper
        </p>
      </div>

      {/* Navigation */}
      <div className="flex flex-col flex-1 pt-5 px-3 gap-0.5">
        <p className="px-3 pb-2.5 text-[9px] font-bold tracking-[0.22em] uppercase text-muted-foreground/35">
          Navigation
        </p>
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "group flex items-center gap-2.5 rounded-sm px-3 py-2.5 text-[12.5px] font-medium transition-all duration-200 border-l-2",
              isActive(href)
                ? "border-gold text-gold bg-gold/[0.07]"
                : "border-transparent text-muted-foreground hover:text-foreground/85 hover:bg-white/[0.04]"
            )}
          >
            <Icon
              className={cn(
                "h-[14px] w-[14px] shrink-0 transition-colors",
                isActive(href)
                  ? "text-gold"
                  : "text-muted-foreground/55 group-hover:text-foreground/65"
              )}
            />
            {label}
          </Link>
        ))}
      </div>

      {/* Bottom: settings + profile */}
      <div className="border-t border-border px-3 pt-3 pb-4 space-y-0.5">
        <Link
          href="/settings"
          className={cn(
            "group flex items-center gap-2.5 rounded-sm px-3 py-2.5 text-[12.5px] font-medium transition-all border-l-2",
            isActive("/settings")
              ? "border-gold text-gold bg-gold/[0.07]"
              : "border-transparent text-muted-foreground hover:text-foreground/85 hover:bg-white/[0.04]"
          )}
        >
          <Settings className="h-[14px] w-[14px] shrink-0 text-muted-foreground/55 group-hover:text-foreground/65" />
          Settings
        </Link>

        <div className="mt-3 pt-3 border-t border-border/40 flex items-center gap-2.5 px-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold/10 border border-gold/25">
            <span className="text-[10px] font-bold text-gold tracking-tight">BL</span>
          </div>
          <div>
            <p className="text-[11.5px] font-medium text-foreground/85 leading-none">
              Brad Lonergan
            </p>
            <p className="text-[9.5px] text-muted-foreground/50 mt-0.5">
              Financial Adviser
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
