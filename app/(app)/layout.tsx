import { Sidebar } from "@/components/layout/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-[100dvh] overflow-hidden bg-background">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-gold px-4 py-2 font-semibold text-gold-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to main content
      </a>
      <div className="cmd-atmosphere" aria-hidden />
      <Sidebar />
      <main id="main-content" tabIndex={-1} className="relative z-10 flex-1 overflow-y-auto pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
