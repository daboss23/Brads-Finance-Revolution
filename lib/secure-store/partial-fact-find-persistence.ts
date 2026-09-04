// Answers read out of a conversation the client never finished.
//
// Server-only, AES-256-GCM like every other record here, and deliberately its
// own namespace rather than a flag on a fact find.
//
// The separation is the safety property, not a filing preference. `fact-finds`
// holds what a client confirmed by completing their session, and the compliance
// checker, the SOA generator, the recommender and the forms pre-fill all read
// it directly. If an extracted answer lived there, a number a model inferred
// from a half sentence could reach a Statement of Advice without any person
// having looked at it. Nothing downstream reads this namespace, so an extracted
// answer can only ever reach an SOA the way it should: on the review screen,
// through Brad, as an edit he made.

import { secureSet, secureGet, secureDelete } from "./index";
import type { AthenaFactFind } from "../athena-fact-find-schema";

const NAMESPACE = "partial-fact-finds";

export interface StoredPartialFactFind {
  clientId: string;
  /** The discovery session these answers were read out of. */
  threadId: string;
  extractedAt: string;
  /**
   * Turns the extraction saw. A session that has grown since then has answers
   * this record does not, which is what makes the review screen able to say so
   * instead of quietly showing stale data.
   */
  turnCount: number;
  /** How many of the fifty fields the client actually answered. */
  fieldCount: number;
  model: string;
  data: AthenaFactFind;
}

export async function persistPartialFactFind(
  entry: StoredPartialFactFind,
): Promise<void> {
  await secureSet(NAMESPACE, entry.clientId, entry);
}

export async function getPartialFactFind(
  clientId: string,
): Promise<StoredPartialFactFind | undefined> {
  return secureGet<StoredPartialFactFind>(NAMESPACE, clientId);
}

// Dropped once the client comes back and finishes properly: their confirmed
// fact find is the better record in every way, and leaving an extraction
// beside it would put two answers on the screen for the same question.
export async function clearPartialFactFind(clientId: string): Promise<void> {
  await secureDelete(NAMESPACE, clientId);
}
