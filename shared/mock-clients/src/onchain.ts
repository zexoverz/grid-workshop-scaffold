import { z } from "zod";
import { fetchJson } from "./http.js";

export const LargeTxSchema = z.object({
  hash: z.string(),
  chain: z.enum(["ethereum", "bsc", "solana"]),
  token: z.string(),
  amountUsd: z.number(),
  from: z.string(),
  to: z.string(),
  blockTime: z.string(),
  label: z.string().optional(),
});
export type LargeTx = z.infer<typeof LargeTxSchema>;

const ResponseSchema = z.object({
  windowHours: z.number().int().positive(),
  minAmountUsd: z.number(),
  events: z.array(LargeTxSchema),
});

export async function getLargeTransfers(
  token: string,
  minAmountUsd: number = 1_000_000,
): Promise<LargeTx[]> {
  const data = await fetchJson(
    "onchain",
    `/large-transfers?token=${token}&min=${minAmountUsd}`,
    ResponseSchema,
  );
  return data.events;
}
