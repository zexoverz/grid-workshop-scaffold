// No-LLM template path. Used when LLM_API_KEY is missing or the 30-call
// rate-limit cap is hit (per Appendix G — Contingency).
//
// Counts as a valid MVS as long as the output matches the contract schema.

import { news, twitter } from "@foru-workshop/mock-clients";
import type { Input, Output } from "./contract.js";

export async function fallback(input: Input): Promise<Output> {
  const [tweets, headlines] = await Promise.all([
    twitter.getRecentTweets(input.token).catch(() => []),
    news.getRecentHeadlines(input.token).catch(() => []),
  ]);

  const buzz = tweets.reduce((acc, t) => acc + t.likes + t.retweets, 0);
  const sentiment: Output["sentiment"] =
    buzz > 50_000 ? "bullish" : buzz < 5_000 ? "bearish" : "neutral";

  const summary =
    `Template research brief for ${input.token} over the last ${input.windowHours}h. ` +
    `Observed ${tweets.length} tweets (cumulative engagement ${buzz.toLocaleString()}) and ` +
    `${headlines.length} headlines. Tone leans ${sentiment} based on engagement only. ` +
    `LLM-free fallback path — replace with model-driven analysis when calls are available.`;

  const sources = headlines.slice(0, 5).map((h) => h.url);
  if (sources.length === 0) sources.push("https://mock-news.foruai.io/about");

  return {
    summary,
    sentiment,
    confidence: 0.3,
    sources,
  };
}
