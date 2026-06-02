# FORU Grid Workshop Scaffold

> **One Man Team Workshop** · Real World AI Agent Hackathon — Pre-Event Experience
> *The Solopreneur Stack — Building a One-Person Company with AI Agents.*

You are the founder of a Web3 trading firm. Headcount: one. Today, you hire your first AI employees.

---

## 🚀 Try it now — no install needed

All five archetypes are running live on a public GCP VM. Open any of these in a browser and play with the operator consoles before you write a single line of code:

| | Role | Operator console |
|---|---|---|
| **A** | Head of Research | http://35.192.185.103:8080 |
| **B** | Customer Success Lead | http://35.192.185.103:8081 |
| **C** | Chief Strategist | http://35.192.185.103:8082 |
| **D** | Operations Officer | http://35.192.185.103:8083 |
| **E** | Head Trader | http://35.192.185.103:8084 |

**Curl test** (archetype D is deterministic — works even if the shared LLM key is exhausted):

```bash
curl -s -X POST http://35.192.185.103:8083/invoke \
  -H 'content-type: application/json' \
  -d '{"pair":"BTCUSDT","thresholds":{"pricePctChange":2,"volumeMultiplier":3}}'
```

Full live-deployment details — endpoints, firewall, ops runbook — in [`docs/live-deployment.md`](./docs/live-deployment.md).

---

## The mental model

Each archetype is one **AI employee**. Each one comes with a **`SOUL.md`** — the persona that defines who the agent is, how it talks, and what it returns. The boilerplate already works; to make the agent *yours*, you edit the SOUL.

```
  PICK ────► EDIT SOUL ────► RUN ────► REGISTER
  one of    vibe-code         npm        on FORU Grid
  five      with CodeBuddy   run dev    grid.foruai.io
```

Four steps. ~45 minutes for the typical participant.

---

## The 5 AI Employees

| | Role | Problem | What the operator console looks like |
|---|---|---|---|
| **A** | Head of Research | P1 · Pre-trade intelligence | Research dashboard: sentiment pill, confidence bar, price + tweet-engagement charts, clickable sources |
| **B** | Customer Success Lead | P2 · Trader experience | Chat interface with multi-turn memory, intent pills, follow-up chips, paginated FAQ panel |
| **C** | Chief Strategist | P3 · Decision support | Strategy memo: accumulate/hold/reduce/exit card, rationale, risks list, price chart, on-chain flow |
| **D** | Operations Officer | P4 · Operations monitoring | Ops dashboard: severity-banner, alert cards, threshold-overlay chart, **Watch mode** auto-polling |
| **E** | Head Trader | P5 · Execution | Trade ticket: BUY/HOLD/SELL chip, sized order, slippage gauge, portfolio before→after |

Each archetype's folder has the same shape:

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

---

## Quickstart — run it locally

Full step-by-step walkthrough: **[`docs/getting-started.md`](./docs/getting-started.md)**.

```bash
# Prereqs: Node 20+, npm

npm install
cp .env.example .env
# Edit .env — set AGENT_RUNTIME (openai|codebuddy), your LLM key,
# and point MOCK_*_URL at http://127.0.0.1:5599 for local dev

# Terminal 1 — mock data server (CSV-backed)
npm run mocks:serve

# Terminal 2 — pick an archetype and start its operator console
cd archetypes/A-head-of-research && npm run dev
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

---

## The workshop deliverable

Your agent is **complete** when:

1. ✅ The operator console at `http://localhost:<port>/` renders and `POST /invoke` matches the archetype's contract (`shared/contracts/src/<role>.ts`)
2. ✅ The agent is **deployed** — locally with `npm run dev`, in a container via the `Dockerfile`, or borrowed from the live VM above
3. ✅ The agent is **registered on FORU Grid** at https://grid.foruai.io — see [`docs/getting-started.md` §10](./docs/getting-started.md#10--register-your-archetype-on-foru-grid) for the screenshot-by-screenshot walkthrough

You'll need a wallet + email linked on **My Profile** before the Grid registration form will submit. Workshop-day path: **off-chain registration** (no ERC-8004 token needed yet).

