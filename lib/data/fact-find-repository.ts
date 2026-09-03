import { getClientAnswers } from "@/lib/fact-find-answers";
import { athenaToReviewAnswers } from "@/lib/athena-fact-find-schema";
import { getFactFind } from "@/lib/athena-fact-find-store";

export type FactFindSnapshot = {
  clientId: string;
  answers: Record<string, Record<string, string>>;
  source: "athena" | "sample" | "empty";
  completionPercentage?: number;
  missingSections?: string[];
};

export type FactFindRepository = {
  getFactFindSnapshot(clientId: string): FactFindSnapshot;
};

export const mockFactFindRepository: FactFindRepository = {
  getFactFindSnapshot(clientId) {
    const sampleAnswers = getClientAnswers(clientId);
    const athenaEntry = getFactFind(clientId);
    if (!athenaEntry) {
      return {
        clientId,
        answers: sampleAnswers,
        source: Object.keys(sampleAnswers).length > 0 ? "sample" : "empty",
      };
    }

    const athenaAnswers = athenaToReviewAnswers(athenaEntry.data);
    const merged: Record<string, Record<string, string>> = { ...sampleAnswers };
    for (const [section, fields] of Object.entries(athenaAnswers)) {
      merged[section] = { ...(merged[section] ?? {}), ...fields };
    }

    return {
      clientId,
      answers: merged,
      source: "athena",
      completionPercentage: athenaEntry.data.completionPercentage,
      missingSections: athenaEntry.data.missingSections,
    };
  },
};
