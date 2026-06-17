# Deploy to a VPS (systemd)

Put your archetype on a **public URL** so you can register it on FORU Grid
(`getting-started.md §11`). One command bootstraps a bare Ubuntu VPS into the
full running scaffold — mock server + all 5 archetypes — supervised by systemd
(auto-restart on crash, auto-start on boot).

> Don't want a server to babysit? For a quick demo you can instead expose your
> local `npm run dev` with a tunnel (`cloudflared tunnel --url http://localhost:8080`)
> — instant public HTTPS, no account. It dies when your laptop sleeps, so it's
> for demos, not a persistent agent. The rest of this doc is the persistent path.

---

## 1 · Get a VPS

Any **Ubuntu 22.04+ / Debian 12+** box with a public IP works. A `$4–6/mo`
1 vCPU / 1 GB instance is plenty (DigitalOcean, Hetzner, Vultr, Linode, AWS
Lightsail, GCP e2-micro, …). You need:

- the public **IP address**
- **SSH access** as a user with `sudo`

```bash
ssh youruser@<vps-ip>
```

---

## 2 · Run the installer

From the SSH session:

```bash
curl -fsSL https://raw.githubusercontent.com/zexoverz/grid-workshop-scaffold/master/scripts/deploy/vps/install.sh | sudo bash
```

It will:

1. install Node 20 + git (if missing)
2. **ask which AI runtime to use** — OpenAI (`sk-…`), CodeBuddy (`ck-…`), or skip
3. create a locked-down `foru` user and clone the scaffold to `/opt/foru-grid/scaffold`
4. write `.env` (mock URLs → loopback, ports handled by systemd)
5. install + enable + start the systemd services
6. open firewall ports `8080-8084`
7. health-check every port and print your public console URLs

Re-running it is safe — your `.env` is preserved.

**Unattended / scripted** (no prompt): seed the key up front —

```bash
# OpenAI
curl -fsSL https://raw.githubusercontent.com/zexoverz/grid-workshop-scaffold/master/scripts/deploy/vps/install.sh \
  | sudo LLM_API_KEY=sk-... bash

# CodeBuddy
curl -fsSL https://raw.githubusercontent.com/zexoverz/grid-workshop-scaffold/master/scripts/deploy/vps/install.sh \
  | sudo AGENT_RUNTIME=codebuddy CODEBUDDY_API_KEY=ck-... bash
```

---

## 3 · Open the cloud firewall

The installer opens the OS firewall (ufw/firewalld), but **your cloud provider
has its own firewall** that the script can't touch. Open inbound **TCP
8080-8084** in the provider console:

| Provider | Where |
|---|---|
| AWS / Lightsail | Security Group / Networking → add rule, TCP 8080-8084 |
| GCP | VPC → Firewall → allow `tcp:8080-8084` for the instance tag |
| DigitalOcean | Networking → Firewalls → inbound rule |
| Hetzner / Vultr | Firewall → inbound rule |

Then from your laptop, confirm:

```bash
curl http://<vps-ip>:8080/health
# {"ok":true,"archetype":"A","role":"Head of Research"}
```

Open `http://<vps-ip>:8080` in a browser → the operator console renders.

---

## 4 · Register on FORU Grid

Your archetype is now publicly reachable. Follow `getting-started.md §11`, using:

| Service | Endpoint |
|---|---|
| `web` | `http://<vps-ip>:8080/invoke` |
| `MCP` | `http://<vps-ip>:8080/mcp` |

> **TLS:** these are plain HTTP. If the Grid form (or your users) require HTTPS,
> put **Caddy** in front — `caddy reverse-proxy --to :8080 --from your.domain`
> gets you an auto-TLS URL in one line once a domain points at the VPS.

---

## 5 · Maintain it

`foructl` is installed on the VPS:

```bash
foructl status            # whole stack at a glance
foructl logs A            # tail one archetype's logs (or: foructl logs mock)
foructl restart           # restart everything (or one: foructl restart B)
foructl update            # git pull latest + npm install + restart
foructl runtime           # switch AI provider / key, then restart
foructl health            # curl /health on every port
```

systemd keeps the services alive across crashes and reboots automatically.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `curl <ip>:8080/health` times out from your laptop | Cloud firewall (§3) not open. The OS firewall alone isn't enough. |
| A port shows `✗` in the installer's health check | `foructl logs <A-E>` — usually a missing/invalid AI key in `/opt/foru-grid/scaffold/.env`. Fix with `foructl runtime`. |
| Only archetype D works | No AI key set. D is deterministic; A/B/C/E need `LLM_API_KEY` or `CODEBUDDY_API_KEY`. Run `foructl runtime`. |
| `service info not found` from CodeBuddy | `CODEBUDDY_MODEL` not available on your edition — set it to `default-model` in `.env`, then `foructl restart`. |
| Installer says "targets Debian/Ubuntu" | You're on a non-apt distro. Install Node 20 + git manually, then adapt `scripts/deploy/vps/systemd/` units. |

See `scripts/deploy/vps/README.md` for the operator reference.
