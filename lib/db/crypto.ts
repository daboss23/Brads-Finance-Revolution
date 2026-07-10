// Field-level encryption for client PII. Node runtime only.
//
// Everything the platform persists about a client is encrypted with
// AES-256-GCM before it touches any storage backend, so a stolen database
// dump or file yields ciphertext. GCM authenticates as well as encrypts:
// a single flipped bit makes decryption fail loudly instead of returning
// corrupted data.
//
// Key management:
//   DATA_ENCRYPTION_KEY  base64, 32 bytes. Generate with:
//                        node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
//
// Production REQUIRES the key (fail closed — PII is never written in
// plaintext). Sandbox generates a local key on first use, stored in
// .data/dev.key (gitignored), so development just works.

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

const ALGO = "aes-256-gcm";
const PREFIX = "enc1";

let cachedKey: Buffer | null = null;

function isProduction(): boolean {
  return process.env.NEXT_PUBLIC_APP_ENV === "production";
}

function devKeyPath(): string {
  return path.join(process.cwd(), ".data", "dev.key");
}

export function getDataKey(): Buffer {
  if (cachedKey) return cachedKey;

  const fromEnv = process.env.DATA_ENCRYPTION_KEY;
  if (fromEnv) {
    const key = Buffer.from(fromEnv, "base64");
    if (key.length !== 32) {
      throw new Error("DATA_ENCRYPTION_KEY must be 32 bytes of base64.");
    }
    cachedKey = key;
    return key;
  }

  if (isProduction()) {
    throw new Error(
      "DATA_ENCRYPTION_KEY is required in production. Client data is never stored unencrypted.",
    );
  }

  // Sandbox: persistent local dev key so restarts can still read .data files.
  const p = devKeyPath();
  if (existsSync(p)) {
    cachedKey = Buffer.from(readFileSync(p, "utf8").trim(), "base64");
    return cachedKey;
  }
  const key = randomBytes(32);
  mkdirSync(path.dirname(p), { recursive: true });
  writeFileSync(p, key.toString("base64"), { mode: 0o600 });
  cachedKey = key;
  return key;
}

export function encryptJson(value: unknown): string {
  const key = getDataKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key, iv);
  const plaintext = Buffer.from(JSON.stringify(value), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    PREFIX,
    iv.toString("base64"),
    tag.toString("base64"),
    ciphertext.toString("base64"),
  ].join(".");
}

export function decryptJson<T>(payload: string): T {
  const parts = payload.split(".");
  if (parts.length !== 4 || parts[0] !== PREFIX) {
    throw new Error("Unrecognised ciphertext format.");
  }
  const [, ivB64, tagB64, dataB64] = parts;
  const decipher = createDecipheriv(ALGO, getDataKey(), Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]);
  return JSON.parse(plaintext.toString("utf8")) as T;
}
