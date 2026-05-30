# Mock Data Catalog

> One page. Every data source available to every agent. Browse this when
> you want to know what your agent can grab.

All four endpoints are served from a **single base URL** during the
workshop. Locally you can spin them up yourself:

```bash
npm run mocks:serve       # → http://127.0.0.1:5599
```

Health check the whole stack at any time:

```bash
npm run mocks:check
```

---

## The four sources

| Source | What it gives you | Used by |
|---|---|---|
| **twitter** | last-24h tweets about a token | A · _(yours?)_ |
| **news** | last-24h headlines about a token | A · _(yours?)_ |
| **prices** | 1-min OHLCV candles for a pair | C · D · E · _(yours?)_ |
| **onchain** | recent large transfers (whale moves) | A · C · E · _(yours?)_ |

The "Used by" column is a default — any archetype's agent can call any
endpoint. If your Customer Success Lead wants to quote a live BTC price,
it can call `prices`. Mix freely.

---

## 1. `twitter` — last-24h tweets

```ts
import { twitter } from "@foru-workshop/mock-clients";

const tweets = await twitter.getRecentTweets("ETH");  // or "BTC", "SOL"
```

Returns an array of:

```ts
{
  id: string,
  author: string,
  text: string,
  likes: number,
  retweets: number,
  createdAt: ISO timestamp
}
```

**Tokens supported:** `ETH`, `BTC`, `SOL`.

---

## 2. `news` — last-24h headlines

```ts
import { news } from "@foru-workshop/mock-clients";

const headlines = await news.getRecentHeadlines("ETH");
```

Returns an array of:

```ts
{
  id: string,
  source: string,          // "MockCoinDesk", "MockTheBlock", ...
  title: string,
  url: string,             // safe to cite as a source
  publishedAt: ISO timestamp,
  tokens: string[]
}
```

**Tokens supported:** `ETH`, `BTC`, `SOL`.

---

## 3. `prices` — 1-minute OHLCV candles

```ts
import { prices } from "@foru-workshop/mock-clients";

const candles = await prices.getOhlcv("BTCUSDT", 60);  // limit defaults to 60
```

Returns an array of:

```ts
{
  openTime: epoch ms,
  open: number,
  high: number,
  low: number,
  close: number,
  volume: number
}
```

**Pairs supported:** `BTCUSDT`, `ETHUSDT`.

---

## 4. `onchain` — recent large transfers

```ts
import { onchain } from "@foru-workshop/mock-clients";

const events = await onchain.getLargeTransfers("ETH", 1_000_000);
```

Returns an array of:

```ts
{
  hash: string,
  chain: "ethereum" | "bsc" | "solana",
  token: string,
  amountUsd: number,
  from: string,           // "0xexchange", "0xwhale", "0xcoldstorage" ...
  to: string,
  blockTime: ISO timestamp,
  label?: string          // human-readable hint, e.g. "exchange → cold storage"
}
```

---

## When mocks are down

The local mock server is the source of truth during workshop development.
If `mock-twitter`, `mock-news`, etc. start returning errors:

1. Check `.env` — `MOCK_*_URL` values
2. Run `npm run mocks:serve` to start the local mock
3. Every archetype ships a `fallback.ts` that satisfies the contract
   without any mock data. The brain auto-falls-back when calls fail.

## Editing mock data (CSV)

All four data sources are backed by CSVs in `mocks/data/`:

| File | What it feeds |
|---|---|
| `tweets.csv` | `/tweets?token=...` |
| `headlines.csv` | `/headlines?token=...` |
| `prices.csv` | `/ohlcv?symbol=...` |
| `onchain.csv` | `/large-transfers?token=...` |

Edit a CSV → restart `npm run mocks:serve` → your agent sees the new data.
No code change needed.

Time columns are **relative** (`minutesAgo`, `hoursAgo`) — the mock server
converts them to fresh ISO timestamps on each request, so data always
"looks recent" regardless of when you run.

## When you want to add a new source

Five places to touch:

1. `mocks/data/<your-source>.csv` — the data
2. `shared/mock-clients/src/<your-source>.ts` — the typed client
3. `shared/mock-clients/src/index.ts` — re-export the new namespace
4. `scripts/mock-server.ts` — handle the new path so local dev works
5. This file — document the new source

(Talk to a facilitator first — the workshop is intentionally constrained
to the four sources above so participants can compare archetypes
apples-to-apples.)
