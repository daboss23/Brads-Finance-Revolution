// Public API of the encrypted persistence layer.
//
// Everything written through here is AES-256-GCM encrypted before it
// reaches the backend (Postgres when DATABASE_URL is set, encrypted local
// files otherwise). See SECURITY.md for the full model.

import { encryptJson, decryptJson, encryptionAvailable, EncryptionKeyMissingError } from "./crypto";
import { getBackend, type SecureRecord } from "./backend";

export { encryptionAvailable, EncryptionKeyMissingError };

export async function secureSet(namespace: string, key: string, value: unknown): Promise<void> {
  await getBackend().put({
    namespace,
    key,
    ciphertext: encryptJson(value),
    updatedAt: new Date().toISOString(),
  });
}

export async function secureGet<T>(namespace: string, key: string): Promise<T | undefined> {
  const record = await getBackend().get(namespace, key);
  return record ? safeDecrypt<T>(record) : undefined;
}

export async function secureList<T>(namespace: string): Promise<{ key: string; value: T }[]> {
  const records = await getBackend().list(namespace);
  const out: { key: string; value: T }[] = [];
  for (const r of records) {
    const value = safeDecrypt<T>(r);
    if (value !== undefined) out.push({ key: r.key, value });
  }
  return out;
}

// Append-only event log (audit trails, security events).
export async function secureAppend(namespace: string, event: unknown): Promise<void> {
  await getBackend().append(namespace, encryptJson(event));
}

export async function secureEvents<T>(namespace: string, limit = 500): Promise<T[]> {
  const records = await getBackend().listAppended(namespace, limit);
  return records
    .map((r) => safeDecrypt<T>(r))
    .filter((v): v is T => v !== undefined);
}

function safeDecrypt<T>(record: SecureRecord): T | undefined {
  try {
    return decryptJson<T>(record.ciphertext);
  } catch (e) {
    // A tampered or wrong-key record fails GCM authentication. Surface it
    // loudly in logs but never crash reads of the healthy records around it.
    console.error(
      `[secure-store] failed to decrypt ${record.namespace}/${record.key}:`,
      e instanceof Error ? e.message : e,
    );
    return undefined;
  }
}
