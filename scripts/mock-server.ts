// Local in-process mock server for testing the scaffold without hitting
// real endpoints. Serves:
//   /health                       — health probe used by `npx foru mocks`
//   /tweets?token=...             — mock-twitter shape
//   /headlines?token=...          — mock-news shape
//   /ohlcv?symbol=...             — mock-prices shape
//   /large-transfers?token=...    — mock-onchain shape
//   /chat/completions             — OpenAI-compatible fake LLM that returns
//                                   schema-valid JSON depending on the
//                                   archetype detected in the prompt.
//
// Mock data is read from CSVs in mocks/data/*.csv at server start.
// Edit those CSVs to enrich what your agent sees — no code changes required.

import { promises as fs } from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { URL } from "node:url";

// ─── CSV loader ─────────────────────────────────────────────────────────────
const HERE = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(HERE, "../mocks/data");

function parseCsvRow(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuote && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuote = !inQuote;
      }
    } else if (c === "," && !inQuote) {
      out.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out;
}

async function loadCsv(file: string): Promise<Record<string, string>[]> {
  const text = await fs.readFile(path.join(DATA_DIR, file), "utf8");
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const headers = parseCsvRow(lines[0]);
  return lines.slice(1).map((line) => {
    const cells = parseCsvRow(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = cells[i] ?? ""));
    return row;
  });
}

interface MockDataset {
  tweets: Record<string, string>[];
  headlines: Record<string, string>[];
  prices: Record<string, string>[];
  onchain: Record<string, string>[];
}

async function loadDataset(): Promise<MockDataset> {
  const [tweets, headlines, prices, onchain] = await Promise.all([
    loadCsv("tweets.csv"),
    loadCsv("headlines.csv"),
    loadCsv("prices.csv"),
    loadCsv("onchain.csv"),
  ]);
  return { tweets, headlines, prices, onchain };
}

const ARCHETYPE_KEYWORDS: Record<string, string> = {
  A: "Head of Research",
  B: "Customer Success",
  C: "Chief Strategist",
  E: "Head Trader",
};

function detectArchetype(body: unknown): "A" | "B" | "C" | "E" | null {
  const json = JSON.stringify(body);
  for (const [code, kw] of Object.entries(ARCHETYPE_KEYWORDS)) {
    if (json.includes(kw)) return code as "A" | "B" | "C" | "E";
  }
  return null;
}

function llmReplyFor(code: "A" | "B" | "C" | "E"): unknown {
  switch (code) {
    case "A":
      return {
        summary:
          "ETH sentiment over the last 24h leans constructive, driven by ETF flow chatter, stable validator queue, and steady whale accumulation seen in the recent large transfers. No major negative catalysts in the feed.",
        sentiment: "bullish",
        confidence: 0.62,
        sources: [
          "https://mock-news.foruai.io/articles/eth-etf-flows",
          "https://mock-news.foruai.io/articles/validator-queue",
        ],
      };
    case "B":
      return {
        reply:
          "Untuk mulai trading di Indodax: buat akun, selesaikan KYC dasar, deposit IDR via bank atau e-wallet, lalu pilih pasangan trading di market list. Mulai dengan limit order kecil agar terbiasa dengan slippage.",
        intent: "onboarding",
        followUps: [
          "Berapa lama proses KYC biasanya?",
          "Apa beda market dan limit order?",
          "Minimum deposit IDR berapa?",
        ],
      };
    case "C":
      return {
        recommendation: "hold",
        rationale:
          "ETHUSDT range-bound over the last 30 1m candles with no decisive break. Volume average steady. Large on-chain transfers were balanced between exchanges and self-custody, suggesting no immediate directional pressure.",
        risks: [
          "1m horizon vulnerable to noise",
          "Volume profile thin on the upper wick",
          "Macro headline risk this week",
        ],
        horizon: "short",
      };
    case "E":
      return {
        signal: "HOLD",
        sizeUsd: 0,
        reason:
          "Price action over the last 30 1m candles is range-bound with no convincing trigger. Hold and wait for either a volume-confirmed breakout or a clean pullback to support before sizing in.",
        slippageTolerancePct: 0.4,
      };
  }
}

function tweets(token: string, ds: MockDataset) {
  const now = Date.now();
  const rows = ds.tweets.filter((r) => r.token === token);
  return {
    token,
    windowHours: 24,
    tweets: rows.map((r) => ({
      id: r.id,
      author: r.author,
      text: r.text,
      likes: Number(r.likes),
      retweets: Number(r.retweets),
      createdAt: new Date(now - Number(r.minutesAgo) * 60_000).toISOString(),
    })),
  };
}

