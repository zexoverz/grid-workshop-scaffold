// CodeBuddy SDK runtime path. Used when AGENT_RUNTIME=codebuddy.
// Mirrors the chat()/chatJson() shape in ./index.ts so brain.ts can swap.

import { z } from "zod";
import { query } from "@tencent-ai/agent-sdk";
import type { ChatMessage, ChatOptions } from "./index.js";
import { RateLimitError } from "./index.js";

const DEFAULT_MODEL = "default-model";
const DAILY_CAP = 30;
const JSON_TAIL =
  "\n\nRespond with valid JSON only. No prose, no markdown fences, no leading or trailing text.";

let callsUsed = 0;

export function codeBuddyCallsRemaining(): number {
  return Math.max(0, DAILY_CAP - callsUsed);
}

function flatten(messages: ChatMessage[]): string {
  return messages
    .map((m) => {
      if (m.role === "system") return `# SYSTEM\n${m.content}`;
      if (m.role === "user") return `# USER\n${m.content}`;
      return `# ASSISTANT\n${m.content}`;
    })
    .join("\n\n");
}

async function collectText(prompt: string, model: string): Promise<string> {
  const apiKey = process.env.CODEBUDDY_API_KEY;
  if (!apiKey) {
    throw new Error(
      "CODEBUDDY_API_KEY not set. Required when AGENT_RUNTIME=codebuddy.",
    );
  }

  const stream = query({
    prompt,
    options: {
      model,
      maxTurns: 3,
      permissionMode: "bypassPermissions",
      settingSources: [],
      allowedTools: [],
      env: {
        CODEBUDDY_API_KEY: apiKey,
        ...(process.env.CODEBUDDY_INTERNET_ENVIRONMENT
          ? { CODEBUDDY_INTERNET_ENVIRONMENT: process.env.CODEBUDDY_INTERNET_ENVIRONMENT }
          : {}),
      },
    },
  });

  let buf = "";
  let errored: Error | null = null;

  for await (const msg of stream) {
    if (msg.type === "assistant") {
      for (const block of msg.message.content) {
        if (block.type === "text") buf += block.text;
      }
    } else if (msg.type === "result" && msg.subtype !== "success") {
      errored = new Error(`CodeBuddy run failed: ${msg.subtype}`);
    }
  }

  if (errored) throw errored;
  if (!buf.trim()) throw new Error("CodeBuddy returned empty text");
  return buf;
}

export async function codeBuddyChat(
  messages: ChatMessage[],
  opts: ChatOptions = {},
): Promise<string> {
  if (callsUsed >= DAILY_CAP) throw new RateLimitError(DAILY_CAP);
  callsUsed += 1;

  const model = process.env.CODEBUDDY_MODEL ?? DEFAULT_MODEL;
  const prompt =
    opts.responseFormat === "json_object"
      ? `${flatten(messages)}${JSON_TAIL}`
      : flatten(messages);

  return collectText(prompt, model);
}

export async function codeBuddyChatJson<T>(
  messages: ChatMessage[],
  schema: z.ZodType<T>,
  opts: Omit<ChatOptions, "responseFormat"> = {},
): Promise<T> {
  const raw = await codeBuddyChat(messages, { ...opts, responseFormat: "json_object" });
  const stripped = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/, "");
  let data: unknown;
  try {
    data = JSON.parse(stripped);
  } catch {
    throw new Error(`CodeBuddy did not return JSON: ${stripped.slice(0, 200)}`);
  }
  return schema.parse(data);
}
