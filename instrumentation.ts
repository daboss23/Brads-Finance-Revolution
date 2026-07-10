// Runs once per server boot (Next.js instrumentation hook).
// Hydrates the fact find cache from encrypted persistence so completed
// client sessions survive restarts and redeploys.

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { hydrateFactFindStore } = await import("./lib/db/fact-find-persistence");
    await hydrateFactFindStore();
  }
}
