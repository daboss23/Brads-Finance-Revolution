"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  ArrowRight,
  CheckCircle2,
  Search,
  Users,
  Activity,
  CalendarClock,
  AlertTriangle,
} from "lucide-react";
import { CLIENTS, STATUS_CONFIG, type Client, type FactFindStatus } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { ClientSoaBadge } from "@/components/soa/ClientSoaBadge";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const FILTER_OPTIONS: { label: string; value: FactFindStatus | "all" }[] = [
  { label: "All Clients", value: "all" },
  { label: "Link Sent", value: "link-sent" },
  { label: "In Progress", value: "in-progress" },
  { label: "Ready for Meeting", value: "ready-for-meeting" },
  { label: "Review Required", value: "review-required" },
  { label: "Complete", value: "complete" },
];

function buildNewClient(name: string, email: string, mobile: string, notes: string): Client {
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return {
    id,
    name,
    email,
    mobile,
    progress: 0,
    status: "link-sent",
    nextAction: "Send fact find link",
    meetingDate: null,
    meetingStage: "Awaiting Start",
    adviser: "Brad Lonergan",
    lastActivity: "Just now",
    notes,
    factFindSections: [
      { name: "Personal Details", status: "missing" },
      { name: "Income & Employment", status: "missing" },
      { name: "Assets & Liabilities", status: "missing" },
      { name: "Expenses", status: "missing" },
      { name: "Superannuation", status: "missing" },
      { name: "Insurance", status: "missing" },
      { name: "Goals & Objectives", status: "missing" },
    ],
    timeline: [
      { date: "19 May 2026", event: "Client record created", type: "system" },
    ],
  };
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(CLIENTS);
  const [filter, setFilter] = useState<FactFindStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", mobile: "", notes: "" });

  const filtered = useMemo(() => {
    const byStatus =
      filter === "all" ? clients : clients.filter((c) => c.status === filter);
    const q = query.trim().toLowerCase();
    if (!q) return byStatus;
    return byStatus.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.nextAction.toLowerCase().includes(q),
    );
  }, [clients, filter, query]);

  const summary = useMemo(
    () => [
      {
        label: "Files In Play",
        value: clients.length,
        detail: "Clients moving through advice production",
        icon: Users,
        tone: "text-gold",
      },
      {
        label: "Discovery Active",
        value: clients.filter((c) => c.status === "in-progress").length,
        detail: "Completing Financial Discovery with Sarah",
        icon: Activity,
        tone: "text-teal-accent",
      },
      {
        label: "Ready For Meeting",
        value: clients.filter((c) => c.status === "ready-for-meeting").length,
        detail: "Prepared and awaiting adviser meeting",
        icon: CalendarClock,
        tone: "text-success",
      },
      {
        label: "Needs Review",
        value: clients.filter((c) => c.status === "review-required").length,
        detail: "Waiting on Brad before the file can move",
        icon: AlertTriangle,
        tone: "text-warning",
      },
    ],
    [clients],
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.mobile) return;
    const newClient = buildNewClient(form.name, form.email, form.mobile, form.notes);
    setClients((prev) => [newClient, ...prev]);
    setSuccess(true);
    setTimeout(() => {
      setOpen(false);
      setSuccess(false);
      setForm({ name: "", email: "", mobile: "", notes: "" });
    }, 1800);
  }

  return (
    <div className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-10">
      <PageHeader
        title="Clients"
        subtitle={`${clients.length} files moving through the advice production system.`}
      >
        <button
          onClick={() => setOpen(true)}
          className="btn-gold inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-semibold tracking-wide transition hover:scale-[1.02]"
        >
          <Plus className="h-3.5 w-3.5" />
          New Client
        </button>
      </PageHeader>

      {/* Summary metrics */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map(({ label, value, detail, icon: Icon, tone }) => (
          <div
            key={label}
            className="glass-panel glass-hover px-4 py-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="cmd-label text-gold/75">{label}</p>
                <p className="mt-2.5 text-[30px] font-semibold leading-none text-foreground tabular-nums">
                  {value}
                </p>
              </div>
              <div className={cn("grid size-10 place-items-center rounded-xl border border-white/[0.09] bg-black/25", tone)}>
                <Icon className="size-4" />
              </div>
            </div>
            <p className="mt-2.5 text-[11.5px] leading-4 text-muted-foreground/68">{detail}</p>
          </div>
        ))}
      </div>

      {/* Search + filter rail */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <label className="flex h-10 min-w-[220px] flex-1 items-center gap-2 rounded-full border border-white/[0.1] bg-black/25 px-3 text-muted-foreground/70 shadow-[inset_0_1px_0_hsl(44_70%_88%/0.05)] sm:max-w-[320px]">
          <Search className="size-4 shrink-0" />
          <span className="sr-only">Search clients</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-full min-w-0 flex-1 bg-transparent text-[12.5px] text-foreground/86 outline-none placeholder:text-muted-foreground/55"
            placeholder="Search name, email or action..."
            type="search"
          />
        </label>
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={cn(
                "rounded-full px-3 py-1.5 text-[12px] font-medium transition-all duration-150 border",
                filter === opt.value
                  ? "border-gold/40 bg-gold/[0.1] text-gold shadow-[inset_0_1px_0_hsl(44_75%_85%/0.1),0_0_18px_-10px_hsl(var(--gold)/0.6)]"
                  : "border-border/70 text-muted-foreground hover:text-foreground/80 hover:border-border hover:bg-white/[0.03] bg-transparent"
              )}
            >
              {opt.label}
              {opt.value !== "all" && (
                <span className="ml-1.5 text-[10px] opacity-50 tabular-nums">
                  {clients.filter((c) => c.status === opt.value).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Client operating board */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.07] bg-black/30">
                {["Client", "Fact Find", "Status", "Next Action", "Meeting", "Stage", "Updated"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/70"
                  >
                    {h}
                  </th>
                ))}
                <th className="px-5 py-4 w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No clients match this filter.
                  </td>
                </tr>
              ) : (
                filtered.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-gold/[0.05] transition-colors duration-150 group"
                  >
                    <td className="pl-5 pr-8 py-4 align-middle">
                      <div className="flex items-center gap-3 py-1.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/20 bg-gradient-to-b from-gold/[0.12] to-transparent text-[11px] font-bold text-gold/85 tracking-tight">
                          {client.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <p className="font-medium text-[13px] text-foreground">{client.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-[11px] text-muted-foreground">{client.email}</p>
                            <ClientSoaBadge clientId={client.id} />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <div className="flex items-center gap-2.5">
                        <progress
                          value={client.progress}
                          max={100}
                          className={cn(
                            "bmk-progress w-24",
                            client.status === "in-progress" ? "bmk-progress-blue" : ""
                          )}
                        />
                        <span className="text-[12px] text-muted-foreground w-9 tabular-nums shrink-0">
                          {client.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <Badge className={STATUS_CONFIG[client.status].className}>
                        {STATUS_CONFIG[client.status].label}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 align-middle max-w-[200px]">
                      <p className="text-[12.5px] text-muted-foreground truncate">{client.nextAction}</p>
                    </td>
                    <td className="px-5 py-4 align-middle whitespace-nowrap">
                      <span className="text-[12.5px] text-muted-foreground">{client.meetingDate ?? "—"}</span>
                    </td>
                    <td className="px-5 py-4 align-middle whitespace-nowrap">
                      <span className="text-[12.5px] text-muted-foreground">{client.meetingStage}</span>
                    </td>
                    <td className="px-5 py-4 align-middle whitespace-nowrap">
                      <span className="text-[12.5px] text-muted-foreground">{client.lastActivity}</span>
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <Link
                        href={`/clients/${client.id}`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center h-7 w-7 rounded-full border border-transparent hover:border-gold/30 hover:bg-gold/[0.08]"
                      >
                        <ArrowRight className="h-3.5 w-3.5 text-gold/80" />
                        <span className="sr-only">Open {client.name}</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Client Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          {success ? (
            <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 border border-success/30 mb-4">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <p className="text-base font-semibold text-foreground">Client added</p>
              <p className="text-sm text-muted-foreground mt-1">
                {form.name} has been added to your pipeline.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>New Client</DialogTitle>
                <DialogDescription>
                  Add a new client to your fact find pipeline.
                </DialogDescription>
              </DialogHeader>

              <div className="px-6 py-5 space-y-4">
                {[
                  { key: "name", label: "Full Name", type: "text", placeholder: "e.g. James & Fiona Carr", required: true },
                  { key: "email", label: "Email", type: "email", placeholder: "client@email.com", required: true },
                  { key: "mobile", label: "Mobile", type: "tel", placeholder: "0400 000 000", required: true },
                ].map(({ key, label, type, placeholder, required }) => (
                  <div key={key} className="space-y-1.5">
                    <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">
                      {label} {required && <span className="text-destructive">*</span>}
                    </label>
                    <input
                      type={type}
                      value={form[key as keyof typeof form]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      required={required}
                      className="w-full rounded border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                ))}
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">
                    Adviser Notes
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    placeholder="Optional notes for your reference…"
                    rows={3}
                    className="w-full rounded border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                  />
                </div>
              </div>

              <DialogFooter>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gold rounded px-4 py-2 text-sm font-medium transition-colors"
                >
                  Add Client
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
