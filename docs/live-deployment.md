# Live Deployment

The scaffold (mock server + all 5 archetypes) is running on a public GCP VM for workshop attendees who don't want to install Node locally. You can hit the operator console for each archetype from any browser, or `POST /invoke` from your own client to integrate against the contracts.

> Not for production. The VM is a shared `e2-medium` team box, has no TLS, and uses a shared LLM key with a low cap.

---

## Endpoints

| Archetype | Role | Operator console | `/invoke` URL |
|---|---|---|---|
| **A** | Head of Research | http://34.101.221.255:8080 | `POST http://34.101.221.255:8080/invoke` |
| **B** | Customer Success Lead | http://34.101.221.255:8081 | `POST http://34.101.221.255:8081/invoke` |
| **C** | Chief Strategist | http://34.101.221.255:8082 | `POST http://34.101.221.255:8082/invoke` |
| **D** | Operations Officer | http://34.101.221.255:8083 | `POST http://34.101.221.255:8083/invoke` |
| **E** | Head Trader | http://34.101.221.255:8084 | `POST http://34.101.221.255:8084/invoke` |

Every archetype also exposes `/health`, `/soul`, `/data`, and `/mcp` — see `getting-started.md §6` for the full surface.

Quick liveness check:

```bash
for p in 8080 8081 8082 8083 8084; do
  curl -s "http://34.101.221.255:$p/health"; echo
done
```

Expected output:

```
{"ok":true,"archetype":"A","role":"Head of Research"}
{"ok":true,"archetype":"B","role":"Customer Success Lead"}
{"ok":true,"archetype":"C","role":"Chief Strategist"}
{"ok":true,"archetype":"D","role":"Operations Officer"}
{"ok":true,"archetype":"E","role":"Head Trader"}
```

---

## Try it from `curl`

**Archetype D** is deterministic — no LLM call, so it works even when the shared key is exhausted:

```bash
curl -s -X POST http://34.101.221.255:8083/invoke \
  -H 'content-type: application/json' \
  -d '{
    "pair": "BTCUSDT",
    "thresholds": { "priceDropPct": 3, "volumeSpikeRatio": 2, "sentimentShift": 0.3 }
  }'
```

```json
{
  "alerts": [
    {"kind":"price_spike","message":"BTCUSDT +2.59% over 60 candles","severity":"warn","observedAt":"…"},
    {"kind":"volume_spike","message":"BTCUSDT volume 3.9× average","severity":"warn","observedAt":"…"}
  ],
  "severity": "warn",
  "evaluated": { "pair": "BTCUSDT", "samples": 60 }
}
```

The other archetypes (A, B, C, E) require an LLM call per `/invoke`. They share one OpenAI key on the VM — if it returns `429` or `5xx`, run that archetype locally instead (see `getting-started.md`).

---

## What's running on the box

- **Host:** `34.101.221.255` (GCP, `untukmu-94dfd / foruai-team-agent`, `asia-southeast2-b`)
- **OS:** Ubuntu 22.04 LTS
- **Node:** v24.16.0 (system install — on `PATH` for all users)
- **Scaffold:** `~/scaffold/` under the `zexo` user — checked out from https://github.com/zexoverz/grid-workshop-scaffold (master)
- **Mock server:** bound to `127.0.0.1:5599` (intentionally **not** public — only the archetypes call it)
- **Archetypes:** bound to `0.0.0.0:8080–8084`
- **Process manager:** `nohup` via `~/scaffold/scripts/deploy/launch.sh`
- **Logs:** `~/scaffold/logs/{mocks,A-head-of-research,B-customer-success-lead,C-chief-strategist,D-operations-officer,E-head-trader}.log`

> ⚠️ **Shared box.** `foruai-team-agent` also hosts other teams' agents and services. Only touch the `~/scaffold` tree and the scaffold's own processes — do **not** stop the instance or change its firewall/network tags.

---

## Firewall

The archetype ports (8080–8084) are reachable from the internet because `foruai-team-agent` carries the `team-agent-ssh` network tag, and this rule opens all ports for that tag:

| Rule | Network | Direction | Action | Ports | Source | Target |
|---|---|---|---|---|---|---|
| `allow-ssh-team-agent` | `default` | INGRESS | ALLOW | `all` | `0.0.0.0/0` | tag `team-agent-ssh` |

No scaffold-specific firewall rule is needed. The mock port (5599) is bound to loopback, so it cannot be reached from the internet regardless.

> This rule is shared infrastructure managed by the platform team — don't delete or edit it.

---

## Operating the box

SSH:

```bash
# via gcloud (recommended — handles keys automatically)
gcloud compute ssh foruai-team-agent --project=untukmu-94dfd --zone=asia-southeast2-b

# or directly, if your key is in ~/.ssh/authorized_keys on the box
ssh zexo@34.101.221.255
```

Restart everything (kills existing scaffold processes and respawns):

```bash
bash ~/scaffold/scripts/deploy/launch.sh
```

Tail logs:

```bash
tail -f ~/scaffold/logs/*.log
```

Update to the latest `master` — easiest is to re-run the deploy workflow from GitHub
(**Actions → Deploy to scaffold VM → Run workflow**), which pulls the ref, preserves
`.env`, reinstalls, and health-checks. To do it by hand on the box:

```bash
cd ~ && rm -rf scaffold.new
curl -fsSL https://github.com/zexoverz/grid-workshop-scaffold/archive/refs/heads/master.tar.gz \
  | tar -xz && mv grid-workshop-scaffold-master scaffold.new
cp ~/scaffold/.env scaffold.new/
mv ~/scaffold ~/scaffold.old && mv scaffold.new ~/scaffold
cd ~/scaffold && npm install --no-audit --no-fund
bash ~/scaffold/scripts/deploy/launch.sh
```

Set / rotate the LLM key (needed for A, B, C, E):

```bash
ssh zexo@34.101.221.255 \
  "sed -i 's/^LLM_API_KEY=.*/LLM_API_KEY=sk-…/' ~/scaffold/.env && bash ~/scaffold/scripts/deploy/launch.sh"
```

---

## Cost & cleanup

`foruai-team-agent` is a **shared** box — never stop the instance or delete its firewall
rules/tags, as that would take down other teams' services. To take **only the scaffold**
down when the workshop is over:

```bash
# stop the scaffold processes (matches this scaffold's tsx workers only)
ssh zexo@34.101.221.255 'pkill -f "$HOME/scaffold/node_modules/.bin/tsx" || true; pkill -f "scaffold/scripts/mock-server.ts" || true'

# (optional) remove the checkout and backups
ssh zexo@34.101.221.255 'rm -rf ~/scaffold ~/scaffold.bak.* ~/scaffold.old'
```

To stop future deploys, disable the **Deploy to scaffold VM** workflow in GitHub Actions
(or remove the `DEPLOY_SSH_*` secrets).
