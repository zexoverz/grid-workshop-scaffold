// ============================================================================
// ARCHETYPE E — HEAD TRADER
// ============================================================================
//
//   Your job: emit a single trade decision — BUY, HOLD, or SELL — with a
//   suggested dollar size and slippage tolerance.
//
//   Input:   { pair, portfolio: { baseFreeUsd, positionUsd } }
//   Output:  { signal: "BUY"|"HOLD"|"SELL", sizeUsd, reason, slippageTolerancePct }
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
            "You are the Head Trader at a one-person trading firm. Be decisive. " +
            "Output a single signal with sizing. JSON only.",
        },
        {
          role: "user",
          content: JSON.stringify({
            pair: input.pair,
            portfolio: input.portfolio,
            candles: candles.slice(-30),
            largeTransfers: largeTx.slice(0, 5),
            rules: {
              sizeUsd: "≤ portfolio.baseFreeUsd; 0 if HOLD",
              slippageTolerancePct: "0..5",
            },
          }),
        },
      ],
      OutputSchema,
      { temperature: 0.2, maxTokens: 500 },
    );
  } catch (err) {
    if (err instanceof RateLimitError) return fallback(input);
    throw err;
  }

  // ─── ✂ ─── YOUR CODE ENDS HERE ─── ✂ ───────────────────────────────────────
}
