// Server-only bridge between the in-memory fact find store and the
// encrypted persistence layer. Import this ONLY from API routes and
// instrumentation — never from anything a client component can reach.

import { getPersistence } from "./persistence";
import {
  seedFactFinds,
  type StoredFactFind,
} from "@/lib/sarah-fact-find-store";

// Encrypted write-through. A persistence failure must not lose the
// client's session (the in-memory copy already exists) but is loud in the
// logs because it means durability is degraded.
export async function persistFactFind(entry: StoredFactFind): Promise<void> {
  try {
    await getPersistence().saveFactFind(entry);
  } catch (e) {
    console.error("[fact-find-persistence] WRITE FAILED", e);
  }
}

// Called once at server boot from instrumentation.ts.
export async function hydrateFactFindStore(): Promise<void> {
  try {
    const entries = await getPersistence().loadFactFinds();
    seedFactFinds(entries);
    console.log(`[fact-find-persistence] hydrated ${entries.length} fact finds`);
  } catch (e) {
    console.error("[fact-find-persistence] hydration failed", e);
  }
}
