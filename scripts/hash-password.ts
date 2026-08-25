// Generates the ADVISER_PASSWORD_HASH value for SECURITY.md §9.
// Run: npx tsx scripts/hash-password.ts

import { createInterface } from "readline";
import { hashPassword } from "../lib/auth/credentials";

const rl = createInterface({ input: process.stdin, output: process.stdout });
rl.question("Choose the adviser password: ", (password) => {
  rl.close();
  if (password.trim().length < 10) {
    console.error("Use at least 10 characters.");
    process.exit(1);
  }
  console.log("\nADVISER_PASSWORD_HASH=" + hashPassword(password.trim()));
});
