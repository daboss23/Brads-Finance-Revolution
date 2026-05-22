"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, ArrowRight, CheckCircle2 } from "lucide-react";
import { CLIENTS, STATUS_CONFIG, type Client, type FactFindStatus } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
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
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", mobile: "", notes: "" });

  const filtered =
    filter === "all" ? clients : clients.filter((c) => c.status === filter);

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
    <div className="px-14 py-12">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground mb-2">
            BMK Financial Services
          </p>
          <h1 className="text-[28px] font-semibold tracking-tight text-foreground leading-none">
            Clients
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {clients.length} clients in your pipeline
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded bg-gold px-4 py-2.5 text-[13px] font-semibold text-gold-foreground hover:bg-gold/90 transition-colors tracking-wide"
        >
          <Plus className="h-3.5 w-3.5" />
          New Client
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 mb-7 flex-wrap">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={cn(
              "rounded px-3 py-1.5 text-[12px] font-medium transition-all duration-150 border",
              filter === opt.value
                ? "border-gold/35 bg-gold/[0.08] text-gold"
                : "border-border/70 text-muted-foreground hover:text-foreground/80 hover:border-border hover:bg-white/[0.03] bg-transparent"
            )}
          >
            {opt.label}
            {opt.value !== "all" && (
              <span className="ml-1.5 text-[10px] opacity-50">
                {clients.filter((c) => c.status === opt.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border" style={{ background: "hsl(222 28% 7%)" }}>
              {["Client", "Progress", "Status", "Next Action", "Meeting", "Stage", "Updated"].map((h) => (
                <th
                  key={h}
                  className="px-6 py-5 text-left text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground"
                >
                  {h}
                </th>
              ))}
              <th className="px-6 py-5 w-12" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
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
                  className="hover:bg-gold/[0.06] transition-colors duration-150 group"
                >
                  <td className="pl-6 pr-10 py-6 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted border border-border text-[11px] font-bold text-foreground/70 tracking-tight">
                        {client.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <p className="font-medium text-[13px] text-foreground">{client.name}</p>
                        <p className="text-[11px] text-muted-foreground mt-1.5">{client.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 align-middle">
                    <div className="flex items-center gap-2.5">
                      <progress
                        value={client.progress}
                        max={100}
                        className={cn(
                          "bmk-progress w-28",
                          client.status === "in-progress" ? "bmk-progress-blue" : ""
                        )}
                      />
                      <span className="text-[12px] text-muted-foreground w-9 tabular-nums shrink-0">
                        {client.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-6 align-middle">
                    <Badge className={STATUS_CONFIG[client.status].className}>
                      {STATUS_CONFIG[client.status].label}
                    </Badge>
                  </td>
                  <td className="px-6 py-6 align-middle max-w-[200px]">
                    <p className="text-[13px] text-muted-foreground truncate">{client.nextAction}</p>
                  </td>
                  <td className="px-6 py-6 align-middle whitespace-nowrap">
                    <span className="text-[13px] text-muted-foreground">{client.meetingDate ?? "—"}</span>
                  </td>
                  <td className="px-6 py-6 align-middle whitespace-nowrap">
                    <span className="text-[13px] text-muted-foreground">{client.meetingStage}</span>
                  </td>
                  <td className="px-6 py-6 align-middle whitespace-nowrap">
                    <span className="text-[13px] text-muted-foreground">{client.lastActivity}</span>
                  </td>
                  <td className="px-6 py-6 align-middle">
                    <Link
                      href={`/clients/${client.id}`}
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center h-7 w-7 rounded hover:bg-white/[0.08]"
                    >
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* New Client Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          {success ? (
            <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-950/60 border border-emerald-800/50 mb-4">
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
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
                  className="rounded bg-gold px-4 py-2 text-sm font-medium text-gold-foreground hover:bg-gold/90 transition-colors"
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
