import { Sidebar } from "@/components/layout/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-[100dvh] overflow-hidden bg-background">
      <div className="cmd-atmosphere" aria-hidden />
      <Sidebar />
      <main className="relative z-10 flex-1 overflow-y-auto pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
