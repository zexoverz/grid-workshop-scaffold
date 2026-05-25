// End-to-end test of all 5 archetypes against a local mock server.
//
//   1. Start an in-process HTTP mock (data endpoints + fake LLM).
//   2. For each archetype A..E:
//        - write .foru-config.json
//        - run `npx foru test` with env pointed at the mock
//        - capture pass/fail
//   3. Also run `npx foru mocks` against the local mock to confirm the
//      health-check flow works.
//
// Run with:  npx tsx scripts/test-all.ts

import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { startMockServer } from "./mock-server.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ARCHETYPES = ["A", "B", "C", "D", "E"] as const;

interface RunResult {
  archetype: string;
  ok: boolean;
  exitCode: number;
  durationMs: number;
  stderr: string;
  stdoutTail: string;
}

async function runCli(
  args: string[],
  env: NodeJS.ProcessEnv,
): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve) => {
    const child = spawn("npx", ["foru", ...args], {
      cwd: ROOT,
      env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (c) => (stdout += c.toString()));
    child.stderr.on("data", (c) => (stderr += c.toString()));
    child.on("close", (code) => resolve({ stdout, stderr, code: code ?? 1 }));
  });
}

async function writeConfig(archetype: string): Promise<void> {
  const cfg = {
    archetype,
    agentName: `test-${archetype.toLowerCase()}`,
    description: `Smoke test for archetype ${archetype}`,
    createdAt: new Date().toISOString(),
  };
  await fs.writeFile(
    path.join(ROOT, ".foru-config.json"),
    JSON.stringify(cfg, null, 2) + "\n",
  );
}

function makeEnv(mockUrl: string): NodeJS.ProcessEnv {
  return {
    ...process.env,
    MOCK_TWITTER_URL: mockUrl,
    MOCK_NEWS_URL: mockUrl,
    MOCK_PRICES_URL: mockUrl,
    MOCK_ONCHAIN_URL: mockUrl,
    LLM_BASE_URL: mockUrl,
    LLM_API_KEY: "test-key-not-real",
    LLM_MODEL: "mock-model",
  };
}

function tail(s: string, n = 8): string {
  return s.trim().split("\n").slice(-n).join("\n");
}

async function runPhase(
  label: string,
  env: NodeJS.ProcessEnv,
): Promise<RunResult[]> {
  const results: RunResult[] = [];
  for (const code of ARCHETYPES) {
    console.log(`\n=== ${label}  [archetype ${code}] ===`);
    await writeConfig(code);
    const started = Date.now();
    const r = await runCli(["test"], env);
    const durationMs = Date.now() - started;
    const ok = r.code === 0;
    results.push({
      archetype: code,
      ok,
      exitCode: r.code,
      durationMs,
      stderr: r.stderr,
      stdoutTail: tail(r.stdout),
    });
    if (ok) {
      console.log(`✓ ${code} passed (${durationMs}ms)`);
      console.log(tail(r.stdout, 3));
    } else {
      console.log(`✗ ${code} FAILED (exit ${r.code}, ${durationMs}ms)`);
      console.log("--- stdout tail ---");
      console.log(tail(r.stdout, 12));
      if (r.stderr.trim()) {
        console.log("--- stderr ---");
        console.log(r.stderr);
      }
    }
  }
  return results;
}

function printSummary(label: string, results: RunResult[]): number {
  console.log(`\n--- ${label} ---`);
  for (const r of results) {
    const status = r.ok ? "✓" : "✗";
    console.log(`  ${status}  ${r.archetype}  exit=${r.exitCode}  ${r.durationMs}ms`);
  }
  return results.filter((r) => r.ok).length;
}

async function main(): Promise<void> {
  const server = await startMockServer(0);
  console.log(`▶ Mock server: ${server.url}`);
  const env = makeEnv(server.url);

  // 1) Health check
  console.log("\n=== Phase 0: npx foru mocks ===");
  const mocks = await runCli(["mocks"], env);
  console.log(mocks.stdout);
  if (mocks.code !== 0) {
    console.error("mocks command failed:");
    console.error(mocks.stderr);
  }

  // 2) Happy path
  console.log("\n══ Phase 1: happy path (LLM available) ══");
  server.setLlmMode("ok");
  const phase1 = await runPhase("Phase 1", env);

  // 3) Fallback path (Appendix G — LLM rate-limited)
  console.log("\n══ Phase 2: fallback path (LLM returns 429) ══");
  server.setLlmMode("ratelimit");
  const phase2 = await runPhase("Phase 2", env);

  await server.close();
  await fs.unlink(path.join(ROOT, ".foru-config.json")).catch(() => {});

  console.log("\n═══ Summary ═══");
  const p1Pass = printSummary("Phase 1 — happy path", phase1);
  const p2Pass = printSummary("Phase 2 — fallback path", phase2);
  const total = phase1.length + phase2.length;
  const totalPass = p1Pass + p2Pass;
  console.log(
    `\n${totalPass}/${total} archetype runs passed across both phases.`,
  );
  if (totalPass !== total || mocks.code !== 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
