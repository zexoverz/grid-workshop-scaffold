import type { ArchetypeCode } from "@foru-workshop/contracts";

const DEFAULT_GRID_URL = "https://grid.foruai.io";

export interface DeployRequest {
  archetype: ArchetypeCode;
  agentName: string;
  description: string;
  entrypoint: string;
}

export interface DeployResult {
  agentId: string;
  callableUrl: string;
  deployedAt: string;
}

// TODO(foru-eng): replace this stub once Grid deploy API is finalized.
// Open questions tracked in docs/troubleshooting.md → "Grid deploy spec".
// Until then, OpenClaw is the canonical deploy path (see archetype README).
export async function deploy(req: DeployRequest): Promise<DeployResult> {
  const baseUrl = process.env.GRID_API_URL ?? DEFAULT_GRID_URL;
  const token = process.env.GRID_TOKEN;

  if (!token) {
    throw new Error(
      "GRID_TOKEN not set. Run `npx foru submit` for the OpenClaw-mediated flow, " +
        "or fill GRID_TOKEN in .env if you have a direct Grid token.",
    );
  }

  const res = await fetch(`${baseUrl}/v1/agents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Grid deploy ${res.status}: ${detail.slice(0, 200)}`);
  }
  return (await res.json()) as DeployResult;
}

export async function callAgent<T>(
  callableUrl: string,
  payload: unknown,
): Promise<T> {
  const res = await fetch(callableUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`agent ${res.status}: ${detail.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}
