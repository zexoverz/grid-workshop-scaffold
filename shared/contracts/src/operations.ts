import { z } from "zod";

export const OperationsInputSchema = z.object({
  pair: z.enum(["BTCUSDT", "ETHUSDT"]),
  thresholds: z.object({
    pricePctChange: z.number().positive().default(2),
    volumeMultiplier: z.number().positive().default(3),
  }),
});

export const AlertSchema = z.object({
  kind: z.enum(["price_spike", "volume_spike", "drawdown", "stale_feed"]),
  message: z.string().min(1).max(300),
  severity: z.enum(["info", "warn", "critical"]),
  observedAt: z.string(),
});

export const OperationsOutputSchema = z.object({
  alerts: z.array(AlertSchema).max(10),
  severity: z.enum(["info", "warn", "critical"]),
  evaluated: z.object({
    pair: z.string(),
    samples: z.number().int().nonnegative(),
  }),
});

export type OperationsInput = z.infer<typeof OperationsInputSchema>;
export type OperationsOutput = z.infer<typeof OperationsOutputSchema>;

export const OPERATIONS_SAMPLE_INPUT: OperationsInput = {
  pair: "BTCUSDT",
  thresholds: { pricePctChange: 2, volumeMultiplier: 3 },
};
