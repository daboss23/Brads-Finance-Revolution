"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileSignature,
  Mail,
  Orbit,
  PenLine,
  RadioTower,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GlowPanel } from "@/components/dashboard/CommandCentreModules";
import type { DashboardTone, WorkflowStage } from "@/lib/dashboard-command-centre";

type IconComponent = ComponentType<{ className?: string }>;

const stageIcons: Record<string, IconComponent> = {
  "link-sent": Mail,
  discovery: ClipboardList,
  "sarah-complete": CheckCircle2,
  "beacon-structured": RadioTower,
  "guardian-check": ShieldCheck,
  "scribe-prep": PenLine,
  "orion-evidence": Orbit,
  "atlas-soa": FileSignature,
};

const toneText: Record<DashboardTone, string> = {
  cyan: "text-teal-accent",
  blue: "text-blue-accent",
  gold: "text-gold",
  emerald: "text-success",
  orange: "text-warning",
  violet: "text-teal-accent",
  slate: "text-foreground/78",
};

const toneBorder: Record<DashboardTone, string> = {
  cyan: "border-teal-accent/25",
  blue: "border-blue-accent/25",
  gold: "border-gold/30",
  emerald: "border-success/25",
  orange: "border-warning/30",
  violet: "border-teal-accent/25",
  slate: "border-white/[0.10]",
};

const toneBg: Record<DashboardTone, string> = {
  cyan: "bg-teal-accent/10",
  blue: "bg-blue-accent/10",
  gold: "bg-gold/[0.12]",
  emerald: "bg-success/10",
  orange: "bg-warning/[0.12]",
  violet: "bg-teal-accent/10",
  slate: "bg-white/[0.045]",
};

// 8 slots on the ring — corners share identical insets, sides and poles are
// centred, so the constellation reads perfectly symmetrical at md and above.
const nodePositions = [
  "md:left-1/2 md:top-[2%] md:-translate-x-1/2",
  "md:right-[4%] md:top-[15%]",
  "md:right-[1%] md:top-1/2 md:-translate-y-1/2",
  "md:right-[4%] md:bottom-[15%]",
  "md:left-1/2 md:bottom-[2%] md:-translate-x-1/2",
  "md:left-[4%] md:bottom-[15%]",
  "md:left-[1%] md:top-1/2 md:-translate-y-1/2",
  "md:left-[4%] md:top-[15%]",
];

// Tooltip flips toward the centre so it never clips the panel edge.
const tooltipPositions = [
  "md:left-1/2 md:top-full md:mt-2 md:-translate-x-1/2",
  "md:right-0 md:top-full md:mt-2",
  "md:right-0 md:top-full md:mt-2",
  "md:bottom-full md:right-0 md:mb-2",
  "md:bottom-full md:left-1/2 md:mb-2 md:-translate-x-1/2",
  "md:bottom-full md:left-0 md:mb-2",
  "md:left-0 md:top-full md:mt-2",
  "md:left-0 md:top-full md:mt-2",
];

const arrowPositions = [
  "right-[31%] top-[8%] rotate-[23deg]",
  "right-[11%] top-[27%] rotate-[68deg]",
  "right-[11%] bottom-[27%] rotate-[113deg]",
  "right-[31%] bottom-[8%] rotate-[158deg]",
  "left-[31%] bottom-[8%] rotate-[203deg]",
  "left-[11%] bottom-[27%] rotate-[248deg]",
  "left-[11%] top-[27%] rotate-[293deg]",
  "left-[31%] top-[8%] rotate-[338deg]",
];

