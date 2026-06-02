# Archetype D — Operations Officer

> **Problem (P4):** Operations monitoring — alerts, threshold events, ops dashboards.

| | |
|---|---|
| **The persona** | `SOUL.md` |
| **The runner** | `src/brain.ts` — **deterministic** (no LLM by default) |
| **Input** | `{ pair, thresholds: { pricePctChange, volumeMultiplier } }` |
| **Output** | `{ alerts[], severity, evaluated }` |
| **Data** | `prices` ([catalog](../../mocks/README.md)) |

This is the **easy-mode** archetype. The brain is deterministic — no LLM
call needed — so MVS is reliable even when the LLM key has issues. Good
pick if you're behind schedule.

## The boilerplate works out of the box

```bash
cd archetypes/D-operations-officer
PORT=8083 npm run dev    # operator console on http://127.0.0.1:8083
```

## To customize — edit `SOUL.md`

The SOUL is mostly documentation for D (the brain doesn't read it by
default). Edit it to describe richer alert behavior, then update
brain.ts to match.

## To customize — edit `src/brain.ts`

This is where most of D's customization happens.

### CodeBuddy recipes

**Recipe 1 — add a moving-average crossover alert:**
> In brain.ts, compute a 5-period and 20-period moving average over
> the candles. Emit an alert when the 5MA crosses above the 20MA
> (kind: "ma_cross_up") or below (kind: "ma_cross_down").

**Recipe 2 — use the LLM to write the alert message:**
> Load SOUL.md and the computed alerts into the LLM. Have the LLM
> rewrite each alert's `message` field in the Operations Officer's
> voice. Keep the deterministic detection logic.

**Recipe 3 — add a multi-pair sweep:**
> Change the input to accept `pairs: string[]` and evaluate each one.
> Roll up severity across all pairs.

## Deploy

Run locally with `npm run dev`, or containerize with the included
`Dockerfile`. D's brain is deterministic so it's the most reliable
archetype to demo. See [`docs/getting-started.md`](../../docs/getting-started.md)
for the full setup and Grid registration walkthrough.
