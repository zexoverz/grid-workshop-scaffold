# FORU Grid Workshop Scaffold

> Real World AI Agent Hackathon — Pre-Event Workshop
> *The Solopreneur Stack — Building a One-Person Company with AI Agents.*

You are the founder of a Web3 trading firm. Headcount: one. Today, you hire your first AI employees.

## The 3-step flow

```
  1. CHOOSE     →     2. BUILD     →     3. SUBMIT
   pick an           write the         deploy to Grid,
   archetype         brain.ts          collect callable URL
```

```bash
npx foru choose          # pick A | B | C | D | E
# ...edit archetypes/<your-pick>/src/brain.ts...
npx foru test            # validate brain output against the MVS contract
npx foru submit          # wrap with OpenClaw + deploy to FORU Grid
```

## The 5 archetypes — your AI workforce

| | Role | Problem | Primary mocks |
|---|---|---|---|
| **A** | Head of Research | P1 Pre-trade intelligence | twitter + news + on-chain |
| **B** | Customer Success Lead | P2 Trader experience | *(LLM + FAQ context)* |
| **C** | Chief Strategist | P3 Decision support | prices + on-chain |
| **D** | Operations Officer | P4 Operations monitoring | prices |
| **E** | Head Trader | P5 Execution | prices + on-chain |

Each archetype folder is self-contained:

```
archetypes/A-head-of-research/
├── src/
│   ├── brain.ts        ← YOU WRITE THIS (~20-60 lines)
│   ├── contract.ts     locked — defines MVS input/output
│   ├── handler.ts      locked — wires brain → Grid handler
│   └── fallback.ts     no-LLM template path
├── test/mvs.test.ts    runs your brain against the contract
└── README.md           prompt recipes + OpenClaw deploy recipe
```

## Setup

```bash
# 0. Prereqs: Node 20 LTS, Git, a chat app for OpenClaw (Telegram or Discord)
npm install
cp .env.example .env
# fill in LLM_API_KEY (issued to you on workshop day) and GRID_TOKEN

# 1. Verify mocks reachable
npx foru mocks

# 2. Pick your archetype
npx foru choose

# 3. Open the brain stub for your archetype, write code

# 4. Validate
npx foru test

# 5. Ship it
npx foru submit
```

## Minimum Viable Submission

A unit completes the workshop when their agent:

1. Is deployed on Grid with a callable URL
2. Accepts the archetype's defined input (from a mock test endpoint)
3. Returns a structured output matching the archetype's contract
4. Has a one-line description in the submission form

`npx foru test` checks 2 and 3 locally. `npx foru submit` does 1.

## Cloud fallback

No local setup? Open this repo in GitHub Codespaces — the dev container has Node, deps, and tools pre-installed.

## Local mocks (for offline development)

You can run the full stack without touching `mock-*.foruai.io`:

```bash
npm run mocks:serve    # local HTTP mock on port 5599 (4 endpoints + fake LLM)
# then in another terminal, point .env at it:
#   MOCK_TWITTER_URL=http://127.0.0.1:5599
#   MOCK_NEWS_URL=http://127.0.0.1:5599
#   MOCK_PRICES_URL=http://127.0.0.1:5599
#   MOCK_ONCHAIN_URL=http://127.0.0.1:5599
#   LLM_BASE_URL=http://127.0.0.1:5599
#   LLM_API_KEY=anything-nonempty
npm run mocks:check
npm run test
```

## Full scaffold self-test

```bash
npm run test:all       # runs every archetype through happy + fallback phases
```

Use this in CI or T-1 readiness checks. Spins up an in-process mock, runs
A–E against both `LLM available` and `LLM rate-limited` paths, fails if any
contract breaks.

## When things break

- **Mocks unreachable:** see `docs/troubleshooting.md` — each archetype has a no-LLM `fallback.ts` template path.
- **LLM rate-limited (30 calls/key):** same fallback path.
- **Stuck on the brain:** copy a prompt recipe from your archetype's README into CodeBuddy / Claude / Codex / Cursor.
- **Facilitator help:** F1 owns A+B, F2 owns C+D, F3 owns E.

## Workshop partners

- **FORU AI** — workshop owner, Grid platform
- **Tencent CodeBuddy** — primary prompting tool (alternates: ClaudeCode, Codex, Cursor)
- **OpenClaw** — agent wrap + deploy layer
- **ICEX / Indodax** — domain expert
- **Mancer** — Pitch Crash Course
