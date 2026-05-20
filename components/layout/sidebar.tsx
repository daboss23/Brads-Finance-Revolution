"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, ClipboardList, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/fact-find", label: "Fact Find", icon: ClipboardList },
  { href: "/sarah", label: "Sarah", icon: Sparkles },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-border/60">
        <div className="flex items-baseline gap-0.5 select-none">
          <span className="text-[22px] font-black tracking-tight text-gold bmk-letter-pulse leading-none">B</span>
          <span className="text-[22px] font-black tracking-tight text-foreground leading-none">M</span>
          <span className="text-[22px] font-black tracking-tight text-gold bmk-letter-pulse leading-none">K</span>
        </div>
        <div className="ml-2.5 flex flex-col justify-center leading-none">
          <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-blue-accent">Financial Services</span>
          <span className="text-[8px] tracking-[0.12em] text-muted-foreground/40 mt-0.5">Plan · Grow · Prosper</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 p-3 flex-1">
        <p className="px-3 pt-3 pb-2 text-[9px] font-bold tracking-[0.2em] uppercase text-muted-foreground/35">
          Navigation
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded px-3 py-2.5 text-[13px] font-medium transition-all duration-150 relative",
                active
                  ? "bg-gold/[0.08] text-gold border-l-2 border-gold/60 pl-[10px]"
                  : "text-muted-foreground/60 hover:bg-white/[0.04] hover:text-foreground/80 border-l-2 border-transparent pl-[10px]"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-gold" : "")} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Profile */}
      <div className="border-t border-border/60 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/10 border border-gold/25">
            <span className="text-[11px] font-bold text-gold tracking-tight">BL</span>
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-foreground/85 truncate">Brad Lonergan</p>
            <p className="text-[10px] text-muted-foreground/45 truncate">Financial Adviser</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
