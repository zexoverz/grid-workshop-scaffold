// D is mostly deterministic; the brain doesn't depend on the LLM.
// This is kept for symmetry with the other archetypes — it just emits a
// "stale_feed" alert if the brain blows up.
import type { Input, Output } from "./contract.js";

export async function fallback(input: Input): Promise<Output> {
  return {
    alerts: [
      {
        kind: "stale_feed",
        message: `Fallback path for ${input.pair} — primary data unavailable.`,
        severity: "warn",
        observedAt: new Date().toISOString(),
      },
    ],
    severity: "warn",
    evaluated: { pair: input.pair, samples: 0 },
  };
}
