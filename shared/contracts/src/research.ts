import { z } from "zod";

export const ResearchInputSchema = z.object({
  token: z.enum(["ETH", "BTC", "SOL"]),
  windowHours: z.number().int().positive().max(72).default(24),
});

export const ResearchOutputSchema = z.object({
  summary: z.string().min(40).max(800),
  sentiment: z.enum(["bullish", "bearish", "neutral"]),
  confidence: z.number().min(0).max(1),
  sources: z.array(z.string().url()).min(1).max(10),
});

export type ResearchInput = z.infer<typeof ResearchInputSchema>;
export type ResearchOutput = z.infer<typeof ResearchOutputSchema>;

export const RESEARCH_SAMPLE_INPUT: ResearchInput = {
  token: "ETH",
  windowHours: 24,
};
