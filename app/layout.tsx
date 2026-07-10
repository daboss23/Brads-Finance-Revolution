import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SandboxBanner } from "@/components/system/SandboxBanner";

const geist = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "BMK CRM — Fact Find Platform",
  description: "Client onboarding and fact find management for BMK Financial Services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn(geist.variable, geistMono.variable, "font-sans antialiased")}>
        <SandboxBanner />
        {children}
      </body>
    </html>
  );
}
