"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Sparkles,
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
    <aside className="flex h-screen w-[272px] shrink-0 flex-col border-r border-border/70 bg-card">

      {/* Brand */}
      <div className="px-7 pt-10 pb-8">
        <div className="flex items-center justify-center">
          <NewcastleLogoFull size={104} />
        </div>
        <p className="mt-5 text-[9px] tracking-[0.34em] text-muted-foreground/55 uppercase font-semibold text-center">
          Plan · Grow · Prosper
        </p>
      </div>

      <div className="mx-6 h-px bg-border/60" />

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 px-4 pt-7 pb-3 flex-1">
        <p className="px-3 pb-4 text-[10px] font-semibold tracking-[0.26em] uppercase text-muted-foreground/50">
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
                "group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-[14px] font-medium transition-colors duration-150",
                active
                  ? "bg-gold/[0.08] text-gold"
                  : "text-muted-foreground/85 hover:bg-white/[0.04] hover:text-foreground"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[2px] rounded-r-full bg-gold/80" />
              )}
              <Icon
                className={cn(
                  "h-[17px] w-[17px] shrink-0 transition-colors",
                  active
                    ? "text-gold"
                    : "text-muted-foreground/65 group-hover:text-foreground/90"
                )}
              />
              <span className="tracking-tight">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Profile */}
      <div className="px-4 pb-5">
        <div className="mx-2 mb-4 h-px bg-border/60" />
        <div className="flex items-center gap-3 px-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/15 border border-gold/30">
            <span className="text-[12px] font-bold text-gold tracking-tight">
              BL
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-foreground truncate leading-tight">
              Brad Lonergan
            </p>
            <p className="text-[11px] text-muted-foreground/65 truncate mt-0.5">
              Financial Adviser
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
