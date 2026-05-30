// Calibration harness — runs each archetype's brain end-to-end against
// the local mock data server and prints the output for human review.
//
// Useful when tuning SOUL.md files: change the persona, re-run this, compare.
//
//   AGENT_RUNTIME=codebuddy CODEBUDDY_API_KEY=ck_... npx tsx scripts/calibrate.ts
//   AGENT_RUNTIME=openai    LLM_API_KEY=sk_...      npx tsx scripts/calibrate.ts
//   npx tsx scripts/calibrate.ts A C                   # just specific ones

import { startMockServer } from "./mock-server.js";

import { brain as brainA } from "../archetypes/A-head-of-research/src/brain.js";
import { brain as brainB } from "../archetypes/B-customer-success-lead/src/brain.js";
import { brain as brainC } from "../archetypes/C-chief-strategist/src/brain.js";
import { brain as brainD } from "../archetypes/D-operations-officer/src/brain.js";
import { brain as brainE } from "../archetypes/E-head-trader/src/brain.js";

import { CONTRACTS } from "@foru-workshop/contracts";

type Code = "A" | "B" | "C" | "D" | "E";

const BRAINS: Record<Code, (input: any) => Promise<unknown>> = {
  A: brainA,
  B: brainB,
  C: brainC,
  D: brainD,
  E: brainE,
};

const ROLES: Record<Code, string> = {
  A: "Head of Research",
  B: "Customer Success Lead",
  C: "Chief Strategist",
  D: "Operations Officer",
  E: "Head Trader",
};

const ASCII_RULE = "─".repeat(72);

function pickArchetypes(): Code[] {
  const args = process.argv.slice(2).map((a) => a.toUpperCase());
  const all: Code[] = ["A", "B", "C", "D", "E"];
  const picked = args.filter((a): a is Code => all.includes(a as Code));
  return picked.length > 0 ? picked : all;
}

function fmtJson(v: unknown): string {
  return JSON.stringify(v, null, 2);
}

async function calibrate(code: Code): Promise<void> {
  const role = ROLES[code];
  const sample = CONTRACTS[code].sample;
  console.log(`\n${ASCII_RULE}\n  ${code} · ${role}\n${ASCII_RULE}`);
  console.log("input:");
  console.log(fmtJson(sample));
  console.log("\nrunning brain…");
  const started = Date.now();
  try {
    const out = await BRAINS[code](sample);
    const ms = Date.now() - started;
    console.log(`output (${ms}ms):`);
    console.log(fmtJson(out));
  } catch (err) {
    const ms = Date.now() - started;
    console.log(`ERROR (${ms}ms):`);
    console.log(err instanceof Error ? err.stack ?? err.message : String(err));
  }
}

async function main(): Promise<void> {
  const codes = pickArchetypes();
  const runtime = process.env.AGENT_RUNTIME ?? "openai";
  console.log(`runtime: ${runtime}`);
  if (runtime === "codebuddy" && !process.env.CODEBUDDY_API_KEY) {
    console.error("CODEBUDDY_API_KEY missing — required when AGENT_RUNTIME=codebuddy");
    process.exit(1);
  }
  if (runtime === "openai" && !process.env.LLM_API_KEY) {
    console.error("LLM_API_KEY missing — required when AGENT_RUNTIME=openai");
    process.exit(1);
  }

  const mock = await startMockServer(0);
  process.env.MOCK_TWITTER_URL = mock.url;
  process.env.MOCK_NEWS_URL = mock.url;
  process.env.MOCK_PRICES_URL = mock.url;
  process.env.MOCK_ONCHAIN_URL = mock.url;
  console.log(`mock data: ${mock.url}`);

  for (const code of codes) {
    await calibrate(code);
  }

  await mock.close();
  console.log(`\n${ASCII_RULE}\n  done — ${codes.length} archetype(s) calibrated\n${ASCII_RULE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
