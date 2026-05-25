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

import http from "node:http";
import { URL } from "node:url";

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

function tweets(token: string) {
  return {
    token,
    windowHours: 24,
    tweets: Array.from({ length: 10 }, (_, i) => ({
      id: `t${i}`,
      author: `crypto_${i}`,
      text: `${token} ${i % 2 === 0 ? "looking strong" : "watching closely"} #${token}`,
      likes: 100 + i * 50,
      retweets: 20 + i * 10,
      createdAt: new Date(Date.now() - i * 60_000).toISOString(),
    })),
  };
}

function headlines(token: string) {
  return {
    token,
    windowHours: 24,
    headlines: [
      {
        id: "h1",
        source: "MockCoinDesk",
        title: `${token} ETF inflows hit weekly high`,
        url: "https://mock-news.foruai.io/articles/eth-etf-flows",
        publishedAt: new Date(Date.now() - 3_600_000).toISOString(),
        tokens: [token],
      },
      {
        id: "h2",
        source: "MockTheBlock",
        title: `On-chain ${token} validator queue stable`,
        url: "https://mock-news.foruai.io/articles/validator-queue",
        publishedAt: new Date(Date.now() - 7_200_000).toISOString(),
        tokens: [token],
      },
    ],
  };
}

function ohlcv(symbol: string) {
  const candles = Array.from({ length: 60 }, (_, i) => {
    const base = symbol === "BTCUSDT" ? 60_000 : 3_000;
    const noise = Math.sin(i / 5) * (base * 0.005);
    const close = base + noise;
    return {
      openTime: Date.now() - (60 - i) * 60_000,
      open: close - 5,
      high: close + 10,
      low: close - 10,
      close,
      volume: 100 + Math.abs(noise),
    };
  });
  return { symbol, interval: "1m", candles };
}

function largeTransfers(token: string) {
  return {
    windowHours: 24,
    minAmountUsd: 1_000_000,
    events: [
      {
        hash: "0xabc",
        chain: "ethereum" as const,
        token,
        amountUsd: 12_500_000,
        from: "0xexchange",
        to: "0xcoldstorage",
        blockTime: new Date(Date.now() - 1_800_000).toISOString(),
        label: "exchange → cold storage",
      },
      {
        hash: "0xdef",
        chain: "ethereum" as const,
        token,
        amountUsd: 4_200_000,
        from: "0xwhale",
        to: "0xexchange",
        blockTime: new Date(Date.now() - 5_400_000).toISOString(),
      },
    ],
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
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    try {
      if (url.pathname === "/health") return send(res, 200, { ok: true });
      if (url.pathname === "/tweets") {
        const token = url.searchParams.get("token") ?? "ETH";
        return send(res, 200, tweets(token));
      }
      if (url.pathname === "/headlines") {
        const token = url.searchParams.get("token") ?? "ETH";
        return send(res, 200, headlines(token));
      }
      if (url.pathname === "/ohlcv") {
        const symbol = url.searchParams.get("symbol") ?? "BTCUSDT";
        return send(res, 200, ohlcv(symbol));
      }
      if (url.pathname === "/large-transfers") {
        const token = url.searchParams.get("token") ?? "ETH";
        return send(res, 200, largeTransfers(token));
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
