// Single source of truth for the Anthropic credential.
//
// This used to be checked five different ways: the Athena route required an
// `sk-ant-` prefix and a length, while the dashboard, Settings and Nexus only
// asked whether the variable was non-empty. A key that failed the strict
// check therefore showed as "connected" everywhere Brad could see while
// Athena refused every session with a generic connection error. Every caller
// now goes through here so the platform reports one answer.

const KEY_PREFIX = "sk-ant-";
const MIN_KEY_LENGTH = 30;

export type AnthropicCredentialStatus =
  | { configured: true; key: string }
  | { configured: false; reason: "missing" | "malformed"; detail: string };

// Environment values pasted into a hosting dashboard routinely arrive with a
// trailing newline or a leading space. Trimming here is what stops that from
// presenting as an authentication failure at call time.
export function anthropicCredentialStatus(): AnthropicCredentialStatus {
  const raw = process.env.ANTHROPIC_API_KEY;
  const key = raw?.trim();

  if (!key) {
    return {
      configured: false,
      reason: "missing",
      detail: "ANTHROPIC_API_KEY is not set in this environment.",
    };
  }
  if (!key.startsWith(KEY_PREFIX) || key.length < MIN_KEY_LENGTH) {
    return {
      configured: false,
      reason: "malformed",
      detail: `ANTHROPIC_API_KEY is set but does not look like an Anthropic key (expected a ${KEY_PREFIX} prefix and at least ${MIN_KEY_LENGTH} characters).`,
    };
  }
  return { configured: true, key };
}

// Convenience for the display surfaces that only need a yes or no.
export function anthropicConfigured(): boolean {
  return anthropicCredentialStatus().configured;
}

// The trimmed key, or undefined when it is missing or malformed.
export function getAnthropicApiKey(): string | undefined {
  const status = anthropicCredentialStatus();
  return status.configured ? status.key : undefined;
}
