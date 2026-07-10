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
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_12%,hsl(var(--gold)/0.09),transparent_30%),radial-gradient(circle_at_85%_6%,hsl(var(--teal-accent)/0.05),transparent_26%),radial-gradient(circle_at_50%_115%,hsl(var(--gold-shadow)/0.3),transparent_38%),linear-gradient(150deg,hsl(219_18%_9%),hsl(220_20%_3%)_58%,hsl(222_20%_5%))]" />
      <div className="absolute inset-x-8 top-5 -z-10 h-28 rounded-full bg-gold/[0.06] blur-3xl" />
      <div className="absolute bottom-0 right-10 -z-10 size-56 rounded-full bg-teal-accent/[0.05] blur-3xl" />

      <section className="mx-auto max-w-[1480px] overflow-hidden rounded-3xl border border-gold/[0.14] bg-[linear-gradient(135deg,hsl(219_16%_10%/0.88),hsl(220_20%_4%/0.94))] shadow-[inset_0_1px_0_hsl(44_70%_88%/0.12),0_0_0_1px_hsl(0_0%_0%/0.3),0_32px_90px_-34px_hsl(0_0%_0%/0.95),0_0_70px_-42px_hsl(var(--gold)/0.5)] backdrop-blur-2xl">
        <DashboardHeader activeFiles={dashboard.activeFiles} />

        <div className="grid gap-3 p-3 xl:gap-4 xl:p-4">
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {dashboard.metrics.map((metric) => (
              <MetricCard key={metric.id} metric={metric} />
            ))}
          </section>

          <section className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start 2xl:grid-cols-[340px_minmax(0,1fr)_380px]">
            <div className="order-2 xl:order-3 xl:col-span-2 2xl:order-1 2xl:col-span-1">
              <PriorityQueue items={dashboard.priorityQueue} />
            </div>
            <div className="order-1 xl:order-1 2xl:order-2">
              <ClientProgressEngine
                stages={dashboard.workflowStages}
                totalFilesInFlow={dashboard.totalFilesInFlow}
                averageTimeInFlow={dashboard.averageTimeInFlow}
                flowVelocity={dashboard.flowVelocity}
                conversionToMeeting={dashboard.conversionToMeeting}
              />
            </div>
            <div className="order-3 xl:order-2 2xl:order-3 flex flex-col gap-3">
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