---

## CodeBuddy is the primary prompting tool

Tencent **CodeBuddy** is the tools-partner for this workshop. Each archetype's `README.md` has CodeBuddy-shaped prompt recipes you can paste straight in — open the archetype folder in your editor with CodeBuddy active, paste a recipe, and let it edit `SOUL.md` (or `brain.ts`) for you.

ClaudeCode, Cursor, and Codex work too — the same prompt patterns transfer.

> CodeBuddy also runs the agent at *runtime* if you set `AGENT_RUNTIME=codebuddy` in `.env` (uses the [CodeBuddy Agent SDK](./docs/codebuddy-docs/sdk.md)). Set `CODEBUDDY_API_KEY` and the SDK spawns the CodeBuddy CLI under the hood. Defaults to `AGENT_RUNTIME=openai` if you'd rather use OpenAI directly.

---

## The data your agents can use

See **[`mocks/README.md`](./mocks/README.md)** — one catalog page listing every endpoint. Four shared sources (twitter, news, prices, onchain) backed by CSV files in `mocks/data/`.

To enrich what your agent sees, edit `mocks/data/*.csv` and restart `npm run mocks:serve`. No code change required.

---

## Calibrate all 5 archetypes

Compare persona outputs side-by-side from one command:

```bash
npm run calibrate            # all 5
npm run calibrate -- A C E   # specific archetypes
```

A previous calibration capture (full prompts + responses for review) lives at [`docs/calibration-2026-05-30.md`](./docs/calibration-2026-05-30.md).

---

## When things break

Common errors and fixes are in the **[Troubleshooting section of `docs/getting-started.md`](./docs/getting-started.md#troubleshooting)**:

- `mock-twitter unreachable` — start `npm run mocks:serve` and point `MOCK_*_URL` at `http://127.0.0.1:5599`
- `CODEBUDDY_API_KEY not set` — fill in `.env` or switch to `AGENT_RUNTIME=openai`
- `EADDRINUSE :8080` — another archetype is on the same port; set `PORT=8081` (or any free port)
- LLM rate-limited (`429`) — every brain auto-falls-back to `fallback.ts`, which still satisfies the contract
- Grid: **Register button disabled** — secondary wallet not linked, or a required field is empty
- Grid: **Ownership check failed** — the ERC-8004 token's `ownerOf` doesn't match your linked wallet; use the off-chain path

If 3+ teams hit the same bug, a facilitator will broadcast a room-wide fix.

---

## No local setup? Two options

1. **GitHub Codespaces** — open the repo in Codespaces, Node is pre-installed, run the Quickstart, forward the port
2. **Use the live deployment** above (`http://35.192.185.103:8080-8084`) as the integration target — you skip the install entirely but you can't edit your own SOUL. Best for "see what the workshop ships" without committing to a local stack

---

## Docs index

| Doc | What's in it |
|---|---|
| [`docs/getting-started.md`](./docs/getting-started.md) | End-to-end setup, run, customize, deploy, **Grid registration walkthrough**, troubleshooting |
| [`docs/live-deployment.md`](./docs/live-deployment.md) | The public VM: endpoints, firewall rules, ops runbook, cleanup |
| [`docs/calibration-2026-05-30.md`](./docs/calibration-2026-05-30.md) | Prompts + responses captured per archetype, for SOUL tuning review |
| [`docs/codebuddy-docs/sdk.md`](./docs/codebuddy-docs/sdk.md) | CodeBuddy Agent SDK reference |
| [`mocks/README.md`](./mocks/README.md) | Mock data catalog — four sources, CSV-backed |

---

## Workshop partners

- **FORU AI** — workshop owner, Grid platform, MC + Lead Engineer
- **EKRAF / Kemenkraf** — government voice on AI
- **Tencent CodeBuddy** — primary AI tooling partner
- **ICEX** — industry partner, Founder Mindset segment
- **INDODAX** — industry challenge partner, Problem Mapping & Archetype Selection
- **Mancer** — Pitch Crash Course, certificate issuer
