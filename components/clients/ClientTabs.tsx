"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, ClipboardList, FileText, Shield, FileSignature } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  clientId: string;
}

export function ClientTabs({ clientId }: Props) {
  const pathname = usePathname();
  const base = `/clients/${clientId}`;

  const tabs = [
    { href: base, label: "Overview", icon: User },
    { href: `${base}/fact-find-review`, label: "Fact Find", icon: ClipboardList },
    { href: `${base}/forms`, label: "Strategies", icon: FileText },
    { href: `${base}/compliance`, label: "Compliance", icon: Shield },
    { href: `${base}/soa`, label: "SOA", icon: FileSignature },
  ];

  return (
    <div className="mb-8 flex items-center gap-1 overflow-x-auto border-b border-border/60">
      {tabs.map(({ href, label, icon: Icon }) => {
        const active =
          href === base ? pathname === base : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "relative inline-flex shrink-0 items-center gap-2 px-4 py-3 text-[13px] font-medium transition-colors",
              active
                ? "text-gold"
                : "text-muted-foreground/75 hover:text-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
            {active && (
              <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-gold rounded-full" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
