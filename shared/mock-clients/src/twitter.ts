import { z } from "zod";
import { fetchJson } from "./http.js";

export const TweetSchema = z.object({
  id: z.string(),
  author: z.string(),
  text: z.string(),
  likes: z.number().int().nonnegative(),
  retweets: z.number().int().nonnegative(),
  createdAt: z.string(),
});
export type Tweet = z.infer<typeof TweetSchema>;

const ResponseSchema = z.object({
  token: z.string(),
  windowHours: z.number().int().positive(),
  tweets: z.array(TweetSchema),
});

export type Token = "ETH" | "BTC" | "SOL";

export async function getRecentTweets(token: Token): Promise<Tweet[]> {
  const data = await fetchJson(
    "twitter",
    `/tweets?token=${token}&window=24h`,
    ResponseSchema,
  );
  return data.tweets;
}
