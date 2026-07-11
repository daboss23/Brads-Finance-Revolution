// Field-level encryption for client PII.
//
// Every record is encrypted by the application with AES-256-GCM before it
// touches any storage backend, so a stolen database or disk yields only
// ciphertext. GCM authenticates as well as encrypts: a tampered record
// fails decryption loudly instead of silently returning corrupted data.
//
// Envelope format: "enc1." + base64url(iv[12] || authTag[16] || ciphertext)
// The version prefix lets us rotate algorithms later without a migration
// flag day.
//
// Key management:
//   DATA_ENCRYPTION_KEY — 32 bytes, base64 or hex. Generate with:
//     node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
//
// Fails closed: in production, writes of client data are refused outright
// when no key is configured. Plaintext PII at rest is never a possible
// state. In development a deterministic dev-only key is derived so the
// sandbox works with zero setup.

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const ENVELOPE_PREFIX = "enc1.";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

export class EncryptionKeyMissingError extends Error {
  constructor() {
    super(
      "DATA_ENCRYPTION_KEY is not set. Refusing to write client data unencrypted. " +
        "See SECURITY.md §7 for key generation.",
    );
    this.name = "EncryptionKeyMissingError";
  }
}

function parseKey(raw: string): Buffer {
  const trimmed = raw.trim();
  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) return Buffer.from(trimmed, "hex");
  const b64 = Buffer.from(trimmed, "base64");
  if (b64.length === 32) return b64;
  throw new Error("DATA_ENCRYPTION_KEY must be 32 bytes, base64 or hex encoded.");
}

let cachedKey: Buffer | null | undefined;

function getKey(): Buffer | null {
  if (cachedKey !== undefined) return cachedKey;
  const raw = process.env.DATA_ENCRYPTION_KEY;
  if (raw) {
    cachedKey = parseKey(raw);
  } else if (process.env.NODE_ENV === "production") {
    cachedKey = null; // fail closed — callers throw EncryptionKeyMissingError
  } else {
    // Dev-only fallback so the sandbox runs with zero infrastructure.
    // Deterministic per machine, never used in production.
    cachedKey = createHash("sha256")
      .update("bmk-dev-only-key:" + (process.env.HOME ?? "sandbox"))
      .digest();
    console.warn(
      "[secure-store] DATA_ENCRYPTION_KEY not set — using dev-only derived key. " +
        "Set a real key before storing real client data.",
    );
  }
  return cachedKey;
}

export function encryptionAvailable(): boolean {
  return getKey() !== null;
}

export function encryptString(plaintext: string): string {
  const key = getKey();
  if (!key) throw new EncryptionKeyMissingError();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ENVELOPE_PREFIX + Buffer.concat([iv, tag, ciphertext]).toString("base64url");
}

export function decryptString(envelope: string): string {
  const key = getKey();
  if (!key) throw new EncryptionKeyMissingError();
  if (!envelope.startsWith(ENVELOPE_PREFIX)) {
    throw new Error("Unrecognised ciphertext envelope — expected enc1 format.");
  }
  const blob = Buffer.from(envelope.slice(ENVELOPE_PREFIX.length), "base64url");
  const iv = blob.subarray(0, IV_LENGTH);
  const tag = blob.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const ciphertext = blob.subarray(IV_LENGTH + TAG_LENGTH);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}

export function encryptJson(value: unknown): string {
  return encryptString(JSON.stringify(value));
}

export function decryptJson<T>(envelope: string): T {
  return JSON.parse(decryptString(envelope)) as T;
}
