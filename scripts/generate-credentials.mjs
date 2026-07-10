#!/usr/bin/env node
// Generates the two environment variables adviser authentication needs.
//
//   node scripts/generate-credentials.mjs "your-strong-password"
//
// Paste the output into the Vercel project's environment variables.
// The password itself is never stored anywhere.

import { randomBytes, scryptSync } from "crypto";

const password = process.argv[2];
if (!password || password.length < 12) {
  console.error("Usage: node scripts/generate-credentials.mjs <password>");
  console.error("Password must be at least 12 characters.");
  process.exit(1);
}

const salt = randomBytes(16).toString("hex");
const hash = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 }).toString("hex");

console.log(`AUTH_PASSWORD_HASH=scrypt$${salt}$${hash}`);
console.log(`AUTH_SESSION_SECRET=${randomBytes(32).toString("base64url")}`);
