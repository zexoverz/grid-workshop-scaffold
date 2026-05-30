// MCP server exposing the Operations Officer as a single tool.

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { InputSchema } from "./contract.js";
import { handle } from "./handler.js";

const TOOL_NAME = "ops_alerts";

export function buildMcpServer(): Server {
  const server = new Server(
    { name: "foru-archetype-d-operations-officer", version: "0.1.0" },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: TOOL_NAME,
        description:
          "Scan recent price data for a pair and return alerts when configured thresholds breach. Deterministic (no LLM).",
        inputSchema: {
          type: "object",
          properties: {
            pair: { type: "string", description: "Trading pair, e.g. BTCUSDT" },
            thresholds: {
              type: "object",
              properties: {
                pricePctChange: {
                  type: "number",
                  description: "Net %-change threshold across the window. Default 2.",
                },
                volumeMultiplier: {
                  type: "number",
                  description: "Last-candle-volume vs rolling-avg multiplier. Default 3.",
                },
              },
            },
          },
          required: ["pair"],
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
