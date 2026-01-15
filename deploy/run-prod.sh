#!/usr/bin/env bash
set -euo pipefail

# Helper script for a single-machine deployment:
# - installs deps
# - builds frontend
# - starts backend with PM2

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Installing server deps"
cd "$ROOT_DIR/server"
npm ci || npm install

echo "==> Installing client deps"
cd "$ROOT_DIR/client"
npm ci || npm install

echo "==> Building client"
npm run build

echo "==> Starting backend via PM2"
cd "$ROOT_DIR/server"
npm run pm2:start

echo ""
echo "Done."
echo "Frontend build is at: $ROOT_DIR/client/dist"
echo "Backend should be running on: http://127.0.0.1:4000"