export function IntelligenceEngine({
  stages,
  totalFilesInFlow,
  averageTimeInFlow,
  flowVelocity,
  conversionToMeeting,
}: {
  stages: WorkflowStage[];
  totalFilesInFlow: number;
  averageTimeInFlow: string;
  flowVelocity: string;
  conversionToMeeting: string;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <GlowPanel
      eyebrow="System Core"
      title="Intelligence Engine"
      variant="emphasis"
      className="min-h-[548px]"
      action={
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-success">
          <span className="status-live size-1.5 rounded-full bg-success text-success" />
          Live
        </div>
      }
    >
      <p className="mt-3 max-w-[440px] text-[12px] leading-5 text-muted-foreground/70">
        Sarah opens discovery, then Beacon, Guardian, Scribe, Orion and ATLAS
        carry each file through to signed advice.
      </p>

      <div className="relative mt-5 min-h-[500px] rounded-2xl border border-gold/[0.08] bg-black/20 px-3 py-4 md:min-h-[560px]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--gold)/0.1),transparent_36%),radial-gradient(circle_at_54%_42%,hsl(var(--teal-accent)/0.07),transparent_32%)]" />
          <div className="engine-energy-haze absolute left-1/2 top-1/2 hidden size-[410px] -translate-x-1/2 -translate-y-1/2 rounded-full md:block" />
          <div className="absolute left-1/2 top-1/2 hidden size-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/[0.14] md:block" />
          <div className="engine-energy absolute left-1/2 top-1/2 hidden size-[324px] -translate-x-1/2 -translate-y-1/2 rounded-full md:block" />

          {/* Conic energy sweep — the turbine */}
          {!reducedMotion && (
            <motion.div
              aria-hidden
              className="absolute left-1/2 top-1/2 hidden size-[330px] rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,hsl(var(--gold)/0.35)_28deg,hsl(var(--teal-accent)/0.18)_52deg,transparent_88deg)] [mask-image:radial-gradient(circle,transparent_62%,black_64%,black_70%,transparent_72%)] md:block"
              initial={{ x: "-50%", y: "-50%", rotate: 0 }}
              animate={{ x: "-50%", y: "-50%", rotate: 360 }}
              transition={{ duration: 14, ease: "linear", repeat: Infinity }}
            />
          )}

          {/* Orbiting particle */}
          {!reducedMotion && (
            <motion.div
              aria-hidden
              className="absolute left-1/2 top-1/2 hidden size-[306px] md:block"
              initial={{ x: "-50%", y: "-50%", rotate: 0 }}
              animate={{ x: "-50%", y: "-50%", rotate: -360 }}
              transition={{ duration: 22, ease: "linear", repeat: Infinity }}
            >
              <span className="absolute left-1/2 top-0 size-1.5 -translate-x-1/2 rounded-full bg-gold-bright shadow-[0_0_12px_2px_hsl(var(--gold)/0.8)]" />
            </motion.div>
          )}

          <div className="dashboard-engine-orbit absolute left-1/2 top-1/2 hidden size-[306px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-gold/[0.16] md:block" />
          <div className="absolute left-1/2 top-1/2 hidden size-[230px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal-accent/[0.1] md:block" />
          <div className="engine-wave absolute left-1/2 top-1/2 hidden size-48 -translate-x-1/2 -translate-y-1/2 rounded-full md:block" />
          <div className="engine-wave engine-wave-late absolute left-1/2 top-1/2 hidden size-48 -translate-x-1/2 -translate-y-1/2 rounded-full md:block" />

          {arrowPositions.map((position) => (
            <ChevronRight
              key={position}
              className={cn("absolute hidden size-4 text-gold/[0.38] md:block", position)}
            />
          ))}
        </div>

        {/* Breathing Sarah core */}
        <div className="relative z-10 mx-auto grid max-w-[280px] justify-items-center pt-4 md:absolute md:left-1/2 md:top-1/2 md:max-w-none md:-translate-x-1/2 md:-translate-y-1/2 md:pt-0">
          <motion.div
            className="dashboard-engine-core grid size-48 place-items-center rounded-full border border-gold/[0.3] bg-[radial-gradient(circle_at_32%_24%,hsl(46_85%_92%/0.22),transparent_26%),radial-gradient(circle_at_62%_48%,hsl(var(--gold)/0.32),transparent_32%),radial-gradient(circle_at_50%_88%,hsl(var(--teal-accent)/0.2),transparent_38%),radial-gradient(circle_at_center,hsl(var(--teal-accent)/0.12),hsl(220_20%_6%/0.94)_64%)] shadow-[inset_0_1px_0_hsl(44_80%_90%/0.25),inset_0_-14px_28px_-16px_hsl(var(--teal-accent)/0.25),0_0_54px_-8px_hsl(var(--gold)/0.6),0_0_60px_-14px_hsl(var(--teal-accent)/0.45)]"
            animate={reducedMotion ? undefined : { scale: [1, 1.03, 1] }}
            transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
          >
            <div className="text-center">
              <div className="mx-auto grid size-10 place-items-center rounded-full border border-gold/30 bg-black/30 text-gold shadow-[0_0_18px_-4px_hsl(var(--gold)/0.7)]">
                <Sparkles className="size-5" />
              </div>
              <p className="mt-2.5 text-[20px] font-semibold leading-none text-foreground">
                Sarah
              </p>
              <p className="mt-1 cmd-label text-muted-foreground/72">Client Discovery</p>
              <div className="mx-auto mt-2.5 w-fit rounded-lg border border-gold/25 bg-black/30 px-3 py-1.5 shadow-[inset_0_1px_0_hsl(44_80%_90%/0.1)]">
                <p className="cmd-label text-muted-foreground/52">In flow</p>
                <p className="mt-0.5 text-[20px] font-semibold leading-none text-foreground tabular-nums">
                  {totalFilesInFlow}
                </p>
                <div className="mx-auto mt-1.5 flex h-2 items-end justify-center gap-[3px]" aria-hidden>
                  {[0, 1, 2, 3, 4, 5, 6].map((bar) => (
                    <span
                      key={bar}
                      className="freq-bar h-full w-[2px] rounded-full bg-teal-accent/70"
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="relative z-20 mt-6 grid gap-3 md:static md:mt-0 md:block">
          {stages.map((stage, index) => (
            <EngineStageNode
              key={stage.id}
              className={nodePositions[index]}
              tooltipClassName={tooltipPositions[index]}
              index={index + 1}
              stage={stage}
              entranceDelay={reducedMotion ? 0 : index * 0.07}
              reducedMotion={!!reducedMotion}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 rounded-2xl border border-white/[0.08] bg-black/[0.18] p-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-center">
        <EngineStat label="Average time in flow" value={averageTimeInFlow} tone="cyan" />
        <EngineStat label="Flow velocity" value={flowVelocity} tone="emerald" />
        <EngineStat label="Conversion to meeting" value={conversionToMeeting} tone="gold" />
        <Link
          href="/sarah"
          className="inline-flex min-h-10 items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 text-[12px] font-medium text-muted-foreground/78 transition hover:border-gold/30 hover:text-gold"
        >
          View engine analytics
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </GlowPanel>
  );
}

const stageStateCopy: Record<WorkflowStage["state"], string> = {
  active: "Processing now",
  waiting: "Awaiting handoff",
  blocked: "Needs attention",
  complete: "Stage clear",
};

function EngineStageNode({
  stage,
  index,
  className,
  tooltipClassName,
  entranceDelay,
  reducedMotion,
}: {
  stage: WorkflowStage;
  index: number;
  className?: string;
  tooltipClassName?: string;
  entranceDelay: number;
  reducedMotion: boolean;
}) {
  const Icon = stageIcons[stage.id] ?? Activity;

  return (
    <div
      className={cn(
        "group/node md:absolute md:z-20 md:w-40 md:hover:z-40 md:focus-within:z-40",
        className,
      )}
    >
      <motion.div
        tabIndex={0}
        aria-label={`Stage ${index}: ${stage.label}. ${stage.count} files. ${stageStateCopy[stage.state]}.`}
        className={cn(
          "cursor-default rounded-2xl border bg-[linear-gradient(165deg,hsl(46_80%_92%/0.06),transparent_30%),linear-gradient(180deg,hsl(220_16%_9%/0.55),hsl(220_20%_4%/0.6))] p-3 shadow-[inset_0_1px_0_hsl(44_70%_88%/0.14),0_16px_34px_-28px_hsl(0_0%_0%/0.95)] outline-none backdrop-blur-xl transition-[border-color,box-shadow] duration-200 ease-out group-hover/node:border-gold/[0.45] group-hover/node:shadow-[inset_0_1px_0_hsl(44_70%_88%/0.2),0_0_34px_-10px_hsl(var(--gold)/0.55),0_18px_38px_-26px_hsl(0_0%_0%/0.95)] focus-visible:border-gold/[0.55] focus-visible:shadow-[0_0_0_2px_hsl(var(--gold)/0.35)]",
          toneBorder[stage.tone],
          stage.state === "active" && "dashboard-stage-active",
        )}
        initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={reducedMotion ? undefined : { scale: 1.06 }}
        transition={{
          type: "spring",
          stiffness: 340,
          damping: 24,
          delay: entranceDelay,
        }}
      >
      <div className="flex items-start gap-2.5">
        <div
          className={cn(
            "relative grid size-9 shrink-0 place-items-center rounded-xl border transition-shadow duration-200 group-hover/node:shadow-[0_0_16px_-4px_hsl(var(--gold)/0.7)]",
            toneBorder[stage.tone],
            toneBg[stage.tone],
            toneText[stage.tone],
          )}
        >
          <Icon className="size-4" />
          <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full border border-black/50 bg-card text-[10px] font-semibold text-foreground">
            {stage.count}
          </span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-muted-foreground/52 tabular-nums">
              {index}
            </span>
            <p className="text-[10.5px] font-bold uppercase leading-4 tracking-[0.1em] text-foreground/90">
              {stage.label}
            </p>
          </div>
          <p className="mt-1 text-[10.5px] leading-4 text-muted-foreground/68 md:hidden lg:block">
            {stage.description}
          </p>
        </div>
      </div>
      </motion.div>

      {/* Hover intel card — surfaces stage detail without shifting layout */}
      <div
        className={cn(
          "pointer-events-none absolute z-40 hidden w-44 translate-y-1 rounded-xl border border-gold/[0.28] bg-[linear-gradient(180deg,hsl(219_16%_10%/0.97),hsl(220_20%_4%/0.98))] p-3 opacity-0 shadow-[0_0_38px_-12px_hsl(var(--gold)/0.5),0_22px_44px_-24px_hsl(0_0%_0%/0.95)] backdrop-blur-2xl transition-[opacity,transform] duration-200 ease-out group-hover/node:translate-y-0 group-hover/node:opacity-100 group-focus-within/node:translate-y-0 group-focus-within/node:opacity-100 md:block",
          tooltipClassName,
        )}
      >
        <p className="cmd-label text-gold/85">Stage {index}</p>
        <p className="mt-1 text-[12px] font-semibold leading-4 text-foreground/92">
          {stage.label}
        </p>
        <p className="mt-1.5 text-[10.5px] leading-4 text-muted-foreground/72">
          {stage.description}
        </p>
        <div className="mt-2 flex items-center justify-between border-t border-white/[0.08] pt-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/55">
            {stageStateCopy[stage.state]}
          </span>
          <span className={cn("text-[13px] font-semibold tabular-nums", toneText[stage.tone])}>
            {stage.count}
          </span>
        </div>
      </div>
    </div>
  );
}

function EngineStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: DashboardTone;
}) {
  return (
    <div className="border-white/[0.08] px-2 sm:border-r">
      <p className="text-[11px] text-muted-foreground/58">{label}</p>
      <p className={cn("mt-1 text-[16px] font-semibold tabular-nums", toneText[tone])}>
        {value}
      </p>
    </div>
  );
}
