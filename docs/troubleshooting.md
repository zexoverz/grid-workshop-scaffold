# Troubleshooting

## The 3-flow mental model

```
  CHOOSE         BUILD           SUBMIT
  ──────         ─────           ──────
  npx foru       edit            npx foru
  choose         brain.ts        submit
                  ↓
                 npx foru test
```

Everything else exists to support those three steps.

---

## Mocks unreachable

```bash
npx foru mocks
```

If any endpoint is red:

1. Check `.env` — did you copy `.env.example`?
2. Are you on workshop Wi-Fi? Some mocks are deploy-pinned to that range.
3. Ask a facilitator. F1 owns A+B, F2 owns C+D, F3 owns E.
4. Last resort: every archetype ships a `fallback.ts` that satisfies the
   contract without any mock data. Comment out the mock calls in `brain.ts`
   and route to `fallback(input)` directly.

## LLM rate-limit hit (30 calls)

`brain.ts` already catches `RateLimitError` and calls `fallback(input)`.
No action needed. The fallback satisfies the contract and counts as MVS.

## `npx foru test` fails on contract

The output JSON does not match `src/contract.ts`. Common causes:

- A required field is missing → check the Zod error path
- A string is too short / too long → schemas have min/max bounds
- `sentiment` / `recommendation` / `signal` is an unexpected enum value

Read the error path under each `· ` bullet — that tells you the exact field.

## `npx foru submit` says GRID_TOKEN not set

For workshop day, you typically submit via OpenClaw, not the direct Grid SDK.
Copy the recipe from your archetype README into your OpenClaw chat — it
returns a callable URL you paste into the submission form.

The direct `deploy()` path is for solo testing post-workshop. Leave
`GRID_TOKEN` blank during the workshop unless a facilitator tells you
otherwise.

## Stuck on the brain

Each archetype's README has prompt recipes. Paste one into:
- **Tencent CodeBuddy** (primary, sponsored)
- ClaudeCode, Codex, or Cursor

If 3+ teams hit the same bug, expect a room-wide fix from the lead engineer.

---

## Grid deploy spec (open)

The `shared/grid` SDK has a TODO at the HTTP boundary because the Grid
deploy API spec isn't finalized at the time of this scaffold. Once FORU eng
publishes the spec, replace the body of `deploy()` in
`shared/grid/src/index.ts` and remove this section.
