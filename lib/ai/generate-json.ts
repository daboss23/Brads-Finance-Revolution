import type { AgentDefinition, AgentOutput } from "@/lib/agents/types";
import type { GenerateJsonOptions } from "@/lib/ai/types";
import { mockProvider } from "@/lib/ai/providers/mock";
import { anthropicProvider } from "@/lib/ai/providers/anthropic";
import { openaiProvider } from "@/lib/ai/providers/openai";

export async function generateAgentJson(
  agent: AgentDefinition,
  input: unknown,
  options: GenerateJsonOptions,
): Promise<AgentOutput> {
  if (!agent.usesAI || options.provider === "deterministic") {
    return mockProvider.generateJson(agent, input);
  }

  const provider =
    options.provider === "anthropic"
      ? anthropicProvider
      : options.provider === "openai"
      ? openaiProvider
      : mockProvider;

  try {
    return await provider.generateJson(agent, input);
  } catch {
    return mockProvider.generateJson(agent, input);
  }
}
