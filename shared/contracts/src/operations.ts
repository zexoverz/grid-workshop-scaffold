import { z } from "zod";

export const OperationsInputSchema = z.object({
  pair: z.string(),
  thresholds: z
    .object({
      pricePctChange: z.number().optional().default(2),
      volumeMultiplier: z.number().optional().default(3),
    })
    .optional()
    .default({}),
});

export const AlertSchema = z.object({
  kind: z.string(),
  message: z.string(),
  severity: z.string(),
  observedAt: z.string(),
});

export const OperationsOutputSchema = z.object({
  alerts: z.array(AlertSchema),
  severity: z.string(),
  evaluated: z.object({
    pair: z.string(),
    samples: z.number(),
  }),
});

export type OperationsInput = z.infer<typeof OperationsInputSchema>;
export type OperationsOutput = z.infer<typeof OperationsOutputSchema>;

export const OPERATIONS_SAMPLE_INPUT: OperationsInput = {
  pair: "BTCUSDT",
  thresholds: { pricePctChange: 2, volumeMultiplier: 3 },
};
