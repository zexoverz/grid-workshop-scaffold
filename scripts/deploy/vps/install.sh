#!/usr/bin/env bash
#
# FORU Grid — one-shot VPS bootstrap (systemd edition).
#
# Brings a bare Ubuntu/Debian VPS to a fully running scaffold:
#   - installs Node 20 + git (if missing)
#   - creates a locked-down `foru` system user
#   - clones the scaffold into /opt/foru-grid/scaffold
#   - writes a sane .env (mock URLs -> loopback, PORT handled per-service)
#   - installs systemd units (mock server + 5 archetypes + a grouping target)
#   - opens TCP 8080-8084 in the firewall (mock 5599 stays loopback-only)
#   - enables everything on boot, starts it, and health-checks every port
#
# Idempotent: safe to re-run. Existing .env is preserved.
#
# Usage (on the VPS, as a sudo-capable user):
#   curl -fsSL https://raw.githubusercontent.com/zexoverz/grid-workshop-scaffold/master/scripts/deploy/vps/install.sh | sudo bash
# or, from a checkout:
#   sudo bash scripts/deploy/vps/install.sh
#
# Optional env overrides:
#   REF=<branch|sha>      git ref to deploy        (default: master)
#   LLM_API_KEY=sk-...    seed the OpenAI key into .env (default: left blank)
#   AGENT_RUNTIME=openai|codebuddy                  (default: openai)
#   REPO_URL=...          fork URL                 (default: canonical repo)

set -euo pipefail

# ---- config ---------------------------------------------------------------
APP_USER="foru"
APP_HOME="/opt/foru-grid"
REPO_DIR="$APP_HOME/scaffold"
ETC_DIR="/etc/foru-grid"
REF="${REF:-master}"
REPO_URL="${REPO_URL:-https://github.com/zexoverz/grid-workshop-scaffold.git}"
NODE_MAJOR=20

# folder:port — the single source of truth for the service set.
SERVICES=(
  "A-head-of-research:8080"
  "B-customer-success-lead:8081"
  "C-chief-strategist:8082"
  "D-operations-officer:8083"
  "E-head-trader:8084"
)

log()  { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[warn]\033[0m %s\n' "$*"; }
die()  { printf '\033[1;31m[fail]\033[0m %s\n' "$*" >&2; exit 1; }

# Interactive AI-runtime selector. Populates AGENT_RUNTIME / LLM_API_KEY /
# CODEBUDDY_API_KEY. Order of precedence:
#   1. values already passed as env vars  -> used as-is, no prompt
#   2. a terminal is reachable (/dev/tty) -> ask which provider + key
#   3. neither (CI / headless pipe)       -> leave blank, warn
select_runtime() {
  # Already configured via env? Respect it and skip the menu.
  if [ -n "${LLM_API_KEY:-}" ] || [ -n "${CODEBUDDY_API_KEY:-}" ]; then
    AGENT_RUNTIME="${AGENT_RUNTIME:-openai}"
    [ -n "${CODEBUDDY_API_KEY:-}" ] && [ -z "${LLM_API_KEY:-}" ] && AGENT_RUNTIME="codebuddy"
    log "AI runtime from env: AGENT_RUNTIME=$AGENT_RUNTIME"
    return
  fi

  # No TTY (e.g. plain `curl | bash` with no terminal) -> can't prompt.
  if [ ! -r /dev/tty ]; then
    AGENT_RUNTIME="${AGENT_RUNTIME:-openai}"
    warn "No terminal to prompt on. Pass LLM_API_KEY=... (or CODEBUDDY_API_KEY=...) when running, or edit .env after."
    return
  fi

  echo                                          > /dev/tty
  echo "  Which AI runtime should the archetypes use?" > /dev/tty
  echo "    1) OpenAI      (sk-…)   — default, fastest"  > /dev/tty
  echo "    2) CodeBuddy   (ck-…)   — Tencent Agent SDK" > /dev/tty
  echo "    3) Skip        — leave blank, edit .env later (only archetype D runs without a key)" > /dev/tty
  printf "  Select [1-3] (default 1): " > /dev/tty
  read -r choice < /dev/tty || choice=1
  case "${choice:-1}" in
    2)
      AGENT_RUNTIME="codebuddy"
      printf "  Paste your CodeBuddy key (ck-…): " > /dev/tty
      read -rs CODEBUDDY_API_KEY < /dev/tty; echo > /dev/tty ;;
    3)
      AGENT_RUNTIME="${AGENT_RUNTIME:-openai}"
      warn "Skipped — only archetype D will work until you set a key in .env." ;;
    *)
      AGENT_RUNTIME="openai"
      printf "  Paste your OpenAI key (sk-…): " > /dev/tty
      read -rs LLM_API_KEY < /dev/tty; echo > /dev/tty ;;
  esac
}

