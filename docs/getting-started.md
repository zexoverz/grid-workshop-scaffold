# Getting Started — Run the Scaffold Locally

This guide walks through running the workshop scaffold on your laptop end-to-end: install, pick an archetype, start the backend, open the operator console in your browser. Every command in this doc was executed and verified before being written down.

---

## Prerequisites

- **Node.js ≥ 20** (the workspace uses Node 20+ APIs including `--env-file`). Check with `node --version`.
- **npm** (ships with Node).
- **One LLM credential** — pick one:
  - **OpenAI** (fastest, default) — `sk-…` from https://platform.openai.com/api-keys
  - **CodeBuddy** (partner-product fit) — `ck_…` from https://www.codebuddy.ai/profile/keys. **Also requires the CodeBuddy CLI on PATH** — the SDK spawns it as a subprocess. See `docs/codebuddy-docs/sdk.md` for install.
- *(Optional)* Docker, if you want to containerize an archetype for deploy.

> Archetype D is **deterministic** (no LLM call) — if you only want to play with D you can skip the LLM credential entirely.

---

## 1 · Install

From the repo root:

```bash
npm install
```

This pulls dependencies for the workspace (shared packages + cli + all 5 archetypes).

---

## 2 · Configure `.env`

```bash
cp .env.example .env
```

Open `.env` and set what you need.

**For local development** the four `MOCK_*_URL` defaults point at `mock-*.foruai.io` which aren't reachable from your laptop yet. Replace them with the local mock URL:

```env
MOCK_TWITTER_URL=http://127.0.0.1:5599
MOCK_NEWS_URL=http://127.0.0.1:5599
MOCK_PRICES_URL=http://127.0.0.1:5599
MOCK_ONCHAIN_URL=http://127.0.0.1:5599
```

**Choose your runtime** (defaults to `openai`):

| `AGENT_RUNTIME=` | Set these | Notes |
|---|---|---|
| `openai` | `LLM_API_KEY=sk-…`, `LLM_MODEL=gpt-4o-mini` | ~2–4s per /invoke call |
| `codebuddy` | `CODEBUDDY_API_KEY=ck_…`, `CODEBUDDY_MODEL=default-model` | ~10–15s per /invoke (subprocess spawn); needs CodeBuddy CLI installed |

---

## 3 · Start the mock data server

In one terminal, from the repo root:

```bash
npm run mocks:serve
```

You should see:

```
mock server up at http://127.0.0.1:5599
```

Verify it's healthy:

```bash
curl http://127.0.0.1:5599/health
# {"ok":true,"counts":{"tweets":45,"headlines":30,"prices":180,"onchain":27}}
```

Leave this terminal running. The mock data is CSV-backed (in `mocks/data/`) — edit those CSVs to enrich what your agent sees, then restart this server.

---

## 4 · Pick an archetype

You're the founder of a one-person Web3 trading firm. Each archetype is one AI employee. Pick **one**:

| | Role | Problem | Operator console shape | Suggested port |
|---|---|---|---|---|
| **A** | Head of Research | P1 · Pre-trade intelligence | Research dashboard: sentiment pill, confidence bar, price chart, engagement chart, sources list | `8080` |
| **B** | Customer Success Lead | P2 · Trader experience | Chat interface with multi-turn memory, intent pills, follow-up chips, paginated FAQ side panel | `8081` |
| **C** | Chief Strategist | P3 · Decision support | Strategy memo: accumulate/hold/reduce/exit card, rationale, risks list, price chart, on-chain flow | `8082` |
| **D** | Operations Officer | P4 · Operations monitoring | Ops dashboard: severity-banner, alert cards, threshold-overlay chart, **Watch mode** (5s polling) | `8083` |
| **E** | Head Trader | P5 · Execution | Trade ticket: BUY/HOLD/SELL chip, sized order, slippage gauge, portfolio before→after | `8084` |

The persona for each is in `archetypes/<X>/SOUL.md`. The input/output schema (the "contract") is in `shared/contracts/src/<role>.ts`.

---

## 5 · Start the archetype's server

In a **second** terminal (mocks server stays running in the first). For archetype A:

```bash
cd archetypes/A-head-of-research
npm run dev
```

You should see:

```
[archetype A · Head of Research] listening on http://0.0.0.0:8080
```

Open **`http://127.0.0.1:8080`** in your browser → the operator console renders.

