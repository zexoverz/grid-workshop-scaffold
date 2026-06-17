# CODEBUDDY.md — Project context for CodeBuddy IDE

> Workshop scaffold for the **Real World AI Agent Hackathon**. Five AI-employee archetypes (A–E), each one a standalone Node service. Edits to the archetype "persona" happen in `SOUL.md`; orchestration lives in `src/brain.ts`. CodeBuddy is the primary editor for this workshop.

---

## What this repo is

A monorepo (npm workspaces) that ships **5 archetype agents**, shared packages, mock data, a deploy CLI, and operator-console UIs. Each archetype is a Node HTTP service that exposes `/`, `/invoke`, `/mcp`, `/soul`, `/data`, `/health`.

The boilerplate already works. The workshop participant's job is to:

1. Pick **one** archetype folder under `archetypes/`.
2. Edit its `SOUL.md` to shape the persona / output style.
3. (Optional) Edit `src/brain.ts` to change *what data* the LLM sees.
4. Run `npm run dev` from inside the archetype folder.
5. Deploy + register on the FORU Grid.

---

## Top-level map (read these dirs before editing any archetype)

```
foru-grid-workshop-scaffold/
├── archetypes/             5 standalone agent services (A–E) — edit here
│   ├── A-head-of-research/
│   ├── B-customer-success-lead/
│   ├── C-chief-strategist/
│   ├── D-operations-officer/
│   └── E-head-trader/
├── shared/                 npm workspaces consumed by every archetype
│   ├── contracts/          zod input/output schemas (one file per archetype)
│   ├── llm/                OpenAI + CodeBuddy SDK wrappers + loadSoul()
│   ├── mock-clients/       typed clients for the 4 mock data sources
│   └── grid/               Grid registration helpers
├── mocks/                  CSV-backed mock data + catalog README
├── scripts/                mock-server, calibrate, deploy/
├── docs/                   getting-started, live-deployment, calibration
├── .env.example            runtime env template
├── package.json            workspace root
└── CODEBUDDY.md            (this file)
```

---

## When editing an archetype, ALWAYS open these files together

Every archetype folder has the same shape. To make a change safely, CodeBuddy must consult **all** of these files, not just the one being edited:

| File | What it is | When edits go here |
|---|---|---|
| `SOUL.md` | The system prompt the LLM sees | 90% of customization — persona, tone, output shape |
| `src/brain.ts` | Orchestration: fetch mocks → call LLM → return | Only when changing *what data* the agent sees |
| `src/contract.ts` | Re-exports the I/O schema from `shared/contracts` | Almost never — schema lives in `shared/contracts/src/<role>.ts` |
| `src/handler.ts` | Locked wiring: routes `/invoke` into the brain | Do not edit |
| `src/server.ts` | node:http server (`/`, `/invoke`, `/mcp`, `/soul`, `/data`, `/health`) | Only for new routes or static endpoints |
| `src/mcp.ts` | MCP tool definition (Streamable HTTP transport) | Only when changing the MCP tool signature |
| `src/fallback.ts` | No-LLM template path used on rate-limit | When you want a richer fallback |
| `public/index.html` | Operator console UI (vanilla HTML/SVG, no build step) | Visual/UX changes |
| `Dockerfile` | Single-process container | Deployment / runtime concerns |
| `package.json` | Per-archetype `dev` / `start` scripts | Adding deps for *this* archetype |
| `README.md` | CodeBuddy prompt recipes for this archetype | Workshop content |
| `../../shared/contracts/src/<role>.ts` | The actual zod schema | When the I/O contract genuinely changes |

**Rule for CodeBuddy:** before suggesting changes to `SOUL.md` or `brain.ts`, also read `shared/contracts/src/<role>.ts`. The output schema is the source of truth — `SOUL.md`'s JSON shape must match it.

---

## Runtimes and environment

- **Node 20+** (uses `--env-file` and native fetch).
- **`AGENT_RUNTIME=openai`** (default) — `chatJson()` calls OpenAI-compatible APIs via `LLM_*` vars.
- **`AGENT_RUNTIME=codebuddy`** — `codeBuddyChatJson()` spawns the Tencent CodeBuddy CLI bundled inside `node_modules/@tencent-ai/agent-sdk/cli/bin/`.
- **Archetype D** is deterministic — no LLM needed.
- **Mock data** is served from a single Node process at `http://127.0.0.1:5599` via `npm run mocks:serve` (CSV-backed).

---

## Docs to load on demand

- `docs/getting-started.md` — full local setup, calibration, troubleshooting.
- `docs/live-deployment.md` — public GCP VM (A–E on ports 8080–8084).
- `docs/codebuddy-docs/sdk.md` — CodeBuddy Agent SDK reference (used when `AGENT_RUNTIME=codebuddy`).
- `mocks/README.md` — endpoint catalog for `twitter`, `news`, `prices`, `onchain`.

---

## Workshop-day constraints worth remembering

- A **30-call LLM cap per session** lives in `shared/llm/src/index.ts`. Brains auto-fall-back to `fallback.ts` on `RateLimitError`.
- Every archetype output is **strict JSON** — no markdown fences, no prose wrappers. The zod schema in `shared/contracts/src/<role>.ts` enforces this.
- All five archetypes ship a `public/index.html` operator console with no build step (vanilla HTML + inline SVG charts). Do not introduce a bundler.
- Default port is `8080`; override per-archetype with `PORT=808X`.
