// MCP server exposing the Customer Success Lead as a single tool.

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { InputSchema } from "./contract.js";
import { handle } from "./handler.js";

const TOOL_NAME = "support_reply";

export function buildMcpServer(): Server {
  const server = new Server(
    { name: "foru-archetype-b-customer-success-lead", version: "0.1.0" },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: TOOL_NAME,
        description:
          "Answer a trader's question in their requested language. Returns reply, detected intent, and short follow-up suggestions.",
        inputSchema: {
          type: "object",
          properties: {
            userMessage: { type: "string", description: "The trader's question" },
            userId: { type: "string", description: "Optional user identifier" },
            language: {
              type: "string",
              description: "Reply language code (e.g. 'id', 'en'). Defaults to 'en'.",
            },
          },
          required: ["userMessage"],
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
