# Deploy OpenClaw on a GCP VM — Step-by-Step

> **Audience:** Workshop operator setting up OpenClaw for the first time.
> **Goal:** A reachable OpenClaw Gateway you can connect participants' archetype agents to.
> **Source of truth:** [docs.openclaw.ai/install/gcp](https://docs.openclaw.ai/install/gcp) and [docs.openclaw.ai/start/getting-started](https://docs.openclaw.ai/start/getting-started). This doc adapts those for the FORU workshop.

---

## What OpenClaw actually is (in one paragraph)

OpenClaw is a CLI + a long-running **Gateway daemon**. The Gateway hosts one or more *agents*, talks to LLM providers (OpenAI / Anthropic / Google), and bridges them to chat channels (Telegram, Discord, Slack, WhatsApp, etc.). Default port is **18789**, default bind is **loopback only** (`127.0.0.1`). You reach the Control UI through an SSH tunnel, not by exposing the port to the internet.

**Important architecture note for the workshop:**

> OpenClaw's primary user-facing surface is **chat channels**, not a per-agent HTTP URL. The scaffold's `npx foru submit` currently expects OpenClaw to return a "callable URL" for Grid registration (`cli/src/commands/submit.ts:36-44`). That gap needs to be resolved with the workshop team — either (a) OpenClaw also publishes an HTTP endpoint per agent that Grid can register, or (b) the scaffold's submit flow should hand off a chat-channel handle instead of a URL.

---

## Prerequisites checklist

Before touching GCP:

- [ ] Google account with **billing enabled**
- [ ] A GCP **project** (Console → project picker → "New Project")
- [ ] **`gcloud` CLI** installed locally — `brew install --cask google-cloud-sdk` on macOS
- [ ] **SSH keypair** on your laptop — if missing: `ssh-keygen -t ed25519 -C "you@example.com"`
- [ ] **Billing budget alert** set on the project (Console → Billing → Budgets & alerts)
- [ ] **At least one LLM provider API key** — OpenAI for this workshop (`OPENAI_API_KEY`)

Auth the CLI once:

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

---

## Step 1 — Pick a machine type and region

OpenClaw's official sizing (from their GCP guide):

| Tier | Machine | vCPU / RAM | Notes |
|---|---|---|---|
| Minimum | `e2-small` | 2 / 2 GB | Documented minimum; ~$12/mo |
| Recommended | `e2-medium` | 2 / 4 GB | Avoids Docker build OOM; ~$25/mo |
| Heavier loads | `e2-standard-2` | 2 / 8 GB | If you'll host multiple agents |

> ❌ Don't use `e2-micro` — OpenClaw's docs explicitly call it out for failing Docker builds with OOM (exit 137).

**Region:** OpenClaw examples use `us-central1-a`. For Jakarta/SEA latency, prefer `asia-southeast2-a` (Jakarta) or `asia-southeast1-a` (Singapore). Region choice doesn't affect functionality; only latency to the Control UI tunnel.

**OS image:** **Debian 12** (per OpenClaw's GCP guide). Ubuntu also works but commands below assume Debian.

**Boot disk:** 20 GB pd-balanced (OpenClaw's documented minimum).

---

## Step 2 — Create the VM

### Option A — Console (recommended first time)

1. Console → Compute Engine → **VM instances** → **Create instance**
2. **Name:** `openclaw-gateway`
3. **Region/Zone:** `asia-southeast2` / `asia-southeast2-a`
4. **Machine configuration:** E2 series → `e2-medium`
5. **Boot disk:** Change → Operating system **Debian** → Version **Debian GNU/Linux 12 (bookworm)** → 20 GB pd-balanced
6. **Firewall:** **leave both HTTP and HTTPS unchecked** — Gateway stays loopback-only. We don't open port 18789 to the public.
7. **Advanced → Security → Manage Access → Add SSH keys:** paste `~/.ssh/id_ed25519.pub`
8. **Create**

Wait ~30s. Copy the **External IP** (you'll use it for SSH only, not for HTTP).

### Option B — gcloud (matches OpenClaw's official command)

```bash
gcloud compute instances create openclaw-gateway \
  --zone=asia-southeast2-a \
  --machine-type=e2-medium \
  --boot-disk-size=20GB \
  --image-family=debian-12 \
  --image-project=debian-cloud
```

Get the IP:

```bash
gcloud compute instances describe openclaw-gateway \
  --zone=asia-southeast2-a \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
```

---

## Step 3 — Firewall: leave the Gateway port closed

OpenClaw's recommended posture is **loopback only + SSH tunnel**. That means port **18789 is never exposed publicly** on a vanilla deploy.

You only need port **22** (SSH) open, which GCP's `default` network already permits. **Skip creating a firewall rule for 18789.**

If you later decide to expose it publicly (not recommended for workshop day), see "Optional — Public exposure" near the bottom.

---

## Step 4 — SSH in (with port forwarding)

The crucial bit: forward port 18789 from the VM to your laptop so you can reach the Control UI locally.

```bash
gcloud compute ssh openclaw-gateway --zone=asia-southeast2-a -- -L 18789:127.0.0.1:18789
```

This opens an SSH session **and** tunnels `localhost:18789` on your laptop to `127.0.0.1:18789` on the VM. Keep this terminal open while you work; later you'll open `http://127.0.0.1:18789` in your browser.

---

## Step 5 — Base server setup (on the VM)

Run on the VM after SSHing in:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl ca-certificates
```

Install Docker (OpenClaw's GCP-recommended install path uses Docker):

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
# Re-login or apply group now:
newgrp docker
docker --version
```

You now have a VM ready for OpenClaw.

---

## Step 6 — Install OpenClaw

You have two real options. Both are official. Pick one.

### Option A — Installer script (simplest)

This downloads and runs OpenClaw with a guided wizard. **Recommended for first-time setup.**

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

The installer drops the `openclaw` binary on your PATH and automatically launches `openclaw onboard`. The onboarding wizard prompts for:

1. **Model/Auth** — pick OpenAI; paste your `OPENAI_API_KEY` when asked
2. **Workspace** — accept default (`~/.openclaw/workspace`)
3. **Gateway** — port `18789`, bind `127.0.0.1` (defaults are correct for loopback)
4. **Channels** — skip for now or pick one (Telegram is easiest for testing). Channel setup can be done later.
5. **Daemon** — accept (this is what `--install-daemon` would set; installs a systemd user unit)
6. **Health check** — confirms the Gateway is live
7. **Skills** — accept defaults

If onboarding got skipped, run it explicitly:

```bash
openclaw onboard --install-daemon
```

### Option B — Docker / docker compose (OpenClaw's GCP-canonical path)

OpenClaw's GCP guide uses a docker-compose deploy that binds the Gateway to loopback inside the VM:

```yaml
# ports stanza (paraphrased from docs):
ports:
  - "127.0.0.1:${OPENCLAW_GATEWAY_PORT}:18789"
```

State persists in `~/.openclaw/` on the host. Required env vars in `.env`:

```bash
OPENCLAW_GATEWAY_TOKEN=$(openssl rand -hex 32)
OPENCLAW_GATEWAY_BIND=lan          # only if exposing to LAN; else omit
GOG_KEYRING_PASSWORD=$(openssl rand -hex 32)
OPENAI_API_KEY=sk-...              # for this workshop
```

> 📎 The exact `docker-compose.yml` lives in OpenClaw's repo / install/docker docs. Pull that file rather than hand-writing it — they ship a maintained version. See https://docs.openclaw.ai/install/docker.

---

## Step 7 — Verify the Gateway is running (on the VM)

```bash
openclaw --version
openclaw doctor                  # diagnoses common issues
openclaw gateway status          # should show "running" on port 18789
```

If `doctor` reports something fixable:

```bash
openclaw doctor --fix
```

Daemon logs (systemd user unit):

```bash
systemctl --user status openclaw-gateway.service
journalctl --user -u openclaw-gateway.service -f
```

---

## Step 8 — Open the Control UI from your laptop

You already opened the SSH tunnel in Step 4. Now on your laptop:

```
http://127.0.0.1:18789
```

You should see the OpenClaw Control UI. From here you can:
- Add agents
- Connect chat channels
- Edit `~/.openclaw/openclaw.json` via the Config tab (auto-reloads on change)

---

## Step 9 — Wire up the workshop archetypes

> ⚠️ **This is the integration point that still needs clarification with the workshop team — see the architecture note at the top.**

Provisional plan, assuming OpenClaw can host the scaffold's `handler.ts` as an agent:

1. From your laptop, `cd` into the scaffold:
   ```bash
   cd /Users/zexo/Documents/programming/Foru/foru-grid-workshop-scaffold
   ```
2. Push the chosen archetype's files (`SOUL.md` + `src/`) to the VM into a workspace path OpenClaw recognises.
3. Register the agent with OpenClaw:
   ```bash
   openclaw agents add <archetype-name>
   ```
4. Connect a chat channel to that agent (or expose an HTTP endpoint if OpenClaw supports it for Grid registration).
5. Run `npx foru submit` locally and capture whatever identifier OpenClaw returns (chat handle or URL) for the Grid manifest.

**Open question:** how exactly the scaffold's `submit` handoff message ("Wrap `…/handler.ts` as a FORU Grid agent…, deploy it, and return the callable URL") maps to OpenClaw's `agents add` flow. The scaffold currently expects a chat-paste-and-reply UX; OpenClaw's docs describe an `openclaw agents add` CLI command. The right answer is probably to wire `cli/src/commands/submit.ts` to call OpenClaw's API directly once we know its shape.

---

## Optional — Public exposure (NOT recommended for workshop day)

If you really need participants to hit the Gateway from outside (rather than via chat channels), OpenClaw's docs say:

> "If you bind to `lan` or `tailnet`, require `gateway.auth.token` or `gateway.auth.password`."

Steps if you choose this path:

1. In `~/.openclaw/openclaw.json`:
   ```json5
   {
     gateway: {
       port: 18789,
       bind: "lan",
       auth: { token: "<long-random-secret>" }
     }
   }
   ```
2. Open the GCP firewall for that port:
   ```bash
   gcloud compute firewall-rules create openclaw-gateway-public \
     --network=default \
     --action=ALLOW \
     --direction=INGRESS \
     --rules=tcp:18789 \
     --source-ranges=0.0.0.0/0
   ```
3. Strongly recommended: front it with Caddy on 443 instead of opening 18789 directly, and require the auth token on every request.

**The lower-risk alternative** for remote participants is **Tailscale Serve** (OpenClaw's docs mention this explicitly). It exposes the loopback service on your tailnet without opening any GCP firewall port.

---

## Cost / lifecycle

- **Stop the VM** when you're not using it (disk persists, billing drops to ~$2/mo for the 20 GB disk):
  ```bash
  gcloud compute instances stop  openclaw-gateway --zone=asia-southeast2-a
  gcloud compute instances start openclaw-gateway --zone=asia-southeast2-a
  ```
- **Snapshot the disk** before workshop day:
  ```bash
  gcloud compute disks snapshot openclaw-gateway \
    --zone=asia-southeast2-a \
    --snapshot-names=openclaw-pre-workshop
  ```
- **Resize** the VM later without losing data:
  ```bash
  gcloud compute instances set-machine-type openclaw-gateway \
    --zone=asia-southeast2-a \
    --machine-type=e2-standard-2
  ```
  (VM must be stopped first.)

---

## Tear-down

```bash
gcloud compute instances delete openclaw-gateway --zone=asia-southeast2-a
gcloud compute firewall-rules delete openclaw-gateway-public 2>/dev/null || true
```

---

## Troubleshooting quick reference

| Symptom | Check |
|---|---|
| `openclaw gateway status` says not running | `journalctl --user -u openclaw-gateway.service -f` |
| Control UI won't load on laptop | SSH tunnel from Step 4 still open? `lsof -i :18789` on laptop |
| Docker build OOM (exit 137) | VM is `e2-micro` — resize to `e2-small`+ |
| Config rejected on save | `openclaw doctor --fix`; OpenClaw validates strictly, no unknown keys allowed |
| SSH "permission denied" right after VM creation | Key takes 1–2 min to propagate after VM start |

---

## Open questions for the workshop team

1. How should `cli/src/commands/submit.ts` actually interact with OpenClaw — chat-paste handoff (current) or call `openclaw agents add` via API?
2. Does OpenClaw expose a per-agent HTTP endpoint suitable for FORU Grid registration, or does Grid accept chat-channel handles?
3. One shared OpenClaw VM for the whole workshop, or one per participant?
4. Which chat channel(s) will participants use to test their agent? (Telegram has the simplest pairing UX.)
5. Will participants ever need to reach the Control UI themselves, or is that operator-only?
