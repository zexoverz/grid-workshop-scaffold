import { checkAll, baseUrl } from "@foru-workshop/mock-clients";
import { c, fail, heading, ok } from "../ui.js";

export async function mocksCommand(): Promise<void> {
  heading("Mock endpoint health");
  const results = await checkAll();
  for (const r of results) {
    const line = `mock-${r.endpoint.padEnd(8)} ${baseUrl(r.endpoint)} ${c.dim}(${r.latencyMs}ms)${c.reset}`;
    if (r.ok) ok(line);
    else fail(`${line} — ${r.error ?? `HTTP ${r.status}`}`);
  }
  const allOk = results.every((r) => r.ok);
  if (!allOk) {
    console.log(
      `\n${c.yellow}!${c.reset} Some mocks are unreachable. Check .env or ask a facilitator.`,
    );
    process.exitCode = 1;
  }
}
