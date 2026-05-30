# Archetype C — Chief Strategist

> **Problem (P3):** Decision support — strategy, portfolio, risk.

| | |
|---|---|
| **The persona** | `SOUL.md` |
| **The runner** | `src/brain.ts` |
| **Input** | `{ pair, horizon, riskTolerance }` |
| **Output** | `{ recommendation, rationale, risks[], horizon }` |
| **Data** | `prices`, `onchain` ([catalog](../../mocks/README.md)) |

## The boilerplate works out of the box

```bash
npx foru choose C
npx foru test
npx foru submit
```

## To customize — edit `SOUL.md`

### CodeBuddy recipes

**Recipe 1 — change the recommendation set:**
> Rewrite the recommendation enum from "accumulate | hold | reduce | exit"
> to "long | neutral | short | flat". Update the JSON example and rules
> in SOUL.md.

**Recipe 2 — add macro context:**
> Add a section: "I also consider macro context — when the input includes
> a `macroNote` field, I weight it in the rationale." Then I'll update
> brain.ts to pass it through.

**Recipe 3 — add a confidence field:**
> Add a `confidence` (0..1) field to the output shape, alongside
> recommendation. Honest, low when signals conflict.

## To customize — edit `src/brain.ts`

Only when you want to change which data the LLM sees.

**Recipe 4 — give it a longer window:**
> In brain.ts, change the candle window from 60 to 240 (4 hours of 1m
> candles). Slice the most recent 60 for the LLM.

## OpenClaw deploy recipe

`npx foru submit` prints the exact message.
