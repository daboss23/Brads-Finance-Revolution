"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NewcastleLogoFull } from "@/components/logo/newcastle-logo";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/fact-find", label: "Fact Find", icon: ClipboardList },
  { href: "/sarah", label: "Sarah", icon: Sparkles },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-72 shrink-0 flex-col border-r border-border/80 bg-gradient-to-b from-card to-card/60 backdrop-blur-sm">

      {/* Brand */}
      <div className="px-6 pt-8 pb-7 border-b border-border/60">
        <div className="flex items-center justify-center mb-4">
          <NewcastleLogoFull size={96} />
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-gold/55 to-transparent" />
        <p className="mt-3 text-[9px] tracking-[0.32em] text-muted-foreground/65 uppercase font-semibold text-center">
          Plan · Grow · Prosper
        </p>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 px-4 pt-6 pb-3 flex-1">
        <p className="px-3 pb-3 text-[10px] font-bold tracking-[0.24em] uppercase text-muted-foreground/55">
          Navigation
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative flex items-center gap-3.5 rounded-lg px-3.5 py-3 text-[14px] font-medium transition-all duration-200",
                active
                  ? "bg-gradient-to-r from-gold/[0.14] to-gold/[0.04] text-gold shadow-[inset_0_0_0_1px_rgba(212,175,55,0.18)]"
                  : "text-muted-foreground/85 hover:bg-white/[0.06] hover:text-foreground"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-gradient-to-b from-gold/90 to-gold/60" />
              )}
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-all duration-200",
                  active
                    ? "bg-gold/15 text-gold"
                    : "text-muted-foreground/70 group-hover:bg-white/[0.05] group-hover:text-foreground"
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="flex-1 tracking-tight">{label}</span>
              <ChevronRight
                className={cn(
                  "h-3.5 w-3.5 shrink-0 transition-all duration-200",
                  active
                    ? "text-gold/70 opacity-100"
                    : "text-muted-foreground/40 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0"
                )}
              />
            </Link>
          );
        })}
      </nav>

      {/* Profile */}
      <div className="border-t border-border/60 px-5 py-5">
        <button
          type="button"
          className="group w-full flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-white/[0.05]"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold/30 to-gold/10 border border-gold/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <span className="text-[12px] font-bold text-gold tracking-tight">
              BL
            </span>
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[13.5px] font-semibold text-foreground truncate leading-tight">
              Brad Lonergan
            </p>
            <p className="text-[11px] text-muted-foreground/65 truncate mt-0.5">
              Financial Adviser
            </p>
          </div>
          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] shrink-0" />
        </button>
      </div>
    </aside>
  );
}
