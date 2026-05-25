# Open questions — needed before scaffold is workshop-ready

These are the questions to surface to FORU eng / spec owner before
the scaffold is locked. Tracked here so they don't get lost.

## Critical (blocks coding)

- [ ] **Contracts (5 archetypes):** confirm input + output JSON shapes match
  what the spec owner wants. Currently inferred from the doc + my own
  judgment. Lives in `shared/contracts/src/*.ts`.
- [ ] **Archetype B:** does Customer Success consume any mock endpoint,
  or is it pure LLM + static FAQ? Currently scaffolded as LLM + FAQ.
- [ ] **Mock endpoint schemas:** the 4 endpoints (`mock-twitter`,
  `mock-news`, `mock-prices`, `mock-onchain`) — the response shapes in
  `shared/mock-clients/src/*.ts` are inferred. Need real JSON examples.

## Blocks deploy path

- [ ] **Grid deploy API:** the body of `shared/grid/src/index.ts::deploy()`
  is a placeholder. Confirm endpoint URL, auth model, request schema.
- [ ] **OpenClaw natural-language command surface:** is the deploy message
  literal NL or does it need structure? Currently scaffolded as the literal
  message from the workshop doc.
- [ ] **Auth model:** one shared LLM key per team is documented, but how
  is `GRID_TOKEN` issued? Per-team, per-deploy, per-OpenClaw?

## Blocks tooling decisions

- [ ] **Language lock-in:** scaffolded in TypeScript. Python parity needed?
  ~40% of target audience is AI/ML which skews Python.
- [ ] **LLM model:** scaffolded with `gpt-4o-mini` default. Are participants
  pointed at a different model / proxy?
- [ ] **Rate-limit semantics:** 30 calls per-day, per-hour, or per-session?
  Currently tracked as per-process which resets each `tsx` invocation.

## Nice-to-have

- [ ] **Test harness FE:** lightweight static page to ping deployed agents
  and visually confirm contract. Skipped in v1.
- [ ] **CI workflow:** `.github/workflows/validate-contracts.yml` — should
  validate every brain stub still satisfies its contract on PR.
