// MCP server exposing the Head Trader as a single tool.

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { InputSchema } from "./contract.js";
import { handle } from "./handler.js";

const TOOL_NAME = "trade_decision";

export function buildMcpServer(): Server {
  const server = new Server(
    { name: "foru-archetype-e-head-trader", version: "0.1.0" },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: TOOL_NAME,
        description:
          "Produce a single execution decision (BUY / HOLD / SELL) sized for the portfolio, with reason and slippage tolerance.",
        inputSchema: {
          type: "object",
          properties: {
            pair: { type: "string", description: "Trading pair, e.g. BTCUSDT" },
            portfolio: {
              type: "object",
              properties: {
                baseFreeUsd: {
                  type: "number",
                  description: "USD available for new positions",
                },
                positionUsd: {
                  type: "number",
                  description: "Current open position in USD (0 if flat)",
                },
              },
              required: ["baseFreeUsd", "positionUsd"],
            },
          },
          required: ["pair", "portfolio"],
        },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    if (req.params.name !== TOOL_NAME) {
      return {
        content: [{ type: "text", text: `Unknown tool: ${req.params.name}` }],
        isError: true,
      };
    }
    const parsed = InputSchema.safeParse(req.params.arguments);
    if (!parsed.success) {
      return {
        content: [{ type: "text", text: `Invalid input: ${parsed.error.message}` }],
        isError: true,
      };
    }
    const output = await handle(parsed.data);
    return { content: [{ type: "text", text: JSON.stringify(output, null, 2) }] };
  });

  return server;
}
