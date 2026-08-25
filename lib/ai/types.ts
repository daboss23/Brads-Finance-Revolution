import type { AgentDefinition, AgentOutput } from "@/lib/agents/types";

export type GenerateJsonOptions = {
  provider: "mock" | "anthropic" | "openai" | "deterministic";
  model: string;
};

export type AgentJsonProvider = {
  id: GenerateJsonOptions["provider"];
  generateJson(agent: AgentDefinition, input: unknown): Promise<AgentOutput>;
};
