# Archetype A — Head of Research

> **Problem (P1):** Pre-trade intelligence — market research, sentiment, news, on-chain.

| | |
|---|---|
| **The persona** | `SOUL.md` — edit this to change the agent |
| **The runner** | `src/brain.ts` — already works, edit only if you change orchestration |
| **Input** | `{ token, windowHours }` |
| **Output** | `{ summary, sentiment, confidence, sources[] }` |
| **Data** | `twitter`, `news`, `onchain` ([catalog](../../mocks/README.md)) |

## The boilerplate works out of the box

```bash
npx foru choose A    # pick this archetype
npx foru test        # runs the brain, validates the output
npx foru submit      # tests, then hands off to OpenClaw
```

No edits required. The agent will already produce a valid research brief.

## To customize — edit `SOUL.md`

90% of customization happens here. Change the voice, the output shape,
the tone, what the agent refuses to do. The LLM reads it as the system
prompt.

### CodeBuddy recipes

Open `SOUL.md` in your editor with CodeBuddy active. Try any of these:

**Recipe 1 — make it more contrarian:**
> Rewrite the "Who I am" section to be more contrarian — the analyst
> who calls out narratives before they break. Keep the JSON shape
> unchanged.

**Recipe 2 — add a Bahasa Indonesia mode:**
> Add a section to SOUL.md that says: if the input includes
> `language: "id"`, write the summary in Bahasa Indonesia. Keep all
> field names in English.

**Recipe 3 — add a risk field:**
> Add a new "topRisk" field to the output shape (string, one short
> sentence describing the biggest near-term risk). Update both the
> JSON example and "what I do" section.

## To customize — edit `src/brain.ts`

Only when you want to change *what data the agent sees*, e.g. fetch from a
new source, change record counts, add retry logic.

### CodeBuddy recipes

**Recipe 4 — pull more headlines, fewer tweets:**
> In brain.ts, change the data slice so the LLM sees 4 tweets and 16
> headlines instead of 12 and 8.

**Recipe 5 — add a second LLM pass:**
> Add a retry step: if the first chatJson call returns a summary with
> `confidence > 0.9`, re-prompt the LLM with "are you sure?" and use
> the second response.

## OpenClaw deploy recipe

When you run `npx foru submit`, it prints the exact message to send to
your OpenClaw chat. Paste it into Telegram or Discord. OpenClaw wraps
the brain + SOUL as a Grid agent and returns a callable URL.

## When LLM is unavailable

`src/fallback.ts` ships a template-based path that satisfies the
contract without any LLM call. The brain auto-falls-back on
`RateLimitError`. No action needed from you.
