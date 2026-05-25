// ============================================================================
// ARCHETYPE A — HEAD OF RESEARCH
// ============================================================================
//
//   Your job: turn last-24h tweets + news + on-chain signals about a token
//   into a structured Research brief.
//
//   Input shape  (locked):
//     { token: "ETH" | "BTC" | "SOL", windowHours: number }
//
//   Output shape (locked — this is the MVS contract):
//     {
//       summary: string,                 // 40-800 chars
//       sentiment: "bullish" | "bearish" | "neutral",
//       confidence: number,              // 0..1
//       sources: string[]                // 1-10 URLs you cited
//     }
//
//   Tools available to you (already imported, just use them):
//     - twitter.getRecentTweets(token)
//     - news.getRecentHeadlines(token)
//     - onchain.getLargeTransfers(token)
//     - llm.chatJson(messages, schema)   ← rate-limited, 30 calls per key
//     - fallback(input)                  ← no-LLM template path
//
//   Vibecode prompt to paste into CodeBuddy / Claude / Codex / Cursor:
//
//     "Write the brain for the Head of Research agent using the archetype A
//      scaffold. Pull from mock-twitter and mock-news. Return summary,
//      sentiment, confidence, sources. Match the OutputSchema."
//
// ============================================================================

import { news, onchain, twitter } from "@foru-workshop/mock-clients";
import { chatJson, RateLimitError } from "@foru-workshop/llm";
import { OutputSchema, type Input, type Output } from "./contract.js";
import { fallback } from "./fallback.js";

export async function brain(input: Input): Promise<Output> {
  // ─── ✂ ─── YOUR CODE STARTS HERE ─── ✂ ─────────────────────────────────────
  //
  //  Example skeleton — keep, modify, or replace entirely.
  //  Aim for ~20-60 lines.

  const [tweets, headlines, largeTx] = await Promise.all([
    twitter.getRecentTweets(input.token),
    news.getRecentHeadlines(input.token),
    onchain.getLargeTransfers(input.token).catch(() => []),
  ]);

  try {
    const result = await chatJson(
      [
        {
          role: "system",
          content:
            "You are the Head of Research at a one-person Web3 trading firm. " +
            "Produce concise, source-grounded research. Output JSON only.",
        },
        {
          role: "user",
          content: JSON.stringify({
            token: input.token,
            windowHours: input.windowHours,
            tweets: tweets.slice(0, 12),
            headlines: headlines.slice(0, 8),
            largeTransfers: largeTx.slice(0, 5),
            schemaHint: {
              summary: "40-800 chars, factual, neutral tone",
              sentiment: "bullish | bearish | neutral",
              confidence: "0..1 based on signal strength + agreement",
              sources: "1-10 URLs you cite (headline URLs are fine)",
            },
          }),
        },
      ],
      OutputSchema,
      { temperature: 0.3, maxTokens: 700 },
    );
    return result;
  } catch (err) {
    if (err instanceof RateLimitError) return fallback(input);
    throw err;
  }

  // ─── ✂ ─── YOUR CODE ENDS HERE ─── ✂ ───────────────────────────────────────
}
