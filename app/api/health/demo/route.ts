import { CLIENTS } from "@/lib/data";
import { getGenerationReadiness } from "@/lib/soa/soa-generator";
import { getBackend } from "@/lib/secure-store/backend";
import { encryptJson, decryptJson, EncryptionKeyMissingError } from "@/lib/secure-store/crypto";
import { anthropicCredentialStatus } from "@/lib/ai/anthropic-credentials";
import { probeConvAi } from "@/lib/athena/convai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Pre-flight for a live client demo.
//
// Every question that decides whether the demo survives contact with an
// audience is answered here in one request, minutes before the meeting
// rather than during it:
//
//   - Can the platform actually write? A configured DATABASE_URL proves
//     nothing on its own; db/schema.sql still has to have been run against
//     it. So this does a real encrypted round trip instead of reading env
//     vars, which is the only way to tell the two apart from outside.
//   - Which discovery session will a client get, voice or text?
//   - Is the platform open to anyone with the URL?
//   - Which client names can Brad click and reach a finished SOA?
//
// Adviser-only: /api/health/ is not a public prefix in middleware.ts.

const PROBE_NAMESPACE = "health-probe";

interface StorageReport {
  backend: string;
  writable: boolean;
  detail: string;
  remedy?: string;
}

// A round trip, not a connection test: write an encrypted record, read it
// back, prove it decrypts to what went in, then remove it. Anything short of
// that can pass while the demo still fails on the first real save.
async function checkStorage(): Promise<StorageReport> {
  const backend = getBackend();
  const key = `preflight-${Date.now()}`;
  const canary = { probe: true, at: new Date().toISOString() };

  try {
    const ciphertext = encryptJson(canary);
    await backend.put({
      namespace: PROBE_NAMESPACE,
      key,
      ciphertext,
      updatedAt: new Date().toISOString(),
    });
    const back = await backend.get(PROBE_NAMESPACE, key);
    if (!back) {
      return {
        backend: backend.name,
        writable: false,
        detail: "The record was written but could not be read back.",
      };
    }
    const decoded = decryptJson<typeof canary>(back.ciphertext);
    if (decoded.at !== canary.at) {
      return {
        backend: backend.name,
        writable: false,
        detail: "The record read back did not match what was written.",
      };
    }
    return {
      backend: backend.name,
      writable: true,
      detail:
        backend.name === "postgres"
          ? "Postgres is reachable, the schema is in place, and records encrypt and decrypt correctly."
          : "Encrypted local files are writable. Records reset on redeploy, which is fine for a demo.",
    };
  } catch (err) {
    if (err instanceof EncryptionKeyMissingError) {
      return {
        backend: backend.name,
        writable: false,
        detail: "DATA_ENCRYPTION_KEY is not set, so nothing can be saved.",
        remedy:
          'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))" and set it in Vercel.',
      };
    }
    const message = err instanceof Error ? err.message : String(err);

    // The single most likely production failure, and the one that looks like
    // a broken app rather than a missing setup step: DATABASE_URL is set, so
    // every write goes to Postgres, but the tables were never created.
    if (/relation .*(secure_records|secure_events).* does not exist/i.test(message)) {
      return {
        backend: backend.name,
        writable: false,
        detail:
          "Postgres is connected but the tables do not exist, so every save will fail.",
        remedy: 'Run the schema once: psql "$DATABASE_URL" -f db/schema.sql',
      };
    }
    return { backend: backend.name, writable: false, detail: message };
  } finally {
    // Never leave probe rows behind, including when the read or compare threw.
    try {
      await backend.delete(PROBE_NAMESPACE, key);
    } catch {
      // A probe row that outlives the check is harmless; it is encrypted and
      // in its own namespace, and nothing reads it.
    }
  }
}

export async function GET() {
  const [storage, convAi] = await Promise.all([checkStorage(), probeConvAi()]);
  const anthropic = anthropicCredentialStatus();

  const discovery = convAi.ok
    ? {
        mode: "voice" as const,
        detail: `Clients get the live ElevenLabs session with "${convAi.agentName}". It runs its own model, so it works even on an empty Anthropic balance.`,
      }
    : anthropic.configured
      ? {
          mode: "text" as const,
          detail: `The live voice agent is unreachable (${convAi.detail}), so clients fall back to the Anthropic text session. Every turn bills the Anthropic balance.`,
        }
      : {
          mode: "unavailable" as const,
          detail: `Neither session can run. Voice: ${convAi.detail} Text: ${anthropic.detail}`,
        };

  const signInEnforced = Boolean(
    process.env.ADVISER_PASSWORD_HASH?.trim() && process.env.AUTH_SESSION_SECRET?.trim(),
  );

  // Which names Brad can safely click in front of an audience. A client
  // blocked on purpose still belongs in the demo, so blockers are reported
  // rather than hidden — a gate that visibly refuses is the point of the
  // compliance layer.
  const walkthrough = CLIENTS.map((client) => {
    const readiness = getGenerationReadiness(client.id);
    return {
      clientId: client.id,
      name: client.name,
      ready: readiness.ready,
      complianceScore: readiness.complianceScore,
      factFindCompletion: readiness.factFindCompletion,
      strategies: readiness.strategies,
      blockers: readiness.blockers,
    };
  });

  const demoReady = walkthrough.filter((c) => c.ready);

  const notes: string[] = [];
  if (!storage.writable) {
    notes.push(
      "Nothing a client does will save. Fix storage before running a live discovery session.",
    );
  }
  if (discovery.mode === "unavailable") {
    notes.push("Athena cannot hold a conversation. The rest of the walkthrough still works.");
  }
  if (!signInEnforced) {
    notes.push(
      "The platform is open: anyone with the URL sees every client record. Fine for a demo you drive, not for a link you send out.",
    );
  }
  if (demoReady.length === 0) {
    notes.push("No client can currently reach a finished SOA.");
  }

  const ok = storage.writable && discovery.mode !== "unavailable" && demoReady.length > 0;

  return Response.json({
    ok,
    checkedAt: new Date().toISOString(),
    storage,
    discovery,
    signIn: {
      enforced: signInEnforced,
      detail: signInEnforced
        ? "Adviser pages require sign in."
        : "ADVISER_PASSWORD_HASH and AUTH_SESSION_SECRET are not both set, so the platform runs open.",
    },
    walkthrough,
    readyClientCount: demoReady.length,
    notes,
  });
}
