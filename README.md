# FORU Grid Workshop Scaffold

> **One Man Team Workshop** · Real World AI Agent Hackathon — Pre-Event Experience
> *The Solopreneur Stack — Building a One-Person Company with AI Agents.*

You are the founder of a Web3 trading firm. Headcount: one. Today, you hire your first AI employees.

## The mental model

Each archetype is one **AI employee**. Each one comes with a **`SOUL.md`** — the persona that defines who the agent is, how it talks, and what it returns. The boilerplate already works out of the box — to make the agent *yours*, you edit the SOUL.

```
  PICK an archetype     →    EDIT its SOUL.md      →    RUN
  cd archetypes/A-…          (vibe-code with             npm run dev
                              CodeBuddy, ClaudeCode,     → operator console at
                              Cursor, or Codex)            http://localhost:8080
```

## The 5 AI Employees

| | Role | Problem | Operator console |
|---|---|---|---|
| **A** | Head of Research | P1 · Pre-trade intelligence | Research dashboard: sentiment pill, confidence bar, price + engagement charts, sources list |
| **B** | Customer Success Lead | P2 · Trader experience | Chat interface with multi-turn memory, intent pills, follow-up chips, paginated FAQ panel |
| **C** | Chief Strategist | P3 · Decision support | Strategy memo: accumulate/hold/reduce/exit card, rationale, risks list, price chart, on-chain flow |
| **D** | Operations Officer | P4 · Operations monitoring | Ops dashboard: severity-banner, alert cards, threshold-overlay chart, **Watch mode** auto-polling |
| **E** | Head Trader | P5 · Execution | Trade ticket: BUY/HOLD/SELL chip, sized order, slippage gauge, portfolio before→after |

Each archetype folder has the same shape:

```
archetypes/A-head-of-research/
├── SOUL.md             ← edit me — the persona drives everything
├── public/
│   └── index.html      operator console (vanilla HTML/SVG, no build step)
├── src/
│   ├── brain.ts        orchestration: what data to fetch, how to assemble the prompt
│   ├── contract.ts     re-export of the I/O schema from shared/contracts/
│   ├── handler.ts      locked — wires the brain into the /invoke route
│   ├── server.ts       node:http server exposing /, /invoke, /mcp, /soul, /data, /health
│   ├── mcp.ts          MCP tool definition (exposes the archetype as an MCP-callable tool)
│   └── fallback.ts     no-LLM template path used when the LLM call fails
├── Dockerfile          single-process container, deployable to Cloud Run / Fly / Fargate
├── package.json        scripts: npm run dev / npm run start
└── README.md           CodeBuddy recipes for editing this archetype's SOUL
```

## Quickstart

Full setup walkthrough: **[`docs/getting-started.md`](./docs/getting-started.md)**.

```bash
# Prereqs: Node 20+, npm

npm install
cp .env.example .env
# Edit .env — set AGENT_RUNTIME (openai|codebuddy), your LLM key,
# and point MOCK_*_URL at http://127.0.0.1:5599 for local dev

# Terminal 1 — mock data server
npm run mocks:serve

# Terminal 2 — pick an archetype and start its operator console
cd archetypes/A-head-of-research
npm run dev
# Then open http://127.0.0.1:8080
```

Every archetype exposes the same routes:

| Method | Path | Returns |
|---|---|---|
| `GET` | `/` | The operator console (the UI) |
| `POST` | `/invoke` | The archetype's contract endpoint |
| `ANY` | `/mcp` | MCP Streamable HTTP transport (Claude Desktop / Cursor compatible) |
| `GET` | `/soul` | `SOUL.md` as plaintext |
| `GET` | `/health` | Liveness probe |
| `GET` | `/data?…` | Raw mock data for charts (A/C/D/E) |
| `GET` | `/faq` | Static FAQ entries (B only) |

## CodeBuddy is the primary prompting tool

Tencent **CodeBuddy** is the tools-partner for this workshop. Each archetype's `README.md` has CodeBuddy-shaped prompt recipes you can paste straight in — open the archetype folder in your editor with CodeBuddy active, paste a recipe, and let it edit `SOUL.md` (or `brain.ts`) for you.

ClaudeCode, Cursor, and Codex work too — the same prompt patterns transfer.

> CodeBuddy also runs the agent at *runtime* if you set `AGENT_RUNTIME=codebuddy` in `.env` (uses the CodeBuddy Agent SDK). Set up your `CODEBUDDY_API_KEY` and the SDK spawns the CodeBuddy CLI under the hood. Defaults to `AGENT_RUNTIME=openai` if you'd rather use OpenAI.

## The data your agents can use

See **[`mocks/README.md`](./mocks/README.md)** — one catalog page listing every endpoint. Four shared sources (twitter, news, prices, onchain) backed by CSV files in `mocks/data/`. Any archetype can call any of them.

To enrich what your agent sees, edit `mocks/data/*.csv` and restart `npm run mocks:serve`. No code change required.

## Calibrate all 5 archetypes

Compare persona outputs side-by-side:

```bash
npm run calibrate            # all 5
npm run calibrate -- A C E   # specific archetypes
```

A previous calibration capture (full prompts and responses for review) lives at [`docs/calibration-2026-05-30.md`](./docs/calibration-2026-05-30.md).

## Minimum Viable Submission

Your agent is **MVS-ready** when:

1. The operator console at `http://localhost:<port>/` renders and shows the response from `POST /invoke`
2. The `/invoke` JSON output matches the archetype's contract (`shared/contracts/src/<role>.ts`)
3. You have a one-line description for the agent's identity

On workshop day, your facilitator will help you register the agent on FORU Grid — for now, getting the operator console working locally is the bar.

You can also containerize for off-laptop deploy:

```bash
docker build -t archetype-a -f archetypes/A-head-of-research/Dockerfile .
docker run --rm -p 8080:8080 --env-file .env archetype-a
```

## When things break

Common errors and fixes are in the **[Troubleshooting section of `docs/getting-started.md`](./docs/getting-started.md#troubleshooting)**:

- `mock-twitter unreachable` — start `npm run mocks:serve` and point `MOCK_*_URL` at `http://127.0.0.1:5599`
- `CODEBUDDY_API_KEY not set` — fill in `.env` or switch to `AGENT_RUNTIME=openai`
- `EADDRINUSE :8080` — another archetype is on the same port; set `PORT=8081` (or any free port)
- LLM rate-limited — every brain auto-falls-back to `fallback.ts` which still satisfies the contract

If 3+ teams hit the same bug, a facilitator will broadcast a room-wide fix.

## Cloud fallback (no local setup)

The repo works in **GitHub Codespaces** — Node is pre-installed and the workspace boots clean. Open the repo in Codespaces, run the Quickstart commands, forward the port.

## Workshop partners

- **FORU AI** — workshop owner, Grid platform, MC + Lead Engineer
- **EKRAF / Kemenkraf** — government voice on AI
- **Tencent CodeBuddy** — primary AI tooling partner
- **OpenClaw** — agent orchestration layer (workshop deploy path)
- **ICEX** — industry partner, Founder Mindset segment
- **INDODAX** — industry challenge partner, Problem Mapping & Archetype Selection
- **Mancer** — Pitch Crash Course, certificate issuer
