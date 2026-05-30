# FORU Grid Workshop Scaffold

> Real World AI Agent Hackathon — Pre-Event Workshop
> *The Solopreneur Stack — Building a One-Person Company with AI Agents.*

You are the founder of a Web3 trading firm. Headcount: one. Today, you hire your first AI employees.

## The mental model

Each archetype is an **AI employee**. Each comes with a **SOUL.md** — the
persona that defines who the agent is, how it talks, and what it returns.

```
  PICK an archetype     →    EDIT its SOUL.md      →    SHIP
  npx foru choose            (with CodeBuddy)            npx foru submit
```

The boilerplate already works. You can submit out of the box. To make the
agent *yours*, edit the SOUL.

## The 5 AI Employees

| | Role | Problem | Edit this |
|---|---|---|---|
| **A** | Head of Research | P1 Pre-trade intelligence | `archetypes/A-head-of-research/SOUL.md` |
| **B** | Customer Success Lead | P2 Trader experience | `archetypes/B-customer-success-lead/SOUL.md` |
| **C** | Chief Strategist | P3 Decision support | `archetypes/C-chief-strategist/SOUL.md` |
| **D** | Operations Officer | P4 Operations monitoring | `archetypes/D-operations-officer/SOUL.md` |
| **E** | Head Trader | P5 Execution | `archetypes/E-head-trader/SOUL.md` |

Each archetype folder has the same shape:

```
archetypes/A-head-of-research/
├── SOUL.md         ← edit me — the persona drives everything
├── src/
│   ├── brain.ts    boilerplate orchestration (rarely needs edits)
│   ├── contract.ts loose I/O schema
│   ├── handler.ts  locked Grid-side wiring
│   └── fallback.ts no-LLM template path
└── README.md       CodeBuddy recipes for editing the SOUL
```

## Quickstart

```bash
# Prereqs: Node 20 LTS, Git, a chat app for OpenClaw

npm install
cp .env.example .env
# fill in LLM_API_KEY (issued on workshop day)

npx foru mocks       # health-check the data sources
npx foru choose      # pick A, B, C, D, or E
# ... open the archetype's SOUL.md, vibecode with CodeBuddy ...
npx foru test        # validate output
npx foru submit      # hand off to OpenClaw / facilitator
```

## The data your agents can use

See [`mocks/README.md`](./mocks/README.md) — one catalog page listing every
endpoint. Four sources (twitter, news, prices, onchain). Any archetype's
agent can call any of them.

## CodeBuddy is the primary prompting tool

Each archetype's README has CodeBuddy-shaped recipes you can paste in.

```bash
# Open the archetype folder in your editor with CodeBuddy active,
# then paste a recipe and let it edit the SOUL.md (or brain.ts) for you.
```

## Minimum Viable Submission

A unit completes the workshop when their agent:

1. Is deployed on Grid with a callable URL (via OpenClaw)
2. Accepts the archetype's defined input
3. Returns a structured output with the expected field names
4. Has a one-line description in the submission form

`npx foru test` covers 2 and 3 locally. `npx foru submit` does the rest.

## Local mocks (for offline development)

You can run the full stack without touching `mock-*.foruai.io`:

```bash
npm run mocks:serve    # local HTTP mock on port 5599
# then in .env:
#   MOCK_TWITTER_URL=http://127.0.0.1:5599
#   MOCK_NEWS_URL=http://127.0.0.1:5599
#   MOCK_PRICES_URL=http://127.0.0.1:5599
#   MOCK_ONCHAIN_URL=http://127.0.0.1:5599
#   LLM_BASE_URL=http://127.0.0.1:5599
#   LLM_API_KEY=anything-nonempty
```

## Full scaffold self-test

```bash
npm run test:all       # runs every archetype × happy + fallback phases
```

Use this in CI or T-1 readiness checks.

## Cloud fallback

No local setup? Open this repo in GitHub Codespaces — the dev container has
Node, deps, and tools pre-installed.

## When things break

- **Mocks unreachable:** see `docs/troubleshooting.md`
- **LLM rate-limited:** every brain auto-falls back to `fallback.ts`
- **Stuck on the SOUL:** copy a CodeBuddy recipe from your archetype README
- **Facilitator help:** F1 owns A+B, F2 owns C+D, F3 owns E

## Workshop partners

- **FORU AI** — workshop owner, Grid platform
- **Tencent CodeBuddy** — the prompting tool
- **OpenClaw** — agent wrap + deploy layer
- **ICEX / Indodax** — domain expert
- **Mancer** — Pitch Crash Course
