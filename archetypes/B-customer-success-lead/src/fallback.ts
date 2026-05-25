import { FAQ } from "./faq.js";
import type { Input, Output } from "./contract.js";

export async function fallback(input: Input): Promise<Output> {
  const msg = input.userMessage.toLowerCase();
  const match =
    FAQ.find((f) => msg.includes(f.intent)) ??
    FAQ.find((f) => msg.split(/\s+/).some((w) => f.question.toLowerCase().includes(w))) ??
    FAQ[0]!;

  return {
    reply: match.answer,
    intent: match.intent,
    followUps: FAQ.filter((f) => f.intent !== match.intent)
      .slice(0, 3)
      .map((f) => f.question),
  };
}
