# Archetype E — Head Trader

> **Problem (P5):** Execution — BUY/HOLD/SELL signal, orders, slippage, MEV, routing.

| | |
|---|---|
| **Input** | `{ pair, portfolio: { baseFreeUsd, positionUsd } }` |
| **Output** | `{ signal, sizeUsd, reason, slippageTolerancePct }` |
| **Primary mocks** | `mock-prices`, `mock-onchain` |

## Prompt recipe

```
Write the brain for the Head Trader. Fetch 60 1m candles + recent large
transfers. Emit BUY/HOLD/SELL with sizeUsd ≤ portfolio.baseFreeUsd and a
slippage tolerance between 0 and 5%. Justify in 1-3 sentences. Match the
OutputSchema in src/contract.ts.
```

## OpenClaw deploy

```
Wrap archetypes/E-head-trader/src/handler.ts as a FORU Grid agent for
archetype E, deploy it, and return the callable URL.
```
