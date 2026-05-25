import { prices } from "@foru-workshop/mock-clients";
import type { Input, Output } from "./contract.js";

export async function fallback(input: Input): Promise<Output> {
  const candles = await prices.getOhlcv(input.pair, 60).catch(() => []);
  const first = candles[0]?.close ?? 0;
  const last = candles.at(-1)?.close ?? first;
  const pct = first ? ((last - first) / first) * 100 : 0;

  const signal: Output["signal"] =
    pct > 2 ? "SELL" : pct < -2 ? "BUY" : "HOLD";
  const sizeUsd =
    signal === "HOLD"
      ? 0
      : signal === "BUY"
        ? Math.min(input.portfolio.baseFreeUsd * 0.1, 500)
        : Math.min(input.portfolio.positionUsd * 0.5, 500);

  return {
    signal,
    sizeUsd,
    reason:
      `Template trade signal — ${signal} based on ${pct.toFixed(2)}% net move over the last ${candles.length} 1m candles. ` +
      `LLM-free fallback path. Replace with model-driven analysis when calls are available.`,
    slippageTolerancePct: 0.5,
  };
}
