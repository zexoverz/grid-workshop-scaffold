// ============================================================================
// ARCHETYPE C — CHIEF STRATEGIST
// ============================================================================
//
//   Boilerplate brain. Works out of the box. Customize via SOUL.md.
//
// ============================================================================

import { onchain, prices } from "@foru-workshop/mock-clients";
import {
  agentRuntime,
  chatJson,
  codeBuddyChatJson,
  loadSoul,
  RateLimitError,
} from "@foru-workshop/llm";
import { OutputSchema, type Input, type Output } from "./contract.js";
import { fallback } from "./fallback.js";

export async function brain(input: Input): Promise<Output> {
  const soul = await loadSoul(import.meta.url);

  const pair = input.pair as "BTCUSDT" | "ETHUSDT";
  const token = pair === "BTCUSDT" ? "BTC" : "ETH";
  const [candles, largeTx] = await Promise.all([
    prices.getOhlcv(pair, 60),
    onchain.getLargeTransfers(token).catch(() => []),
  ]);

  const messages = [
    { role: "system" as const, content: soul },
    {
      role: "user" as const,
      content: JSON.stringify({
        input,
        data: {
          candles: candles.slice(-30),
          largeTransfers: largeTx.slice(0, 5),
        },
      }),
    },
  ];

  const runtime = agentRuntime();
  try {
    if (runtime === "codebuddy") {
      return await codeBuddyChatJson(messages, OutputSchema, { maxTokens: 700 });
    }
    return await chatJson(messages, OutputSchema, { temperature: 0.3, maxTokens: 700 });
  } catch (err) {
    if (err instanceof RateLimitError) return fallback(input);
    throw err;
  }
}
