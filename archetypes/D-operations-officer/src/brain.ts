// ============================================================================
// ARCHETYPE D — OPERATIONS OFFICER
// ============================================================================
//
//   Your job: scan recent prices, raise alerts when thresholds breach.
//   Mostly deterministic — LLM is optional, for narrative messages only.
//
//   Input:   { pair, thresholds: { pricePctChange, volumeMultiplier } }
//   Output:  { alerts[], severity, evaluated: { pair, samples } }
//   Mocks:   prices
//
// ============================================================================

import { prices } from "@foru-workshop/mock-clients";
import { OutputSchema, type Input, type Output } from "./contract.js";

export async function brain(input: Input): Promise<Output> {
  // ─── ✂ ─── YOUR CODE STARTS HERE ─── ✂ ─────────────────────────────────────

  const candles = await prices.getOhlcv(input.pair, 60);
  const alerts: Output["alerts"] = [];

  if (candles.length === 0) {
    alerts.push({
      kind: "stale_feed",
      message: `No candles returned for ${input.pair}`,
      severity: "warn",
      observedAt: new Date().toISOString(),
    });
  }

  const first = candles[0];
  const last = candles.at(-1);
  if (first && last) {
    const pct = ((last.close - first.close) / first.close) * 100;
    if (Math.abs(pct) >= input.thresholds.pricePctChange) {
      alerts.push({
        kind: pct > 0 ? "price_spike" : "drawdown",
        message: `${input.pair} ${pct >= 0 ? "+" : ""}${pct.toFixed(2)}% over ${candles.length} candles`,
        severity: Math.abs(pct) >= input.thresholds.pricePctChange * 2 ? "critical" : "warn",
        observedAt: last.openTime ? new Date(last.openTime).toISOString() : new Date().toISOString(),
      });
    }

    const avgVol = candles.reduce((a, c) => a + c.volume, 0) / candles.length;
    if (last.volume >= avgVol * input.thresholds.volumeMultiplier) {
      alerts.push({
        kind: "volume_spike",
        message: `${input.pair} volume ${(last.volume / avgVol).toFixed(1)}× average`,
        severity: "warn",
        observedAt: new Date().toISOString(),
      });
    }
  }

  const severity: Output["severity"] = alerts.some((a) => a.severity === "critical")
    ? "critical"
    : alerts.some((a) => a.severity === "warn")
      ? "warn"
      : "info";

  return OutputSchema.parse({
    alerts,
    severity,
    evaluated: { pair: input.pair, samples: candles.length },
  });

  // ─── ✂ ─── YOUR CODE ENDS HERE ─── ✂ ───────────────────────────────────────
}
