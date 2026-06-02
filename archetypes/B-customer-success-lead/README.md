# Archetype B — Customer Success Lead

> **Problem (P2):** Trader experience — onboarding, education, conversational support.

| | |
|---|---|
| **The persona** | `SOUL.md` — edit this to change the agent |
| **The runner** | `src/brain.ts` |
| **Input** | `{ userMessage, language: "en" \| "id" }` |
| **Output** | `{ reply, intent, followUps[] }` |
| **Data** | static FAQ (`src/faq.ts`) — **no market mocks** |

## The boilerplate works out of the box

```bash
cd archetypes/B-customer-success-lead
PORT=8081 npm run dev    # operator console on http://127.0.0.1:8081
```

## To customize — edit `SOUL.md`

### CodeBuddy recipes

**Recipe 1 — make the agent more empathetic:**
> Strengthen the "tone" section: when the user message contains "stuck",
> "lost", "frozen", "kena", "tidak bisa" — lead the reply with one
> sentence of empathy before the answer.

**Recipe 2 — add a new intent:**
> Add a new intent value: "security" — for questions about 2FA, phishing,
> wallet safety. Update both the JSON shape and what I do section.

**Recipe 3 — open up to live data:**
> Add a section: if the user asks about a token's recent price, you may
> call the `prices` endpoint (see ../../mocks/README.md) and quote the
> latest close.

## To customize — edit `src/faq.ts`

Add or rewrite FAQ entries. The brain passes them to the LLM as context.

## Deploy

Run locally with `npm run dev`, or containerize with the included
`Dockerfile`. See [`docs/getting-started.md`](../../docs/getting-started.md)
for the full setup and Grid registration walkthrough.
