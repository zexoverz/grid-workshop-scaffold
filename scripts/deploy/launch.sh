#!/usr/bin/env bash
# Boots the mock server + all 5 archetypes via nohup. Designed for a single-VM
# deploy where systemd/pm2 aren't available (or wanted). Re-runnable: kills the
# previous instances first, then respawns. Logs to <repo>/logs/<service>.log.

set -u
export PATH="$HOME/bin:$PATH"

SCAFFOLD_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$SCAFFOLD_DIR"
mkdir -p logs

# Kill prior tsx workers under this scaffold dir only (not unrelated node processes).
pkill -f "$SCAFFOLD_DIR/node_modules/.bin/tsx" 2>/dev/null || true
sleep 1

# Mock server — bound to 127.0.0.1:5599 (not exposed externally).
nohup npm run mocks:serve </dev/null >logs/mocks.log 2>&1 &
echo "mocks pid=$!"
sleep 3

declare -a SVCS=(
  "A-head-of-research:8080"
  "B-customer-success-lead:8081"
  "C-chief-strategist:8082"
  "D-operations-officer:8083"
  "E-head-trader:8084"
)
for svc in "${SVCS[@]}"; do
  name=${svc%:*}
  port=${svc#*:}
  (
    cd "archetypes/$name" || exit 1
    PORT="$port" nohup npm start </dev/null >"../../logs/$name.log" 2>&1 &
    echo "$name pid=$!"
  )
done

sleep 5
ps -eo pid,cmd | grep -E "tsx" | grep -v grep | head -20 || true
