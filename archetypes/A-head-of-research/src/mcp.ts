// MCP server exposing the Head of Research as a single tool.
// Used by /mcp on the HTTP server; can also be reused over stdio for IDE-side
// development if needed.

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { InputSchema } from "./contract.js";
import { handle } from "./handler.js";

const TOOL_NAME = "research_brief";

export function buildMcpServer(): Server {
  const server = new Server(
    { name: "foru-archetype-a-head-of-research", version: "0.1.0" },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: TOOL_NAME,
        description:
          "Produce a source-grounded research brief on a single token over a recent window. Returns summary, sentiment, confidence, sources.",
        inputSchema: {
          type: "object",
          properties: {
            token: { type: "string", description: "Token symbol, e.g. ETH" },
            windowHours: {
              type: "number",
              description: "Lookback window in hours (default 24)",
            },
          },
          required: ["token"],
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
        content: [
          { type: "text", text: `Invalid input: ${parsed.error.message}` },
        ],
        isError: true,
      };
    }

    const output = await handle(parsed.data);
    return {
      content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
    };
  });

  return server;
}
