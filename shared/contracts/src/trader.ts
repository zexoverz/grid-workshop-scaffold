import { z } from "zod";

export const TraderInputSchema = z.object({
  pair: z.string(),
  portfolio: z.object({
    baseFreeUsd: z.number(),
    positionUsd: z.number(),
  }),
});

export const TraderOutputSchema = z.object({
  signal: z.string(),
  sizeUsd: z.number(),
  reason: z.string(),
  slippageTolerancePct: z.number(),
});

export type TraderInput = z.infer<typeof TraderInputSchema>;
export type TraderOutput = z.infer<typeof TraderOutputSchema>;

export const TRADER_SAMPLE_INPUT: TraderInput = {
  pair: "BTCUSDT",
  portfolio: { baseFreeUsd: 10_000, positionUsd: 0 },
};
