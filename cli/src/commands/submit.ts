import path from "node:path";
import { ARCHETYPES, type ArchetypeCode } from "@foru-workshop/contracts";
import { deploy, type DeployRequest } from "@foru-workshop/grid";
import { archetypeFolder, requireConfig } from "../config.js";
import { c, fail, heading, info, ok, warn } from "../ui.js";
import { testCommand } from "./test.js";

export async function submitCommand(): Promise<void> {
  const cfg = await requireConfig();
  const code = cfg.archetype as ArchetypeCode;
  const meta = ARCHETYPES[code];

  heading(`Submit — ${code} (${meta.role})`);

  info("Step 1/2 — run MVS test locally");
  await testCommand();
  if (process.exitCode === 1) {
    fail("Fix the contract failures above before submitting.");
    return;
  }

  info("Step 2/2 — deploy to FORU Grid");
  const entrypoint = path.join(
    archetypeFolder(code),
    "src/handler.ts",
  );

  const req: DeployRequest = {
    archetype: code,
    agentName: cfg.agentName,
    description: cfg.description,
    entrypoint,
  };

  try {
    const result = await deploy(req);
    ok(`Deployed: ${c.cyan}${result.callableUrl}${c.reset}`);
    console.log(`${c.dim}  agent ID:   ${result.agentId}${c.reset}`);
    console.log(`${c.dim}  deployed:   ${result.deployedAt}${c.reset}`);
    info(
      "Copy the callable URL into your hackathon submission form, " +
        "then ping a facilitator for the founding-team stamp.",
    );
  } catch (err) {
    fail(`Grid deploy failed: ${(err as Error).message}`);
    warn(
      "Fallback: send this message to your OpenClaw chat:\n" +
        `   "Wrap ${entrypoint} as a FORU Grid agent for archetype ${code}, deploy it, return the callable URL"`,
    );
    process.exitCode = 1;
  }
}
