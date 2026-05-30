// ============================================================================
// ARCHETYPE B — CUSTOMER SUCCESS LEAD
// ============================================================================
//
//   Boilerplate brain. Works out of the box. Customize via SOUL.md.
//   This archetype does NOT use market mocks — its data source is the
//   static FAQ in src/faq.ts plus the LLM.
//
// ============================================================================

import {
  agentRuntime,
  chatJson,
  codeBuddyChatJson,
  loadSoul,
  RateLimitError,
} from "@foru-workshop/llm";
import { OutputSchema, type Input, type Output } from "./contract.js";
import { FAQ } from "./faq.js";
import { fallback } from "./fallback.js";

export async function brain(input: Input): Promise<Output> {
  const soul = await loadSoul(import.meta.url);
  const messages = [
    { role: "system" as const, content: soul },
    {
      role: "user" as const,
      content: JSON.stringify({ input, knownFaq: FAQ }),
    },
  ];

  const runtime = agentRuntime();
  try {
    if (runtime === "codebuddy") {
      return await codeBuddyChatJson(messages, OutputSchema, { maxTokens: 500 });
    }
    return await chatJson(messages, OutputSchema, { temperature: 0.5, maxTokens: 500 });
  } catch (err) {
    if (err instanceof RateLimitError) return fallback(input);
    throw err;
  }
}
