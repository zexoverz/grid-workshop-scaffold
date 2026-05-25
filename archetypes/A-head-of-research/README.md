# Archetype A — Head of Research

> **Problem (P1):** Pre-trade intelligence — market research, sentiment, news, on-chain.
> **Your job:** turn last-24h tweets + headlines + on-chain signals into a structured brief.

## The contract

| | |
|---|---|
| **Input** | `{ token: "ETH" \| "BTC" \| "SOL", windowHours: number }` |
| **Output** | `{ summary, sentiment, confidence, sources[] }` |
| **Primary mocks** | `mock-twitter`, `mock-news`, `mock-onchain` |

Locked schemas live in `@foru-workshop/contracts/research`.

## Prompt recipes (paste into CodeBuddy / Claude / Codex / Cursor)

**Recipe 1 — minimal:**
```
Write the brain for the Head of Research agent using the archetype A scaffold.
Pull from mock-twitter and mock-news. Return summary, sentiment, confidence,
sources. Match the OutputSchema in src/contract.ts.
```

**Recipe 2 — with on-chain:**
```
Extend my brain to also call onchain.getLargeTransfers and weight sentiment by
the dollar volume of recent large transfers. Keep output under 800 chars.
```

**Recipe 3 — stretch:**
```
Add a retry-with-tighter-temperature step if the first LLM call fails to
satisfy the output schema. Keep total LLM calls ≤ 2.
```

## OpenClaw deploy recipe (Telegram or Discord)

Send this single message to your OpenClaw bot:

```
Wrap archetypes/A-head-of-research/src/handler.ts as a FORU Grid agent for
archetype A, deploy it, and return the callable URL.
```

## Local check

```bash
npx foru test         # runs handler against RESEARCH_SAMPLE_INPUT
npx foru submit       # test, then deploy to Grid
```

## When LLM is unavailable

`src/fallback.ts` ships a template-based path that satisfies the contract
without any LLM call. The brain auto-falls-back when `RateLimitError` fires.
