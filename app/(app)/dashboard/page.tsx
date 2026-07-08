import {
  AgentActivityStrip,
  ClientProgressEngine,
  DashboardHeader,
  FlowReadingCard,
  MetricCard,
  NextBestActions,
  PipelineSnapshot,
  PriorityQueue,
  SarahBriefPanel,
} from "@/components/dashboard/CommandCentreModules";
import { getCommandCentreDashboard } from "@/lib/dashboard-command-centre";

export default function DashboardPage() {
  const dashboard = getCommandCentreDashboard();

  return (
    <main className="relative isolate min-h-[100dvh] overflow-hidden px-4 py-5 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_18%,hsl(184_88%_58%/0.15),transparent_26%),radial-gradient(circle_at_86%_8%,hsl(286_88%_64%/0.12),transparent_24%),radial-gradient(circle_at_50%_110%,hsl(var(--gold)/0.16),transparent_32%),linear-gradient(145deg,hsl(216_30%_12%),hsl(220_30%_4%)_54%,hsl(270_28%_8%))]" />
      <div className="absolute inset-x-8 top-5 -z-10 h-28 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="absolute bottom-0 right-10 -z-10 size-56 rounded-full bg-violet-500/10 blur-3xl" />

      <section className="mx-auto max-w-[1480px] overflow-hidden rounded-3xl border border-cyan-200/20 bg-[linear-gradient(135deg,hsl(220_18%_12%/0.84),hsl(220_24%_5%/0.92))] shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_0_0_1px_rgba(217,70,239,0.10),0_32px_90px_-34px_rgba(0,0,0,0.95),0_0_70px_-42px_rgba(34,211,238,0.85)] backdrop-blur-2xl">
        <DashboardHeader activeFiles={dashboard.activeFiles} />

        <div className="grid gap-3 p-3 xl:gap-4 xl:p-4">
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {dashboard.metrics.map((metric) => (
              <MetricCard key={metric.id} metric={metric} />
            ))}
          </section>

          <section className="grid gap-3 xl:grid-cols-[360px_minmax(0,1fr)_420px] xl:items-start">
            <div className="order-2 xl:order-1">
              <PriorityQueue items={dashboard.priorityQueue} />
            </div>
            <div className="order-1 xl:order-2">
              <ClientProgressEngine
                stages={dashboard.workflowStages}
                totalFilesInFlow={dashboard.totalFilesInFlow}
                averageTimeInFlow={dashboard.averageTimeInFlow}
                flowVelocity={dashboard.flowVelocity}
                conversionToMeeting={dashboard.conversionToMeeting}
              />
            </div>
            <div className="order-3 flex flex-col gap-3">
              <SarahBriefPanel insights={dashboard.sarahBrief} />
              <NextBestActions items={dashboard.nextBestActions} />
            </div>
          </section>

          <section className="grid gap-3 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.9fr)]">
            <PipelineSnapshot
              items={dashboard.pipelineSnapshot}
              totalFiles={dashboard.totalFilesInFlow}
            />
            <FlowReadingCard
              insight={dashboard.flowReading.insight}
              timestamp={dashboard.flowReading.timestamp}
            />
          </section>

          <AgentActivityStrip
            agents={dashboard.agentActivity}
            systemStatus={dashboard.systemStatus}
            mockModeActive={dashboard.mockModeActive}
          />
        </div>
      </section>
    </main>
  );
}
