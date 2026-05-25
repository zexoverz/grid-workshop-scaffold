import { prices } from "@foru-workshop/mock-clients";
import type { Input, Output } from "./contract.js";

export async function fallback(input: Input): Promise<Output> {
  const candles = await prices.getOhlcv(input.pair, 60).catch(() => []);
  const first = candles[0]?.close ?? 0;
  const last = candles.at(-1)?.close ?? first;
  const pctChange = first ? ((last - first) / first) * 100 : 0;

  const recommendation: Output["recommendation"] =
    pctChange > 5
      ? "reduce"
      : pctChange > 1
        ? "hold"
        : pctChange < -5
          ? "accumulate"
          : "hold";

  return {
    recommendation,
    rationale:
      `Template strategy view for ${input.pair} over the last ${candles.length} 1m candles. ` +
      `Net change ${pctChange.toFixed(2)}%. LLM-free fallback — replace when calls are available.`,
    risks: [
      "Template path: no qualitative signal review",
      "Short 60-minute lookback may miss the broader trend",
      "On-chain flow not factored",
    ],
    horizon: input.horizon,
  };
}
