import type { AgentJsonProvider } from "@/lib/ai/types";
import { mockProvider } from "@/lib/ai/providers/mock";

export const openaiProvider: AgentJsonProvider = {
  id: "openai",
  async generateJson(agent, input) {
    if (!process.env.OPENAI_API_KEY) {
      return mockProvider.generateJson(agent, input);
    }
    return mockProvider.generateJson(agent, input);
  },
};