# ---- 0. re-exec under root ------------------------------------------------
if [ "$(id -u)" -ne 0 ]; then
  log "re-running with sudo ..."
  exec sudo -E bash "$0" "$@"
fi

command -v apt-get >/dev/null 2>&1 || \
  die "this installer targets Debian/Ubuntu (apt). For other distros, install Node ${NODE_MAJOR}+ and git, then adapt the systemd units in scripts/deploy/vps/systemd/."

# ---- 1. base packages -----------------------------------------------------
log "installing base packages (git, curl, ca-certificates) ..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq git curl ca-certificates >/dev/null

# ---- 2. Node 20 -----------------------------------------------------------
need_node=1
if command -v node >/dev/null 2>&1; then
  current="$(node -v | sed 's/v\([0-9]*\).*/\1/')"
  [ "$current" -ge "$NODE_MAJOR" ] && need_node=0
fi
if [ "$need_node" -eq 1 ]; then
  log "installing Node ${NODE_MAJOR} via NodeSource ..."
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash - >/dev/null
  apt-get install -y -qq nodejs >/dev/null
else
  log "Node $(node -v) already present — skipping."
fi

# ---- 3. service user ------------------------------------------------------
if ! id "$APP_USER" >/dev/null 2>&1; then
  log "creating system user '$APP_USER' ..."
  useradd --system --create-home --home-dir "$APP_HOME" --shell /usr/sbin/nologin "$APP_USER"
else
  log "user '$APP_USER' already exists — skipping."
fi
mkdir -p "$APP_HOME" "$ETC_DIR"
chown "$APP_USER:$APP_USER" "$APP_HOME"

# ---- 4. fetch / update the repo ------------------------------------------
if [ -d "$REPO_DIR/.git" ]; then
  log "updating existing checkout to '$REF' ..."
  sudo -u "$APP_USER" git -C "$REPO_DIR" fetch --depth 1 origin "$REF"
  sudo -u "$APP_USER" git -C "$REPO_DIR" checkout -q FETCH_HEAD
else
  log "cloning $REPO_URL -> $REPO_DIR ..."
  sudo -u "$APP_USER" git clone --depth 1 --branch "$REF" "$REPO_URL" "$REPO_DIR" 2>/dev/null \
    || sudo -u "$APP_USER" git clone "$REPO_URL" "$REPO_DIR"
  sudo -u "$APP_USER" git -C "$REPO_DIR" checkout -q "$REF" 2>/dev/null || true
fi

# ---- 5. .env --------------------------------------------------------------
ENV_FILE="$REPO_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
  select_runtime
  log "creating .env from .env.example ..."
  sudo -u "$APP_USER" cp "$REPO_DIR/.env.example" "$ENV_FILE"
  # Point the four mock sources at the loopback mock server.
  sed -i -E 's#^(MOCK_[A-Z]+_URL)=.*#\1=http://127.0.0.1:5599#' "$ENV_FILE"
  # PORT is owned by systemd (per-service .port files); blank it here so a
  # stale value can never override the per-instance port.
  sed -i -E 's/^PORT=.*/PORT=/' "$ENV_FILE"
  sed -i -E "s/^AGENT_RUNTIME=.*/AGENT_RUNTIME=${AGENT_RUNTIME:-openai}/" "$ENV_FILE"
  if [ -n "${LLM_API_KEY:-}" ]; then
    sed -i -E "s#^LLM_API_KEY=.*#LLM_API_KEY=${LLM_API_KEY}#" "$ENV_FILE"
    log "seeded OpenAI key into .env (AGENT_RUNTIME=openai)"
  elif [ -n "${CODEBUDDY_API_KEY:-}" ]; then
    sed -i -E "s#^CODEBUDDY_API_KEY=.*#CODEBUDDY_API_KEY=${CODEBUDDY_API_KEY}#" "$ENV_FILE"
    log "seeded CodeBuddy key into .env (AGENT_RUNTIME=codebuddy)"
  else
    warn "No AI key set in $ENV_FILE — archetypes A/B/C/E need one. (D works without.)"
  fi
  chown "$APP_USER:$APP_USER" "$ENV_FILE"
  chmod 600 "$ENV_FILE"
