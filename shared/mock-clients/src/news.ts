import { z } from "zod";
import { fetchJson } from "./http.js";

export const HeadlineSchema = z.object({
  id: z.string(),
  source: z.string(),
  title: z.string(),
  url: z.string().url(),
  publishedAt: z.string(),
  tokens: z.array(z.string()),
});
export type Headline = z.infer<typeof HeadlineSchema>;

const ResponseSchema = z.object({
  token: z.string(),
  windowHours: z.number().int().positive(),
  headlines: z.array(HeadlineSchema),
});

export type Token = "ETH" | "BTC" | "SOL";

export async function getRecentHeadlines(token: Token): Promise<Headline[]> {
  const data = await fetchJson(
    "news",
    `/headlines?token=${token}&window=24h`,
    ResponseSchema,
  );
  return data.headlines;
}
