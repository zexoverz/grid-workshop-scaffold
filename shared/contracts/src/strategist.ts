import { z } from "zod";

export const StrategistInputSchema = z.object({
  pair: z.enum(["BTCUSDT", "ETHUSDT"]),
  horizon: z.enum(["short", "medium", "long"]).default("short"),
  riskTolerance: z.enum(["low", "medium", "high"]).default("medium"),
});

export const StrategistOutputSchema = z.object({
  recommendation: z.enum(["accumulate", "hold", "reduce", "exit"]),
  rationale: z.string().min(40).max(800),
  risks: z.array(z.string().min(1).max(200)).min(1).max(5),
  horizon: z.enum(["short", "medium", "long"]),
});

export type StrategistInput = z.infer<typeof StrategistInputSchema>;
export type StrategistOutput = z.infer<typeof StrategistOutputSchema>;

export const STRATEGIST_SAMPLE_INPUT: StrategistInput = {
  pair: "ETHUSDT",
  horizon: "short",
  riskTolerance: "medium",
};
