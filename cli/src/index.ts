#!/usr/bin/env -S npx tsx
import { chooseCommand } from "./commands/choose.js";
import { statusCommand } from "./commands/status.js";
import { mocksCommand } from "./commands/mocks.js";
import { testCommand } from "./commands/test.js";
import { submitCommand } from "./commands/submit.js";
import { closePrompts } from "./ui.js";

const COMMANDS = {
  choose: chooseCommand,
  status: statusCommand,
  mocks: mocksCommand,
  test: testCommand,
  submit: submitCommand,
} as const;

type CommandName = keyof typeof COMMANDS;

function printHelp(): void {
  console.log(`
foru — Workshop CLI

Usage:
  npx foru choose [A|B|C|D|E]   pick your archetype (interactive if no arg)
  npx foru status               show what you picked and where to edit
  npx foru mocks                health-check the 4 mock endpoints
  npx foru test                 run your brain against the MVS contract
  npx foru submit               test, then deploy to FORU Grid

Typical flow:  mocks → choose → (edit brain.ts) → test → submit
`);
}

async function main(): Promise<void> {
  const [name, ...rest] = process.argv.slice(2);
  if (!name || name === "--help" || name === "-h") {
    printHelp();
    return;
  }
  const command = COMMANDS[name as CommandName];
  if (!command) {
    console.error(`Unknown command: ${name}`);
    printHelp();
    process.exitCode = 1;
    return;
  }
  try {
    await command(...(rest as [string?]));
  } catch (err) {
    console.error(`\n✗ ${(err as Error).message}`);
    process.exitCode = 1;
  } finally {
    closePrompts();
  }
}

main();
