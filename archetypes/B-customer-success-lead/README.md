# Archetype B — Customer Success Lead

> **Problem (P2):** Trader experience — onboarding, education, conversational support.

| | |
|---|---|
| **Input** | `{ userMessage, userId?, language: "en" \| "id" }` |
| **Output** | `{ reply, intent, followUps[] }` |
| **Primary data** | static FAQ (`src/faq.ts`) + LLM — **no market mocks** |

## Prompt recipes

```
Write the brain for the Customer Success Lead. Use the FAQ in src/faq.ts as
context. Detect intent (onboarding, education, troubleshooting, fees, kyc,
other). Reply in the requested language. Suggest up to 3 follow-up questions.
```

## OpenClaw deploy

```
Wrap archetypes/B-customer-success-lead/src/handler.ts as a FORU Grid agent
for archetype B, deploy it, and return the callable URL.
```
