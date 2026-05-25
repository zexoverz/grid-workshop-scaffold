import { z } from "zod";
import { fetchJson } from "./http.js";

export const CandleSchema = z.object({
  openTime: z.number().int(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
});
export type Candle = z.infer<typeof CandleSchema>;

const ResponseSchema = z.object({
  symbol: z.string(),
  interval: z.string(),
  candles: z.array(CandleSchema),
});

export type Pair = "BTCUSDT" | "ETHUSDT";

export async function getOhlcv(
  pair: Pair,
  limit: number = 60,
): Promise<Candle[]> {
  const data = await fetchJson(
    "prices",
    `/ohlcv?symbol=${pair}&interval=1m&limit=${limit}`,
    ResponseSchema,
  );
  return data.candles;
}
