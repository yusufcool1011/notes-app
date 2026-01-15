# Nginx + HTTPS (Let’s Encrypt) Setup (Ubuntu / Debian)

This guide assumes:
- Your backend is running on **localhost:4000**
- Your built frontend is in **/var/www/markdown-notes/client/dist**
- Your domain is **notes.yourdomain.com**

## 1) DNS
Create an **A record**:
- `notes.yourdomain.com` -> your server IP

## 2) Install Nginx
```bash
sudo apt update
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

## 3) Copy the app to /var/www
Example:
```bash
sudo mkdir -p /var/www/markdown-notes
sudo rsync -a --delete ./ /var/www/markdown-notes/
```

Build the frontend:
```bash
cd /var/www/markdown-notes/client
npm ci || npm install
npm run build
```

Start backend (recommended: PM2)
```bash
cd /var/www/markdown-notes/server
npm ci || npm install
npm run pm2:start
```

## 4) Configure Nginx
Copy and edit the provided config:
```bash
sudo cp /var/www/markdown-notes/deploy/nginx-notes.conf /etc/nginx/sites-available/notes
sudo nano /etc/nginx/sites-available/notes
```

Update:
- `server_name notes.yourdomain.com;`
- `root /var/www/markdown-notes/client/dist;`

Enable the site:
```bash
sudo ln -sf /etc/nginx/sites-available/notes /etc/nginx/sites-enabled/notes
sudo nginx -t
sudo systemctl reload nginx
```

Confirm HTTP works:
- `http://notes.yourdomain.com/`
- `http://notes.yourdomain.com/health` (proxied to backend)

## 5) HTTPS with Let’s Encrypt
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d notes.yourdomain.com
```

Choose redirect to HTTPS when prompted.

## 6) Auto-renew
Certbot typically installs a timer automatically. You can verify:
```bash
systemctl list-timers | grep certbot
```

## 7) Security tips
- Keep the backend bound to localhost only (default in this repo: listens on all interfaces but Nginx is the public entrypoint).
- Use strong passwords (Basic Auth credentials are sent with each request, but encrypted by HTTPS).
- Consider adding rate limiting in Nginx for `/api/` endpoints if public-facing.
