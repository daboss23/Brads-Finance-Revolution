import { Sidebar } from "@/components/layout/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-screen overflow-hidden bg-background">
      <div className="cmd-atmosphere" aria-hidden />
      <Sidebar />
      <main className="relative z-10 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
