"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/fact-find", label: "Fact Find", icon: ClipboardList },
];

const bottomNav = [
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-border bg-card shrink-0">
      <div className="flex h-16 items-center px-5 border-b border-border">
        <div>
          <div className="text-xs font-bold tracking-[0.2em] text-gold uppercase">
            BMK
          </div>
          <div className="text-[10px] text-muted-foreground tracking-wide leading-tight">
            Financial Services
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 py-4 px-2 gap-0.5">
        <p className="px-3 pb-2 text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/60">
          Navigation
        </p>
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "group flex items-center gap-2.5 rounded px-3 py-2 text-[13px] font-medium transition-all duration-150 border-l-2",
              isActive(href)
                ? "border-gold text-gold bg-gold/[0.06]"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 shrink-0 transition-colors",
                isActive(href) ? "text-gold" : "text-muted-foreground group-hover:text-foreground"
              )}
            />
            {label}
          </Link>
        ))}
      </div>

      <div className="border-t border-border px-2 py-3 flex flex-col gap-0.5">
        {bottomNav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "group flex items-center gap-2.5 rounded px-3 py-2 text-[13px] font-medium transition-all duration-150 border-l-2",
              isActive(href)
                ? "border-gold text-gold bg-gold/[0.06]"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
            )}
          >
            <Icon className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
            {label}
          </Link>
        ))}
        <div className="mt-2 flex items-center gap-2.5 px-3 py-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold/10 border border-gold/20">
            <span className="text-[11px] font-semibold text-gold">BL</span>
          </div>
          <div>
            <p className="text-[12px] font-medium text-foreground leading-none">
              Brad Lonergan
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Adviser</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
