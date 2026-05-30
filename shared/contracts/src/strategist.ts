import { z } from "zod";

export const StrategistInputSchema = z.object({
  pair: z.string(),
  horizon: z.string().optional().default("short"),
  riskTolerance: z.string().optional().default("medium"),
});

export const StrategistOutputSchema = z.object({
  recommendation: z.string(),
  rationale: z.string(),
  risks: z.array(z.string()),
  horizon: z.string(),
});

export type StrategistInput = z.infer<typeof StrategistInputSchema>;
export type StrategistOutput = z.infer<typeof StrategistOutputSchema>;

export const STRATEGIST_SAMPLE_INPUT: StrategistInput = {
  pair: "ETHUSDT",
  horizon: "short",
  riskTolerance: "medium",
};
