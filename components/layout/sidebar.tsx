"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, ClipboardList, Sparkles } from "lucide-react";
import { NewcastleEmblem } from "@/components/logo/newcastle-logo";
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
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-border bg-card">

      {/* Brand */}
      <div className="px-5 pt-7 pb-6 border-b border-border">
        <div className="flex items-center gap-3.5 mb-4">
          <NewcastleEmblem size={46} />
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[13.5px] font-light tracking-[0.32em] text-foreground uppercase leading-none truncate">
              Newcastle
            </span>
            <span className="text-[8px] font-bold tracking-[0.22em] text-muted-foreground uppercase mt-1.5 truncate">
              Financial Services
            </span>
          </div>
        </div>
        <div className="h-px bg-gold/45" />
        <p className="mt-2.5 text-[7.5px] tracking-[0.2em] text-muted-foreground/60 uppercase font-semibold">
          Plan · Grow · Prosper
        </p>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 px-3 pt-4 pb-2 flex-1">
        <p className="px-3 pb-2.5 text-[9px] font-bold tracking-[0.22em] uppercase text-muted-foreground/60">
          Navigation
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded px-3 py-2.5 text-[13px] font-medium transition-all duration-150",
                active
                  ? "bg-gold/[0.1] text-gold border-l-2 border-gold/70 pl-[10px]"
                  : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground border-l-2 border-transparent pl-[10px]"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0 transition-colors", active ? "text-gold" : "group-hover:text-foreground")} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Profile */}
      <div className="border-t border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/15 border border-gold/35">
            <span className="text-[11px] font-bold text-gold tracking-tight">BL</span>
          </div>
          <div className="min-w-0">
            <p className="text-[12.5px] font-semibold text-foreground truncate">Brad Lonergan</p>
            <p className="text-[10px] text-muted-foreground/70 truncate">Financial Adviser</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
