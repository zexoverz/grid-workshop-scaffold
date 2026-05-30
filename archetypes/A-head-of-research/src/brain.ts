// ============================================================================
// ARCHETYPE A — HEAD OF RESEARCH
// ============================================================================
//
//   This brain is BOILERPLATE — it works out of the box. You may not need
//   to touch this file at all. Customize the agent by editing SOUL.md.
//
//   Want different behavior? Two places to look:
//     - SOUL.md ........ persona, tone, output shape (most edits go here)
//     - brain.ts (here)  orchestration: what data to fetch, how many
//                        records to pass to the LLM, retry logic
//
//   The brain's job:
//     1. Load the SOUL (persona) from SOUL.md
//     2. Fetch data from the mocks
//     3. Hand it all to the LLM
//     4. Fall back to a template if the LLM is unavailable
//
// ============================================================================

import { news, onchain, twitter } from "@foru-workshop/mock-clients";
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

  const token = input.token as "ETH" | "BTC" | "SOL";
  const [tweets, headlines, largeTx] = await Promise.all([
    twitter.getRecentTweets(token),
    news.getRecentHeadlines(token),
    onchain.getLargeTransfers(token).catch(() => []),
  ]);

  const messages = [
    { role: "system" as const, content: soul },
    {
      role: "user" as const,
      content: JSON.stringify({
        input,
        data: {
          tweets: tweets.slice(0, 12),
          headlines: headlines.slice(0, 8),
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
