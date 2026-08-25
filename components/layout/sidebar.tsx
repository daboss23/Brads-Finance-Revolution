"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Sparkles,
  Shield,
  FileSignature,
  Cpu,
  Vault,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NewcastleLogoFull } from "@/components/logo/newcastle-logo";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/sarah", label: "Sarah", icon: Sparkles },
  { href: "/fact-find", label: "Fact Find", icon: ClipboardList },
  { href: "/soa", label: "SOA", icon: FileSignature },
  { href: "/compliance", label: "Compliance", icon: Shield },
  { href: "/agents", label: "Agents", icon: Cpu },
  { href: "/evidence-vault", label: "Evidence Vault", icon: Vault },
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      {navItems.map(({ href, label, icon: Icon }) => {
        const active =
          pathname === href ||
          (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-[14px] font-medium transition-all duration-200",
              active
                ? "border border-gold/30 bg-gradient-to-r from-gold/[0.14] via-gold/[0.05] to-transparent text-gold shadow-[inset_0_1px_0_hsl(43_77%_74%/0.18),inset_0_-6px_14px_-8px_hsl(39_55%_28%/0.5),0_4px_14px_-6px_hsl(0_0%_0%/0.7),0_0_26px_-8px_hsl(43_53%_54%/0.55)]"
                : "border border-transparent text-muted-foreground/85 hover:border-white/[0.06] hover:bg-white/[0.04] hover:text-foreground hover:shadow-[inset_0_1px_0_hsl(44_70%_90%/0.07),0_4px_12px_-6px_hsl(0_0%_0%/0.6)]"
            )}
          >
            {active && (
              <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r-full bg-gold-bright shadow-[0_0_10px_1px_hsl(43_53%_54%/0.9)]" />
            )}
            <Icon
              className={cn(
                "h-[17px] w-[17px] shrink-0 transition-colors",
                active
                  ? "text-gold drop-shadow-[0_0_5px_hsl(43_53%_54%/0.6)]"
                  : "text-muted-foreground/65 group-hover:text-foreground/90"
              )}
            />
            <span className="tracking-tight">{label}</span>
          </Link>
        );
      })}
    </>
  );
}

function BradProfile() {
  return (
    <div className="glass-chip flex items-center gap-3 rounded-2xl px-3 py-2.5">
      <div className="glass-orb relative flex h-9 w-9 shrink-0 items-center justify-center border-gold/35 shadow-[0_1px_0_0_hsl(46_85%_92%/0.2)_inset,0_-4px_10px_-4px_hsl(220_25%_2%/0.7)_inset,0_0_18px_-6px_hsl(43_53%_54%/0.45),0_8px_22px_-8px_hsl(0_0%_0%/0.75)]">
        <span className="text-[12px] font-bold text-gold tracking-tight">BL</span>
        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[hsl(220_20%_4%)] bg-success shadow-[0_0_6px_0_hsl(158_57%_50%/0.7)]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-foreground truncate leading-tight">
          Brad Lonergan
        </p>
        <p className="text-[11px] text-muted-foreground/65 truncate mt-0.5">
          Financial Adviser · Online
        </p>
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="relative z-20 hidden h-screen w-[260px] shrink-0 flex-col border-r border-gold/[0.1] bg-[hsl(220_20%_4%_/_0.78)] shadow-[inset_-1px_0_0_hsl(44_70%_88%/0.05),8px_0_32px_-16px_hsl(0_0%_0%/0.8)] backdrop-blur-2xl lg:flex">
        {/* Brand */}
        <div className="px-5 pt-3 pb-4">
          <div className="flex items-center justify-center">
            <NewcastleLogoFull size={200} />
          </div>
          <p className="bmk-letter-pulse -mt-2 text-[9px] tracking-[0.3em] text-gold/75 uppercase font-semibold text-center">
            Plan · Grow · Prosper
          </p>
        </div>

        <div className="gold-rule mx-6" />

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 px-3 pt-3 pb-3 flex-1 overflow-y-auto">
          <NavLinks pathname={pathname} />
        </nav>

        {/* Profile */}
        <div className="px-4 pb-5">
          <div className="gold-rule mx-2 mb-4" />
          <BradProfile />
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-gold/[0.1] bg-[hsl(220_20%_4%_/_0.92)] px-3 py-2 backdrop-blur-xl lg:hidden">
        <div className="flex items-center">
          <NewcastleLogoFull size={130} />
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="btn-glass grid size-10 place-items-center rounded-xl text-foreground"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 left-0 flex w-[280px] flex-col border-r border-gold/[0.12] bg-[hsl(220_20%_4%_/_0.98)] pt-16 shadow-[0_0_80px_hsl(0_0%_0%/0.8)]">
            <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 pt-3 pb-3">
              <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
            </nav>
            <div className="px-4 pb-5">
              <div className="gold-rule mx-2 mb-4" />
              <BradProfile />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
