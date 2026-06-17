# VPS deploy (systemd)

Self-contained, re-runnable deploy of the whole scaffold (mock server + all 5
archetypes) onto a bare **Ubuntu/Debian** VPS, supervised by **systemd**.

This is the path a workshop participant takes to put *their* archetype on a
public URL. It is independent of the maintainer's GCP CI path
(`../launch.sh` + `../server-deploy.sh`, which uses `nohup`).

## One-shot install

On a fresh VPS, as a sudo-capable user:

```bash
curl -fsSL https://raw.githubusercontent.com/zexoverz/grid-workshop-scaffold/master/scripts/deploy/vps/install.sh | sudo bash
```

It prompts for your AI runtime (OpenAI / CodeBuddy / skip) and key, then does
everything else. To run unattended, seed the key instead of being prompted:

```bash
curl -fsSL .../install.sh | sudo LLM_API_KEY=sk-... bash          # OpenAI
curl -fsSL .../install.sh | sudo AGENT_RUNTIME=codebuddy CODEBUDDY_API_KEY=ck-... bash
```

From a checkout instead of curl:

```bash
sudo bash scripts/deploy/vps/install.sh
```

## What it sets up

| Piece | Where |
|---|---|
| App user | `foru` (system user, nologin) |
| Code | `/opt/foru-grid/scaffold` |
| Mock server | `foru-mock.service` → `127.0.0.1:5599` (loopback only) |
| Archetypes | `foru-archetype@<folder>.service` → ports `8080`–`8084` |
| Per-port config | `/etc/foru-grid/<folder>.port` |
| Group control | `foru-grid.target` (start/stop/restart all at once) |
| Firewall | opens `8080-8084/tcp` (ufw or firewalld) |

systemd handles **auto-restart on crash** and **start on boot**.

## Maintain it — `foructl`

```bash
foructl status            # whole stack at a glance
foructl logs              # tail all logs (Ctrl-C to stop)
foructl logs A            # just archetype A   (or: foructl logs mock)
foructl restart           # restart everything (or: foructl restart B)
foructl update [ref]      # git pull + npm install + restart (default: master)
foructl runtime           # switch AI provider / key, then restart
foructl health            # curl /health on every port
```

Raw systemd works too: `systemctl restart foru-grid.target`,
`journalctl -fu foru-archetype@A-head-of-research.service`.

## Notes

- **Cloud firewall is separate.** AWS security groups / GCP / DigitalOcean /
  Hetzner have their own firewall — open TCP `8080-8084` there as well.
- **No TLS.** These are plain HTTP on high ports. For a real public agent, put
  a reverse proxy (Caddy/nginx) in front for HTTPS, or use a managed host.
- **`.env` is preserved** across re-runs and `foructl update`. It is never
  committed (gitignored) and is `chmod 600`, owned by `foru`.
- **Non-Debian distros:** install Node 20+ and git yourself, then adapt the
  unit files in `systemd/` — the logic is otherwise distro-agnostic.