For a different archetype, swap the directory **and** override the port (so it doesn't clash with another running archetype):

```bash
cd archetypes/B-customer-success-lead && PORT=8081 npm run dev   # → http://127.0.0.1:8081
cd archetypes/C-chief-strategist     && PORT=8082 npm run dev   # → http://127.0.0.1:8082
cd archetypes/D-operations-officer   && PORT=8083 npm run dev   # → http://127.0.0.1:8083
cd archetypes/E-head-trader          && PORT=8084 npm run dev   # → http://127.0.0.1:8084
```

`npm run dev` uses `tsx watch` — edits to `SOUL.md`, `brain.ts`, `server.ts`, or `public/index.html` reload automatically (HTML in the browser reloads on refresh; backend restarts on save).

---

## 6 · Endpoints every archetype exposes

| Method | Path | Returns |
|---|---|---|
| `GET` | `/` | Operator console (the UI) |
| `POST` | `/invoke` | The archetype's contract endpoint — JSON in, JSON out |
| `ANY` | `/mcp` | MCP Streamable HTTP transport — exposes the archetype as a tool for MCP clients (Claude Desktop, Cursor, etc.) |
| `GET` | `/soul` | The SOUL.md as plaintext |
| `GET` | `/health` | Liveness probe — `{ok, archetype, role}` |
| `GET` | `/data?…` | Raw mock data for the operator console's charts (A: `?token=…`, C/D/E: `?pair=…`) |
| `GET` | `/faq` | Static FAQ entries (B only) |

The `/invoke` shape per archetype lives in `shared/contracts/src/`:

- **A** — input `{token, windowHours}`, output `{summary, sentiment, confidence, sources}`
- **B** — input `{userMessage, language, history?}`, output `{reply, intent, followUps}`
- **C** — input `{pair, horizon, riskTolerance}`, output `{recommendation, rationale, risks, horizon}`
- **D** — input `{pair, thresholds}`, output `{alerts, severity, evaluated}`
- **E** — input `{pair, portfolio}`, output `{signal, sizeUsd, reason, slippageTolerancePct}`

---

## 7 · Customize the agent

Edit, save, refresh:

- **`archetypes/<X>/SOUL.md`** — the persona. **This is where most of your time goes.** Change tone, add rules, sharpen the output shape.
- *(Advanced)* `archetypes/<X>/src/brain.ts` — orchestration: what data to fetch, how to assemble the user-message JSON.
- *(Rarely)* `shared/contracts/src/<role>.ts` — the I/O schema. If you change this, downstream consumers need to know.

`npm run dev` is `tsx watch` — backend restarts on file save, UI reloads on browser refresh.

---

## 8 · Calibrate all 5 archetypes at once

Compare persona outputs side-by-side:

```bash
npm run calibrate            # all 5
npm run calibrate -- A C E   # specific ones
```

Boots the mock server in-process, calls each archetype's `brain()` with its sample input, prints the output. Requires the LLM credential matching your `AGENT_RUNTIME`.

Sample run (D alone, since it's deterministic and runs in <10ms):

```bash
npm run calibrate -- D
```

For a full multi-archetype calibration capture (with prompts + responses for human review), see `docs/calibration-2026-05-30.md` — same shape, different timestamp.

---

## 9 · Container deploy *(optional)*

Each archetype ships a `Dockerfile` so you can deploy to Cloud Run, Fly, Fargate, or any container host. Build from the **repo root** (npm workspaces need the lockfile context):

```bash
docker build -t archetype-a -f archetypes/A-head-of-research/Dockerfile .
docker run --rm -p 8080:8080 --env-file .env archetype-a
```

The container exposes the same endpoints as `npm run dev` on port `8080`. For Cloud Run:

```bash
gcloud run deploy archetype-a \
  --source . \
  --port 8080 \
  --set-env-vars "$(grep -v '^#' .env | xargs | tr ' ' ',')"
```

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `node: .env: not found` when running `npm run dev` | You haven't created `.env` yet. Run `cp .env.example .env`. |
| `mock-twitter unreachable after 3 attempts` | Mock server isn't running, or `.env` `MOCK_*_URL` still points at `mock-*.foruai.io`. Start `npm run mocks:serve` and set the URLs to `http://127.0.0.1:5599`. |
| `CODEBUDDY_API_KEY not set` from `/invoke` | `AGENT_RUNTIME=codebuddy` in `.env` but key empty. Either set `CODEBUDDY_API_KEY` or switch to `AGENT_RUNTIME=openai`. |
| `400 model […] service info not found` from CodeBuddy | The model name in `CODEBUDDY_MODEL` isn't available on your edition. Use `default-model`, or check `codebuddy --help` for the supported list. |
| `EADDRINUSE :8080` | Another archetype (or A) is already on port 8080. Set `PORT=8081` (or other) before `npm run dev`. |
| Browser shows old UI after edits | Hard refresh — `Cmd+Shift+R` (macOS) or `Ctrl+Shift+R`. |
| `tsx watch` errors with "Cannot find module 'watch'" | You're on an old version of this scaffold where `--env-file` came before `watch` in the script. Pull the latest. |

For more, see `docs/troubleshooting.md`.

---

## What's next

- **Mock data catalog** — `mocks/README.md` (what tweets / news / prices / onchain look like, and how to enrich them via CSV)
- **Calibration report** — `docs/calibration-2026-05-30.md` (the prompts and responses captured from a real CodeBuddy run, for SOUL review)
- **CodeBuddy SDK reference** — `docs/codebuddy-docs/sdk.md`
- **Workshop architecture (TOR)** — `/Users/zexo/Downloads/TOR — ONE MAN TEAM WORKSHOP - Extended Version.md` (the full event spec)
