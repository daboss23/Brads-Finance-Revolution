import type { AgentJsonProvider } from "@/lib/ai/types";
import { mockProvider } from "@/lib/ai/providers/mock";
import { anthropicConfigured } from "@/lib/ai/anthropic-credentials";

export const anthropicProvider: AgentJsonProvider = {
  id: "anthropic",
  async generateJson(agent, input) {
    if (!anthropicConfigured()) {
      return mockProvider.generateJson(agent, input);
    }
    // External model calls are intentionally not enabled by default.
    // This keeps agent runs conservative until provider credentials and
    // prompt safety gates are wired for production usage.
    return mockProvider.generateJson(agent, input);
  },
};
