// ============================================================================
// ARCHETYPE C — CHIEF STRATEGIST
// ============================================================================
//
//   Your job: synthesize recent price action + on-chain flow into a
//   recommendation (accumulate / hold / reduce / exit), with risks.
//
//   Input:   { pair, horizon, riskTolerance }
//   Output:  { recommendation, rationale, risks[], horizon }
//   Mocks:   prices, onchain
//
// ============================================================================

import { onchain, prices } from "@foru-workshop/mock-clients";
import { chatJson, RateLimitError } from "@foru-workshop/llm";
import { OutputSchema, type Input, type Output } from "./contract.js";
import { fallback } from "./fallback.js";

export async function brain(input: Input): Promise<Output> {
  // ─── ✂ ─── YOUR CODE STARTS HERE ─── ✂ ─────────────────────────────────────

  const token = input.pair === "BTCUSDT" ? "BTC" : "ETH";
  const [candles, largeTx] = await Promise.all([
    prices.getOhlcv(input.pair, 60),
    onchain.getLargeTransfers(token).catch(() => []),
  ]);

  try {
    return await chatJson(
      [
        {
          role: "system",
          content:
            "You are the Chief Strategist at a one-person trading firm. " +
            "Make a clear recommendation, list concrete risks. JSON only.",
        },
        {
          role: "user",
          content: JSON.stringify({
            pair: input.pair,
            horizon: input.horizon,
            riskTolerance: input.riskTolerance,
            candles: candles.slice(-30),
            largeTransfers: largeTx.slice(0, 5),
            outputHint: {
              recommendation: "accumulate | hold | reduce | exit",
              rationale: "40-800 chars, reference the data",
              risks: "1-5 short bullets",
              horizon: input.horizon,
            },
          }),
        },
      ],
      OutputSchema,
      { temperature: 0.3, maxTokens: 700 },
    );
  } catch (err) {
    if (err instanceof RateLimitError) return fallback(input);
    throw err;
  }

  // ─── ✂ ─── YOUR CODE ENDS HERE ─── ✂ ───────────────────────────────────────
}
