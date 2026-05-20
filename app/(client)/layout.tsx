export default function ClientLayout({ children }: { children: import("react").ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {children}
    </div>
  );
}