else
  log ".env already present — leaving it untouched. (Change the AI runtime later with: foructl runtime)"
fi

# ---- 6. dependencies ------------------------------------------------------
log "npm install (workspaces) ..."
sudo -u "$APP_USER" bash -lc "cd '$REPO_DIR' && npm install --no-audit --no-fund --loglevel=error"

# ---- 7. systemd units -----------------------------------------------------
log "installing systemd units ..."
UNIT_SRC="$REPO_DIR/scripts/deploy/vps/systemd"
install -m 644 "$UNIT_SRC/foru-mock.service"        /etc/systemd/system/foru-mock.service
install -m 644 "$UNIT_SRC/foru-archetype@.service"  /etc/systemd/system/foru-archetype@.service
install -m 644 "$UNIT_SRC/foru-grid.target"         /etc/systemd/system/foru-grid.target

# Per-instance PORT files consumed by the templated unit.
for svc in "${SERVICES[@]}"; do
  name="${svc%:*}"; port="${svc#*:}"
  printf 'PORT=%s\n' "$port" > "$ETC_DIR/${name}.port"
done

# Convenience maintenance CLI.
install -m 755 "$REPO_DIR/scripts/deploy/vps/foructl" /usr/local/bin/foructl

systemctl daemon-reload

log "enabling + starting services ..."
systemctl enable -q foru-grid.target foru-mock.service
for svc in "${SERVICES[@]}"; do
  systemctl enable -q "foru-archetype@${svc%:*}.service"
done
systemctl restart foru-mock.service
for svc in "${SERVICES[@]}"; do
  systemctl restart "foru-archetype@${svc%:*}.service"
done

# ---- 8. firewall ----------------------------------------------------------
log "opening firewall ports 8080-8084 ..."
if command -v ufw >/dev/null 2>&1 && ufw status 2>/dev/null | grep -q "Status: active"; then
  ufw allow 8080:8084/tcp >/dev/null && log "ufw: allowed 8080:8084/tcp"
elif command -v firewall-cmd >/dev/null 2>&1 && firewall-cmd --state >/dev/null 2>&1; then
  firewall-cmd --permanent --add-port=8080-8084/tcp >/dev/null
  firewall-cmd --reload >/dev/null && log "firewalld: allowed 8080-8084/tcp"
else
  warn "No active ufw/firewalld detected. If your host has a firewall, open TCP 8080-8084."
fi
warn "Cloud provider firewall (AWS SG / GCP / DO / Hetzner) is SEPARATE — open 8080-8084 there too."

# ---- 9. health check ------------------------------------------------------
log "health check (up to 60s per port) ..."
all_ok=1
for p in 5599 8080 8081 8082 8083 8084; do
  ok=0
  for attempt in $(seq 1 30); do
    if curl -fsS --max-time 3 "http://127.0.0.1:$p/health" >/dev/null 2>&1; then
      printf '  \033[1;32m✓\033[0m %-5s up after %ss\n' "$p" "$((attempt*2))"; ok=1; break
    fi
    sleep 2
  done
  [ "$ok" -eq 0 ] && { printf '  \033[1;31m✗\033[0m %-5s did not come up (check: foructl logs)\n' "$p"; all_ok=0; }
done

PUBLIC_IP="$(curl -fsS --max-time 5 https://ifconfig.me 2>/dev/null || echo '<your-vps-ip>')"
echo
log "done."
echo "  Public consoles (once the cloud firewall is open):"
for svc in "${SERVICES[@]}"; do
  printf '    %-26s http://%s:%s\n' "${svc%:*}" "$PUBLIC_IP" "${svc#*:}"
done
echo
echo "  Maintain it:   foructl status | logs [A|mock] | restart | update | health"
echo "  Register on Grid: getting-started.md §11  (use http://$PUBLIC_IP:<port>/invoke)"
[ "$all_ok" -eq 1 ] || die "one or more services failed — run 'foructl logs' to see why."