function headlines(token: string, ds: MockDataset) {
  const now = Date.now();
  const rows = ds.headlines.filter((r) => r.token === token);
  return {
    token,
    windowHours: 24,
    headlines: rows.map((r) => ({
      id: r.id,
      source: r.source,
      title: r.title,
      url: r.url,
      publishedAt: new Date(now - Number(r.hoursAgo) * 3_600_000).toISOString(),
      tokens: [token],
    })),
  };
}

function ohlcv(symbol: string, ds: MockDataset) {
  const now = Date.now();
  const rows = ds.prices
    .filter((r) => r.symbol === symbol)
    .map((r) => ({
      openTime: now - Number(r.minutesAgo) * 60_000,
      open: Number(r.open),
      high: Number(r.high),
      low: Number(r.low),
      close: Number(r.close),
      volume: Number(r.volume),
    }))
    .sort((a, b) => a.openTime - b.openTime); // oldest → newest
  return { symbol, interval: "1m", candles: rows };
}

function largeTransfers(token: string, ds: MockDataset, minAmountUsd: number) {
  const now = Date.now();
  const rows = ds.onchain
    .filter((r) => r.token === token && Number(r.amountUsd) >= minAmountUsd)
    .map((r) => {
      const event: Record<string, unknown> = {
        hash: r.hash,
        chain: r.chain,
        token: r.token,
        amountUsd: Number(r.amountUsd),
        from: r.from,
        to: r.to,
        blockTime: new Date(now - Number(r.minutesAgo) * 60_000).toISOString(),
      };
      if (r.label) event.label = r.label;
      return event;
    });
  return {
    windowHours: 24,
    minAmountUsd,
    events: rows,
  };
}

function send(res: http.ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

async function readBody(req: http.IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return {};
  }
}

export interface MockServer {
  url: string;
  setLlmMode: (mode: "ok" | "ratelimit") => void;
  close: () => Promise<void>;
}

export async function startMockServer(port = 0): Promise<MockServer> {
  let llmMode: "ok" | "ratelimit" = "ok";
  const dataset = await loadDataset();
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    try {
      if (url.pathname === "/health") {
        return send(res, 200, {
          ok: true,
          counts: {
            tweets: dataset.tweets.length,
            headlines: dataset.headlines.length,
            prices: dataset.prices.length,
            onchain: dataset.onchain.length,
          },
        });
      }
      if (url.pathname === "/tweets") {
        const token = url.searchParams.get("token") ?? "ETH";
        return send(res, 200, tweets(token, dataset));
      }
      if (url.pathname === "/headlines") {
        const token = url.searchParams.get("token") ?? "ETH";
        return send(res, 200, headlines(token, dataset));
      }
      if (url.pathname === "/ohlcv") {
        const symbol = url.searchParams.get("symbol") ?? "BTCUSDT";
        return send(res, 200, ohlcv(symbol, dataset));
      }
      if (url.pathname === "/large-transfers") {
        const token = url.searchParams.get("token") ?? "ETH";
        const min = Number(url.searchParams.get("min") ?? "1000000");
        return send(res, 200, largeTransfers(token, dataset, min));
      }
      if (url.pathname === "/chat/completions") {
        if (llmMode === "ratelimit") {
          return send(res, 429, { error: { message: "rate limit (simulated)" } });
        }
        const body = await readBody(req);
        const code = detectArchetype(body) ?? "A";
        const content = JSON.stringify(llmReplyFor(code));
        return send(res, 200, {
          choices: [{ message: { role: "assistant", content } }],
        });
      }
      send(res, 404, { error: "not found", path: url.pathname });
    } catch (err) {
      send(res, 500, { error: (err as Error).message });
    }
  });

  await new Promise<void>((resolve) => server.listen(port, "127.0.0.1", resolve));
  const addr = server.address();
  const actualPort = typeof addr === "object" && addr ? addr.port : port;
  const url = `http://127.0.0.1:${actualPort}`;
  return {
    url,
    setLlmMode: (mode) => {
      llmMode = mode;
    },
    close: () =>
      new Promise<void>((resolve, reject) =>
        server.close((err) => (err ? reject(err) : resolve())),
      ),
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startMockServer(5599).then(({ url }) => {
    console.log(`mock server up at ${url}`);
  });
}
