// MCP server exposing the Chief Strategist as a single tool.

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { InputSchema } from "./contract.js";
import { handle } from "./handler.js";

const TOOL_NAME = "strategy_call";

export function buildMcpServer(): Server {
  const server = new Server(
    { name: "foru-archetype-c-chief-strategist", version: "0.1.0" },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: TOOL_NAME,
        description:
          "Produce a strategic call (accumulate / hold / reduce / exit) on a trading pair, with rationale and risks.",
        inputSchema: {
          type: "object",
          properties: {
            pair: { type: "string", description: "Trading pair, e.g. ETHUSDT or BTCUSDT" },
            horizon: {
              type: "string",
              description: "short | medium | long. Defaults to 'short'.",
            },
            riskTolerance: {
              type: "string",
              description: "low | medium | high. Defaults to 'medium'.",
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
