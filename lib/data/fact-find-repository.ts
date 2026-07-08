import { getClientAnswers } from "@/lib/fact-find-answers";
import { sarahToReviewAnswers } from "@/lib/sarah-fact-find-schema";
import { getFactFind } from "@/lib/sarah-fact-find-store";

export type FactFindSnapshot = {
  clientId: string;
  answers: Record<string, Record<string, string>>;
  source: "sarah" | "sample" | "empty";
  completionPercentage?: number;
  missingSections?: string[];
};

export type FactFindRepository = {
  getFactFindSnapshot(clientId: string): FactFindSnapshot;
};

export const mockFactFindRepository: FactFindRepository = {
  getFactFindSnapshot(clientId) {
    const sampleAnswers = getClientAnswers(clientId);
    const sarahEntry = getFactFind(clientId);
    if (!sarahEntry) {
      return {
        clientId,
        answers: sampleAnswers,
        source: Object.keys(sampleAnswers).length > 0 ? "sample" : "empty",
      };
    }

    const sarahAnswers = sarahToReviewAnswers(sarahEntry.data);
    const merged: Record<string, Record<string, string>> = { ...sampleAnswers };
    for (const [section, fields] of Object.entries(sarahAnswers)) {
      merged[section] = { ...(merged[section] ?? {}), ...fields };
    }

    return {
      clientId,
      answers: merged,
      source: "sarah",
      completionPercentage: sarahEntry.data.completionPercentage,
      missingSections: sarahEntry.data.missingSections,
    };
  },
};
