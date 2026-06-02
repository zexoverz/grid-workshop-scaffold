# Live Deployment

The scaffold (mock server + all 5 archetypes) is running on a public GCP VM for workshop attendees who don't want to install Node locally. You can hit the operator console for each archetype from any browser, or `POST /invoke` from your own client to integrate against the contracts.

> Not for production. The VM is `e2-small` class, has no TLS, and uses a shared LLM key with a low cap.

---

## Endpoints

| Archetype | Role | Operator console | `/invoke` URL |
|---|---|---|---|
| **A** | Head of Research | http://35.192.185.103:8080 | `POST http://35.192.185.103:8080/invoke` |
| **B** | Customer Success Lead | http://35.192.185.103:8081 | `POST http://35.192.185.103:8081/invoke` |
| **C** | Chief Strategist | http://35.192.185.103:8082 | `POST http://35.192.185.103:8082/invoke` |
| **D** | Operations Officer | http://35.192.185.103:8083 | `POST http://35.192.185.103:8083/invoke` |
| **E** | Head Trader | http://35.192.185.103:8084 | `POST http://35.192.185.103:8084/invoke` |

Every archetype also exposes `/health`, `/soul`, `/data`, and `/mcp` — see `getting-started.md §6` for the full surface.

Quick liveness check:

```bash
for p in 8080 8081 8082 8083 8084; do
  curl -s "http://35.192.185.103:$p/health"; echo
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
curl -s -X POST http://35.192.185.103:8083/invoke \
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

- **Host:** `35.192.185.103` (GCP, `untukmu-94dfd / openclaw-workshop-test`, `us-central1-a`)
- **OS:** Debian 12 (kernel 6.1)
- **Node:** 20.18.1 (official linux-x64 tarball at `~/node-v20.18.1-linux-x64/`, symlinked to `~/bin/`)
- **Scaffold:** `~/scaffold/` — checked out from https://github.com/zexoverz/grid-workshop-scaffold (master)
- **Mock server:** bound to `127.0.0.1:5599` (intentionally **not** public — only the archetypes call it)
- **Archetypes:** bound to `0.0.0.0:8080–8084`
- **Process manager:** `nohup` via `~/scaffold/launch.sh`
- **Logs:** `~/scaffold/logs/{mocks,A-head-of-research,B-customer-success-lead,C-chief-strategist,D-operations-officer,E-head-trader}.log`

---

## Firewall

One GCP firewall rule exposes only the archetype ports:

| Rule | Network | Direction | Action | Ports | Source | Target |
|---|---|---|---|---|---|---|
| `workshop-archetypes-8080-8084` | `default` | INGRESS | ALLOW | `tcp:8080-8084` | `0.0.0.0/0` | tag `workshop-archetypes` |

The tag `workshop-archetypes` is on `openclaw-workshop-test` only, so no other instance in the project is affected. The mock port (5599) has **no** firewall rule and is bound to loopback — it cannot be reached from the internet.

---

## Operating the box

SSH:

```bash
ssh faisalfirdani01@35.192.185.103
```

Restart everything (kills existing processes and respawns):

```bash
bash ~/scaffold/launch.sh
```

Tail logs:

```bash
tail -f ~/scaffold/logs/*.log
```

Update to the latest `master`:

```bash
cd ~ && rm -rf scaffold.new
curl -fsSL https://github.com/zexoverz/grid-workshop-scaffold/archive/refs/heads/master.tar.gz \
  | tar -xz && mv grid-workshop-scaffold-master scaffold.new
cp ~/scaffold/.env ~/scaffold/launch.sh scaffold.new/
mv ~/scaffold ~/scaffold.old && mv scaffold.new ~/scaffold
cd ~/scaffold && export PATH=$HOME/bin:$PATH && npm install --no-audit --no-fund
bash ~/scaffold/launch.sh
```

Set / rotate the LLM key (needed for A, B, C, E):

```bash
ssh faisalfirdani01@35.192.185.103 \
  "sed -i 's/^LLM_API_KEY=.*/LLM_API_KEY=sk-…/' ~/scaffold/.env && bash ~/scaffold/launch.sh"
```

---

## Cost & cleanup

If the workshop is over and you want to take the deployment down:

```bash
# stop the processes
ssh faisalfirdani01@35.192.185.103 'pkill -f "tsx.*scaffold" || true'

# close the firewall (gcloud)
gcloud compute firewall-rules delete workshop-archetypes-8080-8084 --project=untukmu-94dfd
gcloud compute instances remove-tags openclaw-workshop-test \
  --zone=us-central1-a --project=untukmu-94dfd --tags=workshop-archetypes
```

Or stop the VM entirely:

```bash
gcloud compute instances stop openclaw-workshop-test \
  --zone=us-central1-a --project=untukmu-94dfd
```
