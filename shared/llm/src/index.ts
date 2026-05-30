import { z } from "zod";

export { loadSoul } from "./soul.js";
export { codeBuddyChat, codeBuddyChatJson, codeBuddyCallsRemaining } from "./codebuddy.js";

export type AgentRuntime = "openai" | "codebuddy";

export function agentRuntime(): AgentRuntime {
  const v = (process.env.AGENT_RUNTIME ?? "openai").toLowerCase();
  return v === "codebuddy" ? "codebuddy" : "openai";
}

const DEFAULT_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_MODEL = "gpt-4o-mini";
const DAILY_CAP = 30;

const ChatResponseSchema = z.object({
  choices: z
    .array(
      z.object({
        message: z.object({
          role: z.literal("assistant"),
          content: z.string().nullable(),
        }),
      }),
    )
    .min(1),
});

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "text" | "json_object";
}

export class RateLimitError extends Error {
  constructor(public readonly cap: number) {
    super(`LLM call cap reached for this session (${cap}). Fall back to template path.`);
    this.name = "RateLimitError";
  }
}

let callsUsed = 0;

export function callsRemaining(): number {
  return Math.max(0, DAILY_CAP - callsUsed);
}

export async function chat(
  messages: ChatMessage[],
  opts: ChatOptions = {},
): Promise<string> {
  if (callsUsed >= DAILY_CAP) throw new RateLimitError(DAILY_CAP);

  const baseUrl = process.env.LLM_BASE_URL ?? DEFAULT_BASE_URL;
  const apiKey = process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL ?? DEFAULT_MODEL;

  if (!apiKey) {
    throw new Error(
      "LLM_API_KEY not set. Copy .env.example to .env and fill in the key issued to your team.",
    );
  }

  callsUsed += 1;

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: opts.temperature ?? 0.4,
    max_tokens: opts.maxTokens ?? 600,
  };
  if (opts.responseFormat === "json_object") {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (res.status === 429) throw new RateLimitError(DAILY_CAP);
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`LLM ${res.status}: ${detail.slice(0, 200)}`);
  }

  const parsed = ChatResponseSchema.parse(await res.json());
  const content = parsed.choices[0]?.message.content;
  if (!content) throw new Error("LLM returned empty content");
  return content;
}

export async function chatJson<T>(
  messages: ChatMessage[],
  schema: z.ZodType<T>,
  opts: Omit<ChatOptions, "responseFormat"> = {},
): Promise<T> {
  const raw = await chat(messages, { ...opts, responseFormat: "json_object" });
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(`LLM did not return JSON: ${raw.slice(0, 200)}`);
  }
  return schema.parse(data);
}
