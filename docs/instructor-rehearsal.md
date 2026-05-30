# Instructor Rehearsal Script

> You have two on-stage demos. Together they are 13 minutes of the 180-min
> workshop. They are the *highest-stakes* segments — if these land, the
> room believes the rest of the day will work.
>
> Rehearse each demo at least **5 full cycles** before workshop day.
> Time yourself. The goal is muscle memory, not improvisation.

---

## Pre-demo prep (T-30 min on workshop day)

Stage laptop, plugged in, hotspot on. Mic check.

Open in this order, in this many tabs:

| Window | What | Why |
|---|---|---|
| 1 | VS Code with `foru-grid-workshop-scaffold/` open | the demo target |
| 2 | VS Code panel: CodeBuddy chat | the demo tool |
| 3 | iTerm split — left: `npm run mocks:serve` running | mocks live |
| 4 | iTerm split — right: workspace root, ready to type | command target |
| 5 | Browser: the workshop slide deck | speaker notes |
| 6 | Telegram / Discord (OpenClaw chat) | second demo |
| 7 | Browser tab: blank notes page | for inevitable post-demo Q&A |

Run **once** before going on stage so the room sees green:

```bash
npm run mocks:check     # all 4 mocks ✓
npx foru choose A       # set archetype A as default
npx foru test           # MVS passes — proves the room state is good
```

Leave `.foru-config.json` in place so the demos start hot.

---

## Demo 1 — CodeBuddy Live Demo (14:15–14:23, 8 min)

> **Audience expectation:** they see CodeBuddy write working code in real
> time, fast, on a scaffold they have on their own laptops in 15 minutes.

### Opening line (0:00–0:15)

> "Everyone here is the founder of a one-person trading firm. Your AI
> employees do the work. Watch me hire the first one — the Head of
> Research — in five minutes."

### Beat 1 — Show the scaffold (0:15–1:00)

Open `archetypes/A-head-of-research/` in VS Code. Show two files:

- **`SOUL.md`** — *"This is the agent's soul. Persona, role, output shape.
  Most of your edits go here."*
- **`src/brain.ts`** — *"This is the boilerplate that wires the soul to
  the data. You almost never touch it."*

Say it once: **"We're not writing code today. We're shaping souls."**

### Beat 2 — Run it as-is (1:00–2:00)

Switch to the right terminal:

```bash
npx foru test
```

Show the JSON output streaming. Point out:
- Mocks responding (fast)
- LLM returning structured data
- "✓ Output matches the MVS contract"

> "Already a working agent. Out of the box. You could deploy this now.
> But it's generic — it's everyone's Head of Research. Let's make it yours."

### Beat 3 — Customize the SOUL with CodeBuddy (2:00–5:30)

Open `SOUL.md` in the editor. Open CodeBuddy chat panel.

Paste this prompt **verbatim** (have it on your clipboard before going on stage):

```
Open archetypes/A-head-of-research/SOUL.md and rewrite the "Who I am"
section so the agent is more contrarian — the analyst who calls out
narratives before they break, who is allergic to consensus. Keep the
JSON output shape exactly the same. Don't touch other sections.
```

Watch CodeBuddy edit the file in real time. **Narrate as it edits**:
- *"Watch the SOUL change. The output shape is unchanged."*
- *"This is what your participants will be doing for the next 50
  minutes."*

After CodeBuddy finishes, re-run the test:

```bash
npx foru test
```

Show the new summary — it should be measurably more contrarian in tone.

> **"Same code. Different soul. Different agent."**

### Beat 4 — Show CodeBuddy in the room (5:30–7:00)

Wave at the alternates briefly *(per current sponsor reality, CodeBuddy
is the primary)*:

> "CodeBuddy is the workshop's tools partner. It's what we just used.
> Same prompt patterns work in any tool, but for today we are 100% on
> CodeBuddy because that's what every recipe in the scaffold is tuned
> for. Install link is on the slide if you haven't already."

Show GitHub Codespaces fallback (one click, container loads):

> "No local setup? Open this repo in Codespaces. Same scaffold, same
> CodeBuddy, no install pain."

### Beat 5 — Handoff to the room (7:00–8:00)

> "Five archetypes. Five souls. You pick one. You spend the next 50
> minutes shaping it. Your facilitators are floating — F1 takes A and
> B, F2 takes C and D, F3 takes E. Slido is on the wall for questions.
> Go."

---

## Demo 2 — OpenClaw Walkthrough (15:25–15:30, 5 min)

> ⚠️ **Open issue:** OpenClaw's exact command surface is currently
> unknown to the instructor. Confirm with Natanael / FORU eng *before*
> the workshop. The script below assumes the workshop doc's literal
> natural-language interface works.

### Beat 1 — Show the handoff (0:00–1:00)

Bring up the right terminal. Have one archetype selected:

```bash
npx foru submit
```

Show the printed manifest:

