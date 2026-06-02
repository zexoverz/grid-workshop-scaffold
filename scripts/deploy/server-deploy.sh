#!/usr/bin/env bash
# Runs ON the target VM. Pulls a specific git ref of grid-workshop-scaffold,
# replaces ~/scaffold (preserving .env), runs npm install, restarts services,
# and health-checks every port.
#
# Inputs (env vars):
#   REF — git SHA or branch name (default: master)
#
# Invocation from CI (or first-time setup):
#   ssh user@vm "REF='<sha>' bash -s" < scripts/deploy/server-deploy.sh
# or one-shot from the server itself:
#   curl -fsSL https://raw.githubusercontent.com/zexoverz/grid-workshop-scaffold/master/scripts/deploy/server-deploy.sh | REF=master bash

set -euo pipefail
export PATH="$HOME/bin:$PATH"

REF="${REF:-master}"
TS=$(date -u +%Y%m%d-%H%M%S)
LOG_DIR="$HOME/scaffold/logs"
mkdir -p "$LOG_DIR"
LOG="$LOG_DIR/deploy-$TS.log"

exec > >(tee -a "$LOG") 2>&1

echo "=== deploy $TS ref=$REF ==="

cd "$HOME"

if [ -f scaffold/.env ]; then
  cp scaffold/.env /tmp/scaffold.env.bak
  echo "preserved .env"
fi

rm -rf scaffold.new grid-workshop-scaffold-*
curl -fsSL "https://github.com/zexoverz/grid-workshop-scaffold/archive/${REF}.tar.gz" -o /tmp/scaffold.tar.gz
tar -xzf /tmp/scaffold.tar.gz -C "$HOME"
mv grid-workshop-scaffold-* scaffold.new

if [ -f /tmp/scaffold.env.bak ]; then
  cp /tmp/scaffold.env.bak scaffold.new/.env
fi

if [ -d scaffold ]; then
  mv scaffold "scaffold.bak.$TS"
fi
mv scaffold.new scaffold

# Retain only the 3 most recent backups.
ls -dt "$HOME"/scaffold.bak.* 2>/dev/null | tail -n +4 | xargs -r rm -rf

cd "$HOME/scaffold"
echo "npm install ..."
npm install --no-audit --no-fund --loglevel=error

echo "restarting services ..."
bash "$HOME/scaffold/scripts/deploy/launch.sh"

# Health checks — retry with backoff. tsx needs ~10-20s to compile on a cold start.
echo "=== health (max 60s per port) ==="
all_ok=1
for p in 5599 8080 8081 8082 8083 8084; do
  ok=0
  for attempt in $(seq 1 30); do
    if curl -fsS --max-time 3 "http://127.0.0.1:$p/health" >/dev/null 2>&1; then
      printf "  %-5s OK after %ds\n" "$p" "$((attempt * 2))"
      ok=1
      break
    fi
    sleep 2
  done
  if [ "$ok" = "0" ]; then
    printf "  %-5s FAIL (60s timeout)\n" "$p"
    all_ok=0
  fi
done

echo "=== deploy done ==="
[ "$all_ok" = "1" ]
