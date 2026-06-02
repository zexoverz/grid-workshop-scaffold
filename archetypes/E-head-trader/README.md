# Archetype E — Head Trader

> **Problem (P5):** Execution — BUY/HOLD/SELL signal, orders, slippage, MEV, routing.

| | |
|---|---|
| **The persona** | `SOUL.md` |
| **The runner** | `src/brain.ts` |
| **Input** | `{ pair, portfolio: { baseFreeUsd, positionUsd } }` |
| **Output** | `{ signal, sizeUsd, reason, slippageTolerancePct }` |
| **Data** | `prices`, `onchain` ([catalog](../../mocks/README.md)) |

## The boilerplate works out of the box

```bash
cd archetypes/E-head-trader
PORT=8084 npm run dev    # operator console on http://127.0.0.1:8084
```

## To customize — edit `SOUL.md`

### CodeBuddy recipes

**Recipe 1 — add a hard risk cap:**
> Add a rule to SOUL.md: I never risk more than 5% of `baseFreeUsd` in a
> single trade. If the model wants to size larger, clamp it.

**Recipe 2 — bias toward HOLD in uncertainty:**
> Strengthen the "what I will not do" section: when the price action
> shows no clear trend (range less than 0.5%), I always output HOLD with
> sizeUsd: 0.

**Recipe 3 — change the signal vocabulary:**
> Rewrite the signal enum from "BUY | HOLD | SELL" to "LONG | FLAT | SHORT".
> Update the rules and JSON example.

## To customize — edit `src/brain.ts`

**Recipe 4 — pull in research from Archetype A:**
> Modify brain.ts to also call mock-news / mock-twitter so the trader
> sees the same signals the Head of Research would.

## Deploy

Run locally with `npm run dev`, or containerize with the included
`Dockerfile`. See [`docs/getting-started.md`](../../docs/getting-started.md)
for the full setup and Grid registration walkthrough.
