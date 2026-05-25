// ============================================================================
// ARCHETYPE B — CUSTOMER SUCCESS LEAD
// ============================================================================
//
//   Your job: answer a trader's question. Be friendly, accurate, brief.
//   Detect intent. Suggest follow-ups.
//
//   Input:   { userMessage, userId?, language: "en" | "id" }
//   Output:  { reply, intent, followUps[] }
//
//   No market mocks for this archetype — your "data source" is the FAQ
//   stub + the LLM.
//
//   Tools:   - llm.chatJson(messages, schema)
//            - FAQ (static array in ./faq.ts)
//            - fallback(input)
//
// ============================================================================

import { chatJson, RateLimitError } from "@foru-workshop/llm";
import { OutputSchema, type Input, type Output } from "./contract.js";
import { FAQ } from "./faq.js";
import { fallback } from "./fallback.js";

export async function brain(input: Input): Promise<Output> {
  // ─── ✂ ─── YOUR CODE STARTS HERE ─── ✂ ─────────────────────────────────────

  try {
    return await chatJson(
      [
        {
          role: "system",
          content:
            `You are the Customer Success Lead at a one-person Web3 trading firm. ` +
            `Reply in ${input.language === "id" ? "Bahasa Indonesia" : "English"}. ` +
            `Be warm, factual, and concise. Output JSON only.`,
        },
        {
          role: "user",
          content: JSON.stringify({
            userMessage: input.userMessage,
            knownFaq: FAQ,
            outputHint: {
              reply: "1-1200 chars, address the user directly",
              intent: "onboarding | education | troubleshooting | fees | kyc | other",
              followUps: "up to 5 short suggested next questions",
            },
          }),
        },
      ],
      OutputSchema,
      { temperature: 0.5, maxTokens: 500 },
    );
  } catch (err) {
    if (err instanceof RateLimitError) return fallback(input);
    throw err;
  }

  // ─── ✂ ─── YOUR CODE ENDS HERE ─── ✂ ───────────────────────────────────────
}
