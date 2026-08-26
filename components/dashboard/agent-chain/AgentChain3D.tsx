"use client";

// The dashboard's Agent Intelligence Chain: the eight-agent pipeline rendered as
// a live 3D constellation. WebGL is code-split out of the server render and only
// streams client-side, with a CSS constellation standing in until it arrives.

import dynamic from "next/dynamic";
import type { ChainAgentInput } from "./AgentChain";

const AgentChainCanvas = dynamic(() => import("./AgentChainCanvas"), {
  ssr: false,
  loading: () => (
    <div className="size-full bg-[radial-gradient(60%_80%_at_50%_50%,hsl(var(--gold)/0.08),transparent_70%)]" />
  ),
});

export function AgentChain3D({
  agents,
  className,
}: {
  agents?: ChainAgentInput[];
  className?: string;
}) {
  return <AgentChainCanvas agents={agents} className={className} />;
}
