# Markdown Notes (Full Stack) — Production (Nginx) Setup

This project is a simple full-stack **Markdown notes** app:

- **Backend:** Node.js + Express + SQLite
- **Auth:** HTTP Basic Auth backed by an **htpasswd** file (APR1 / Apache MD5)
- **Frontend:** React + Vite + Tailwind, Markdown preview
- **Production:** Nginx serves the built frontend and proxies `/api/*` to the backend on **localhost:4000**

## Quick start

### 1) Backend (runs on localhost:4000)
```bash
cd server
cp .env.example .env
npm install
npm run dev
```

### 2) Frontend build (static)
```bash
cd ../client
npm install
npm run build
```

### 3) Nginx
Use the provided config template:
- `deploy/nginx-notes.conf`

It serves:
- static frontend from `client/dist`
- API reverse proxy to `http://127.0.0.1:4000` (localhost)

## Files of interest
- `deploy/SETUP_NGINX_HTTPS.md` — step-by-step Nginx + Let’s Encrypt tutorial
- `deploy/nginx-notes.conf` — Nginx site config (static + proxy)
- `deploy/run-prod.sh` — helper script (build frontend + start backend via PM2)

## Notes
- In production, the frontend calls the API via **relative paths** (`/api/...`), so no domain is hardcoded.
- Nginx talks to the backend using **localhost** (127.0.0.1), which matches your request.
