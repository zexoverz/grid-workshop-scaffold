# Archetype D — Operations Officer

> **Problem (P4):** Operations monitoring — alerts, threshold events, ops dashboards.

| | |
|---|---|
| **Input** | `{ pair, thresholds: { pricePctChange, volumeMultiplier } }` |
| **Output** | `{ alerts[], severity, evaluated: { pair, samples } }` |
| **Primary mocks** | `mock-prices` |

This archetype is **mostly deterministic** — the LLM is optional. It's the
easiest one to land MVS on if you're behind schedule.

## Prompt recipe

```
Write the brain for the Operations Officer. Fetch 60 1m candles for the pair.
Emit a price_spike or drawdown alert when net % change exceeds the threshold,
and a volume_spike alert when the latest candle's volume is N× the average.
Roll up severity to the highest alert. Match the OutputSchema in src/contract.ts.
```

## OpenClaw deploy

```
Wrap archetypes/D-operations-officer/src/handler.ts as a FORU Grid agent for
archetype D, deploy it, and return the callable URL.
```
