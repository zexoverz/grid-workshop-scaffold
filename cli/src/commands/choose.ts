import {
  ARCHETYPES,
  ARCHETYPE_CODES,
  isArchetypeCode,
  type ArchetypeCode,
} from "@foru-workshop/contracts";
import {
  archetypeFolder,
  readConfig,
  writeConfig,
} from "../config.js";
import { c, heading, info, ok, prompt, warn } from "../ui.js";

export async function chooseCommand(arg?: string): Promise<void> {
  const existing = await readConfig();
  if (existing) {
    warn(
      `You already chose ${existing.archetype} — ${ARCHETYPES[existing.archetype as ArchetypeCode].role}.`,
    );
    const confirm = await prompt("Re-pick? This wipes your config. [y/N] ");
    if (confirm.toLowerCase() !== "y") {
      info("Keeping existing pick.");
      return;
    }
  }

  const code = arg && isArchetypeCode(arg.toUpperCase())
    ? (arg.toUpperCase() as ArchetypeCode)
    : await pickInteractive();

  const meta = ARCHETYPES[code];
  const agentName = await prompt(
    `Agent name (max 60 chars) [${defaultAgentName(code)}]: `,
  );
  const description = await prompt(
    "One-line description (max 160 chars): ",
  );

  await writeConfig({
    archetype: code,
    agentName: agentName || defaultAgentName(code),
    description: description || `${meta.role} for ${meta.problem}`,
    createdAt: new Date().toISOString(),
  });

  ok(`Picked ${c.bold}${code} — ${meta.role}${c.reset}.`);
  info(`Edit your brain: ${c.cyan}${archetypeFolder(code)}/src/brain.ts${c.reset}`);
  info(`Then: ${c.cyan}npx foru test${c.reset}, then ${c.cyan}npx foru submit${c.reset}`);
}

function defaultAgentName(code: ArchetypeCode): string {
  return `agent-${code.toLowerCase()}-${Math.random().toString(36).slice(2, 6)}`;
}

async function pickInteractive(): Promise<ArchetypeCode> {
  heading("Pick your first AI Employee");
  for (const code of ARCHETYPE_CODES) {
    const meta = ARCHETYPES[code];
    console.log(`  ${c.bold}${code}${c.reset}  ${meta.role}  ${c.dim}— ${meta.problem}${c.reset}`);
  }
  while (true) {
    const answer = (await prompt("\nChoose [A/B/C/D/E]: ")).toUpperCase();
    if (isArchetypeCode(answer)) return answer;
    warn(`'${answer}' is not a valid archetype. Try again.`);
  }
}
