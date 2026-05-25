#!/usr/bin/env bash
# Convenience wrapper — same effect as `npx foru submit` from repo root.
set -euo pipefail
cd "$(dirname "$0")/../.."
npx foru submit
