// Standalone HTTP server for archetype A.
//
//   GET  /          → operating page (public/index.html)
//   GET  /soul      → SOUL.md as plain text (shown on the operating page)
//   POST /invoke    → REST endpoint matching contract.ts (used by Grid + the
//                     "Run" button on the operating page)
//   ANY  /mcp       → MCP Streamable HTTP transport, exposes the agent as
//                     an MCP tool
//   GET  /health    → liveness probe for Cloud Run / GCP
//
// No framework — node:http only. Run with `npm run dev` (tsx).

import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { ARCHETYPES } from "@foru-workshop/contracts";
import { news, onchain, prices, twitter } from "@foru-workshop/mock-clients";

import { InputSchema } from "./contract.js";
import { handle } from "./handler.js";
import { buildMcpServer } from "./mcp.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(HERE, "../public");
const SOUL_PATH = path.resolve(HERE, "../SOUL.md");
const PORT = Number(process.env.PORT ?? 8080);
const MAX_BODY_BYTES = 256 * 1024;
const META = ARCHETYPES.A;

async function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error("Request body too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(body));
}

async function serveStatic(
  res: ServerResponse,
  filePath: string,
  contentType: string,
): Promise<void> {
  try {
    const body = await fs.readFile(filePath);
    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-store",
    });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  }
}

async function handleInvoke(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const raw = await readBody(req);
    const input = raw ? JSON.parse(raw) : {};
    const parsed = InputSchema.safeParse(input);
    if (!parsed.success) {
      sendJson(res, 400, { error: "Invalid input", detail: parsed.error.flatten() });
      return;
    }
    const output = await handle(parsed.data);
    sendJson(res, 200, output);
  } catch (err) {
    sendJson(res, 500, { error: err instanceof Error ? err.message : String(err) });
  }
}

// MCP streamable-HTTP session map — canonical pattern from the SDK README.
// One transport per client session; created on `initialize`, reused for
// subsequent requests via the Mcp-Session-Id header.
const mcpTransports = new Map<string, StreamableHTTPServerTransport>();

async function handleMcp(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    let parsedBody: unknown;
    if (req.method === "POST") {
      const raw = await readBody(req);
      parsedBody = raw ? JSON.parse(raw) : undefined;
    }

    const sessionId = req.headers["mcp-session-id"];
    const sessionKey = Array.isArray(sessionId) ? sessionId[0] : sessionId;
    let transport = sessionKey ? mcpTransports.get(sessionKey) : undefined;

    if (!transport) {
      if (req.method !== "POST" || !isInitializeRequest(parsedBody)) {
        sendJson(res, 400, {
          jsonrpc: "2.0",
          error: { code: -32000, message: "Missing or unknown Mcp-Session-Id" },
          id: null,
        });
        return;
      }
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (id) => {
          mcpTransports.set(id, transport!);
        },
      });
      transport.onclose = () => {
        if (transport!.sessionId) mcpTransports.delete(transport!.sessionId);
      };
      const server = buildMcpServer();
      await server.connect(transport);
    }

    await transport.handleRequest(req, res, parsedBody);
  } catch (err) {
    if (!res.headersSent) {
      sendJson(res, 500, { error: err instanceof Error ? err.message : String(err) });
    } else {
      res.end();
    }
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

  if (req.method === "GET" && url.pathname === "/health") {
    sendJson(res, 200, { ok: true, archetype: "A", role: META.role });
    return;
  }
  if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
    await serveStatic(res, path.join(PUBLIC_DIR, "index.html"), "text/html; charset=utf-8");
    return;
  }
  if (req.method === "GET" && url.pathname === "/soul") {
    await serveStatic(res, SOUL_PATH, "text/markdown; charset=utf-8");
    return;
  }
  if (req.method === "POST" && url.pathname === "/invoke") {
    await handleInvoke(req, res);
    return;
  }
  if (req.method === "GET" && url.pathname === "/data") {
    const token = (url.searchParams.get("token") ?? "ETH").toUpperCase();
    const supported = ["ETH", "BTC", "SOL"];
    if (!supported.includes(token)) {
      sendJson(res, 400, { error: `Unsupported token: ${token}` });
      return;
    }
    const pair =
      token === "BTC" ? "BTCUSDT" :
      token === "ETH" ? "ETHUSDT" :
      token === "SOL" ? "SOLUSDT" :
      null;
    const [tweets, headlines, largeTransfers, candles] = await Promise.all([
      twitter.getRecentTweets(token as never).catch(() => []),
      news.getRecentHeadlines(token as never).catch(() => []),
      onchain.getLargeTransfers(token).catch(() => []),
      pair ? prices.getOhlcv(pair as never, 60).catch(() => []) : Promise.resolve([]),
    ]);
    sendJson(res, 200, { token, pair, tweets, headlines, largeTransfers, candles });
    return;
  }
  if (url.pathname === "/mcp") {
    await handleMcp(req, res);
    return;
  }
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found");
});

server.listen(PORT, () => {
  process.stdout.write(
    `[archetype A · ${META.role}] listening on http://0.0.0.0:${PORT}\n`,
  );
});
