// LOCKED — do not edit. Edits live in brain.ts.

import { InputSchema, OutputSchema } from "./contract.js";
import { brain } from "./brain.js";
import { fallback } from "./fallback.js";

export async function handle(rawInput: unknown): Promise<unknown> {
  const input = InputSchema.parse(rawInput);
  let output;
  try {
    output = await brain(input);
  } catch {
    output = await fallback(input);
  }
  return OutputSchema.parse(output);
}

export default handle;
