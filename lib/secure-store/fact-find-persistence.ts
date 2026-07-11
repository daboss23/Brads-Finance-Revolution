// Server-only bridge between the in-memory fact-find store and the
// encrypted persistence layer. Do NOT import from client components —
// this module pulls in node crypto and the storage backends.

import { secureSet, secureList } from "./index";
import {
  saveFactFind,
  type StoredFactFind,
} from "../sarah-fact-find-store";

const NAMESPACE = "fact-finds";

const HYDRATION_KEY = "__bmk_fact_find_hydration__";

// Rehydrate the in-memory map from encrypted storage. Runs once per
// server instance; safe to await from any route or server page.
export function ensureFactFindsHydrated(): Promise<void> {
  const g = globalThis as unknown as Record<string, Promise<void> | undefined>;
  if (!g[HYDRATION_KEY]) {
    g[HYDRATION_KEY] = (async () => {
      try {
        const entries = await secureList<StoredFactFind>(NAMESPACE);
        for (const { value } of entries) saveFactFind(value);
        console.log(`[fact-find-store] hydrated ${entries.length} fact finds`);
      } catch (e) {
        console.error(
          "[fact-find-store] hydration failed:",
          e instanceof Error ? e.message : e,
        );
      }
    })();
  }
  return g[HYDRATION_KEY] as Promise<void>;
}

// Encrypt and store durably FIRST, then update the in-memory map. If the
// encryption key is missing in production, secureSet throws
// EncryptionKeyMissingError and nothing is stored anywhere — plaintext
// PII at rest is never a possible state.
export async function persistFactFind(entry: StoredFactFind): Promise<void> {
  await secureSet(NAMESPACE, entry.clientId, entry);
  saveFactFind(entry);
}
