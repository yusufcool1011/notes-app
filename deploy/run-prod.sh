#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "🚀 Starting Markdown Notes App (Codespaces mode)"

# -------------------
# Backend
# -------------------
echo "🔧 Starting backend on port 4000"
cd "$ROOT_DIR/server"

if [ ! -d node_modules ]; then
  npm install
fi

pm2 start index.js --name notes-api || pm2 restart notes-api
pm2 save

# -------------------
# Frontend
# -------------------
echo "🎨 Building frontend"
cd "$ROOT_DIR/client"

if [ ! -d node_modules ]; then
  npm install
fi

npm run build

echo "🌍 Serving frontend on port 8080"
echo "👉 Open the forwarded port 8080 in Codespaces"

# Vite preview binds to 0.0.0.0 so Codespaces can expose it
npm run preview -- --host 0.0.0.0 --port 8080
