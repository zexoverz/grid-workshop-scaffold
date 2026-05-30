import { z } from "zod";

// Loose contract — field names matter, value shapes are advisory.
// The SOUL.md describes the *expected* values; this just makes sure
// the agent returned the right fields.

export const ResearchInputSchema = z.object({
  token: z.string(),
  windowHours: z.number().optional().default(24),
});

export const ResearchOutputSchema = z.object({
  summary: z.string(),
  sentiment: z.string(),
  confidence: z.number(),
  sources: z.array(z.string()),
});

export type ResearchInput = z.infer<typeof ResearchInputSchema>;
export type ResearchOutput = z.infer<typeof ResearchOutputSchema>;

export const RESEARCH_SAMPLE_INPUT: ResearchInput = {
  token: "ETH",
  windowHours: 24,
};
