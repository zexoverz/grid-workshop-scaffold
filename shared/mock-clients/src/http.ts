import { z } from "zod";

export type MockEndpoint = "twitter" | "news" | "prices" | "onchain";

const ENV_KEYS: Record<MockEndpoint, string> = {
  twitter: "MOCK_TWITTER_URL",
  news: "MOCK_NEWS_URL",
  prices: "MOCK_PRICES_URL",
  onchain: "MOCK_ONCHAIN_URL",
};

const DEFAULTS: Record<MockEndpoint, string> = {
  twitter: "https://mock-twitter.foruai.io",
  news: "https://mock-news.foruai.io",
  prices: "https://mock-prices.foruai.io",
  onchain: "https://mock-onchain.foruai.io",
};

export function baseUrl(endpoint: MockEndpoint): string {
  return process.env[ENV_KEYS[endpoint]] ?? DEFAULTS[endpoint];
}

export interface FetchOptions {
  retries?: number;
  timeoutMs?: number;
}

const DEFAULT_RETRIES = 2;
const DEFAULT_TIMEOUT_MS = 5000;

export async function fetchJson<T>(
  endpoint: MockEndpoint,
  path: string,
  schema: z.ZodType<T>,
  opts: FetchOptions = {},
): Promise<T> {
  const url = `${baseUrl(endpoint)}${path}`;
  const retries = opts.retries ?? DEFAULT_RETRIES;
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: ac.signal });
      if (!res.ok) throw new Error(`${endpoint} ${path} → ${res.status}`);
      const data = await res.json();
      return schema.parse(data);
    } catch (err) {
      lastErr = err;
      if (attempt === retries) break;
      await sleep(150 * (attempt + 1));
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error(
    `mock-${endpoint} unreachable after ${retries + 1} attempts: ${String(lastErr)}`,
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