```
Archetype:    A
Agent name:   demo-research
Description:  Live demo research agent
Brain:        archetypes/A-head-of-research/src/handler.ts
SOUL:         archetypes/A-head-of-research/SOUL.md
```

> "This is everything OpenClaw needs to know about your agent. The
> brain, the soul, the metadata. Now I send it."

### Beat 2 — Send to OpenClaw (1:00–3:00)

Switch to Telegram (or Discord). Open the OpenClaw chat.

Copy the message that `npx foru submit` printed:

```
Wrap archetypes/A-head-of-research/src/handler.ts as a FORU Grid agent
for archetype A, deploy it, and return the callable URL.
```

Paste, send. **Narrate the wait**:
- *"OpenClaw reads my message. It picks up the brain. It packages it
  for Grid. It deploys."*

Expected response (within 60s): a callable URL.

### Beat 3 — Hit the deployed agent (3:00–4:30)

Back to terminal. `curl` (or `httpie`) the callable URL with the sample input:

```bash
curl -X POST <callable-url> \
  -H "Content-Type: application/json" \
  -d '{"token":"ETH","windowHours":24}'
```

Show the same JSON shape from Demo 1, now served from Grid.

> "Same agent. Now it's a callable URL anyone in the world can hit.
> That's MVS — and that's exactly what you'll do in the next 45 minutes."

### Beat 4 — Handoff (4:30–5:00)

> "Each of you has 45 minutes to do this. Facilitators are at the
> tables. The submission form is on the wall. Let's go."

---

## Failure modes and on-stage fallbacks

You will have at least one demo go sideways. Plan for it.

### CodeBuddy is slow / stalls

Don't wait awkwardly. Say:

> "CodeBuddy is thinking — this is the same wait you'll have at your
> table. Use it to plan which archetype you want."

If it stalls > 30 seconds, abort and paste a **pre-prepared SOUL.md**
you saved before the workshop. Have it in `~/Desktop/demo-soul-A.md`.
Open it in VS Code, save it over the real `SOUL.md`, re-run `npx foru test`.

### Mocks unreachable mid-demo

Run `npm run mocks:check`. If anything is red:

```bash
pkill -f mock-server  # in case of stale
npm run mocks:serve   # restart
```

Update `.env` to point at the local mock if not already.

### LLM rate-limited (429)

The brain auto-falls-back. Output may be less impressive but still
contract-valid. Say:

> "And there's the rate-limit. The fallback path just kicked in —
> the agent still ships, the output still matches the contract. That's
> Appendix G of your scaffold."

### OpenClaw doesn't respond

This is the highest-risk failure mode because OpenClaw is the unknown.
Plan B: skip the live deploy, show a **pre-deployed callable URL** you
got before the workshop. Frame it:

> "OpenClaw is doing the wrap-and-deploy for every team in parallel —
> let me show you a one I prepared earlier, then we move."

`curl` the pre-deployed URL. Same outcome, audience never knows.

**Plan C (if OpenClaw is truly broken):** announce that FORU eng will
manually deploy each unit. Each team hands `archetypes/X/...` to a
facilitator. The MVS check is the locally-validated brain output.

### LLM returns invalid JSON

Re-run. Mention:

> "Real-world LLM behavior — sometimes the first response is malformed.
> The retry logic in your scaffold handles this; we just saw it live."

---

## Rehearsal checklist (do these 5x before workshop day)

- [ ] **Cycle 1 — solo, untimed.** Walk through Demo 1 alone. Note every place you stumble.
- [ ] **Cycle 2 — solo, timed.** Run Demo 1 with a stopwatch. Target: 7:30 (30s buffer).
- [ ] **Cycle 3 — with an audience of one.** Run Demo 1 in front of a colleague. Have them interrupt you twice.
- [ ] **Cycle 4 — both demos back-to-back.** Demo 1 → ~70 min gap simulated by other work → Demo 2. Don't reset state in between.
- [ ] **Cycle 5 — full failure drill.** Run Demo 1 with the LLM key wrong. Run Demo 2 with OpenClaw offline. Recover from both without dropping the room.
- [ ] **Have all 4 fallback artifacts ready on disk before workshop day:**
  - [ ] `~/Desktop/demo-soul-A.md` — pre-customized SOUL for the contrarian variant
  - [ ] `~/Desktop/demo-callable-url.txt` — a pre-deployed Grid agent URL (and a curl one-liner)
  - [ ] `~/Desktop/demo-output.json` — a screenshot or recording of a working test output
  - [ ] `~/Desktop/demo-script.txt` — the verbatim prompts you'll paste, so you don't fumble Cmd+V

## What you actually rehearse

Not the slides. Not the talking points. The two things that win the room:

1. **The CodeBuddy prompt landing on the first try and visibly editing the file.**
   Rehearse the prompt wording until it works *every* time.
2. **The deployed agent responding to curl in under 60 seconds.**
   Rehearse the OpenClaw message until you trust it.

If those two beats work, the workshop works. The rest is filler.
