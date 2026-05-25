# Archetype C — Chief Strategist

> **Problem (P3):** Decision support — strategy, portfolio, risk.

| | |
|---|---|
| **Input** | `{ pair, horizon, riskTolerance }` |
| **Output** | `{ recommendation, rationale, risks[], horizon }` |
| **Primary mocks** | `mock-prices`, `mock-onchain` |

## Prompt recipe

```
Write the brain for the Chief Strategist. Use prices.getOhlcv(pair, 60) and
onchain.getLargeTransfers. Output recommendation (accumulate/hold/reduce/exit),
rationale, 1-5 risks, horizon. Match the OutputSchema in src/contract.ts.
```

## OpenClaw deploy

```
Wrap archetypes/C-chief-strategist/src/handler.ts as a FORU Grid agent for
archetype C, deploy it, and return the callable URL.
```
