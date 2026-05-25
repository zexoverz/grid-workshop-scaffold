import { baseUrl, type MockEndpoint } from "./http.js";

export interface HealthResult {
  endpoint: MockEndpoint;
  url: string;
  ok: boolean;
  status?: number;
  error?: string;
  latencyMs: number;
}

export async function checkHealth(
  endpoint: MockEndpoint,
): Promise<HealthResult> {
  const url = `${baseUrl(endpoint)}/health`;
  const started = Date.now();
  try {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 3000);
    const res = await fetch(url, { signal: ac.signal });
    clearTimeout(timer);
    return {
      endpoint,
      url,
      ok: res.ok,
      status: res.status,
      latencyMs: Date.now() - started,
    };
  } catch (err) {
    return {
      endpoint,
      url,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      latencyMs: Date.now() - started,
    };
  }
}

export async function checkAll(): Promise<HealthResult[]> {
  const endpoints: MockEndpoint[] = ["twitter", "news", "prices", "onchain"];
  return Promise.all(endpoints.map(checkHealth));
}
