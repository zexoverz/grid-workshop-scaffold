import { z } from "zod";

export const TraderInputSchema = z.object({
  pair: z.enum(["BTCUSDT", "ETHUSDT"]),
  portfolio: z.object({
    baseFreeUsd: z.number().nonnegative(),
    positionUsd: z.number().nonnegative(),
  }),
});

export const TraderOutputSchema = z.object({
  signal: z.enum(["BUY", "HOLD", "SELL"]),
  sizeUsd: z.number().nonnegative(),
  reason: z.string().min(20).max(400),
  slippageTolerancePct: z.number().min(0).max(5),
});

export type TraderInput = z.infer<typeof TraderInputSchema>;
export type TraderOutput = z.infer<typeof TraderOutputSchema>;

export const TRADER_SAMPLE_INPUT: TraderInput = {
  pair: "BTCUSDT",
  portfolio: { baseFreeUsd: 10_000, positionUsd: 0 },
};
