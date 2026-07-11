// Browser-side sync between localStorage UI caches and the encrypted
// server state at /api/state. localStorage keeps reads instant; the
// server copy is the durable record that survives browser resets and
// follows the adviser across machines.

const pending = new Map<string, ReturnType<typeof setTimeout>>();

// Debounced fire-and-forget mirror of a whole store blob to the server.
export function mirrorToServer(namespace: string, key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  const id = `${namespace}/${key}`;
  const existing = pending.get(id);
  if (existing) clearTimeout(existing);
  pending.set(
    id,
    setTimeout(() => {
      pending.delete(id);
      void fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ namespace, key, value }),
      }).catch(() => {
        // Offline — the localStorage copy still exists; next write retries.
      });
    }, 400),
  );
}

// One-time pull: seed localStorage from the server when the local cache
// is empty (fresh browser, cleared storage, new machine).
export async function pullFromServer<T>(
  namespace: string,
  key: string,
): Promise<T | undefined> {
  if (typeof window === "undefined") return undefined;
  try {
    const res = await fetch(`/api/state?namespace=${encodeURIComponent(namespace)}`);
    if (!res.ok) return undefined;
    const { state } = (await res.json()) as { state: Record<string, unknown> };
    return state[key] as T | undefined;
  } catch {
    return undefined;
  }
}
