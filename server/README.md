# kvenno.app Backend Server

Express.js backend for kvenno.app. Handles lab report analysis (Claude API proxy), DOCX-to-PDF conversion, and Íslenskubraut PDF generation. Part of the [kvenno-app monorepo](../README.md).

## Quick Start

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
nano .env
```

Set your `ANTHROPIC_API_KEY` and other variables.

### 3. Test Locally

```bash
npm start
```

Server runs on http://127.0.0.1:8000 (the process binds loopback only — `server/src/index.ts:31,736`).

## Production Deployment (Ubuntu 24.04)

> **Partly historical.** `docs/DEPLOYMENT.md` is the accurate, maintained deployment
> reference — use it for the real paths, the systemd unit and the deploy sequence.
> The steps below still describe the old `/var/www/labreports` layout. The backend
> is deployed to `/opt/kvenno-server` by `scripts/deploy.sh` and runs from the
> checked-in unit `server/kvenno-backend.service`. Ports, health checks and nginx
> details in this file were corrected against source on 2026-08-17.

### Prerequisites

1. **Node.js 22+** installed (`package.json` declares `"engines": { "node": ">=22.0.0" }`; production runs 22.x — see `docs/DEPLOYMENT.md` § Server runtime)
2. **nginx** installed
3. **pandoc** installed (`sudo apt install pandoc`)
4. **systemd** for process management (built into Ubuntu)

### Step-by-Step Setup

#### 1. Deploy Application Files

```bash
# Create directory
sudo mkdir -p /var/www/labreports

# Copy files (from your local machine or git)
sudo git clone https://github.com/SigurdurVilhelmsson/kvenno-app.git /var/www/labreports

# Set ownership
sudo chown -R www-data:www-data /var/www/labreports
```

#### 2. Build Frontend

```bash
cd /var/www/labreports
sudo -u www-data npm install
sudo -u www-data npm run build
```

This creates the `dist/` directory with static files.

#### 3. Setup Backend Server

```bash
cd /var/www/labreports/server
sudo -u www-data npm install

# Create environment file
sudo -u www-data cp .env.example .env
sudo nano .env
```

Edit `.env`:

```bash
ANTHROPIC_API_KEY=sk-ant-your-actual-key
PORT=8000
NODE_ENV=production
FRONTEND_URL=https://www.kvenno.app
```

`PORT=8000` is load-bearing: `server/nginx-site.conf:60-61` proxies `/api/` to
`http://localhost:8000`, so any other value makes every `/api/` call return 502.
`server/.env.example` already ships the correct value.

#### 4. Configure nginx

```bash
# Copy nginx configuration
sudo cp nginx-site.conf /etc/nginx/sites-available/kvenno.app

# Enable site
sudo ln -s /etc/nginx/sites-available/kvenno.app /etc/nginx/sites-enabled/

# Remove default site (if present)
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

`nginx -t` validates the files on disk, not what the running process is serving —
so a passing test says nothing about whether your change is live. After reloading,
give it a moment before verifying: nginx keeps its old workers alive until their
connections drain, so a request issued in the same breath as the reload can still
be answered by the old config.

Note also that `scripts/deploy.sh` never touches nginx configuration. Changes to
`nginx-site.conf` reach production only by being copied here by hand.

#### 5. Setup systemd Service

The unit is checked in at `server/kvenno-backend.service` — install that file, do
not hand-write one. There is no `labreports.service` in this repo. The service
name is `kvenno-backend`; substitute it for `labreports` in the commands further
down this file.

```bash
# Copy service file
sudo cp server/kvenno-backend.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable service (start on boot)
sudo systemctl enable kvenno-backend

# Start service
sudo systemctl start kvenno-backend

# Check status
sudo systemctl status kvenno-backend
```

#### 6. Setup SSL with Let's Encrypt (Recommended)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate. Domain order matters: certbot names the lineage after the
# FIRST -d, and nginx-site.conf points at /etc/letsencrypt/live/kvenno.app/.
sudo certbot --nginx --cert-name kvenno.app -d kvenno.app -d www.kvenno.app

# Test auto-renewal — this is the check that matters; it proves the systemd
# timer will succeed unattended for the next 90 days.
sudo certbot renew --dry-run
```

Certbot will automatically update your nginx configuration with SSL.

##### Renewing

Renewal is automatic via certbot's systemd timer. To renew by hand:

```bash
sudo certbot renew
```

**Never renew by re-running the issuance command without `--cert-name`.** Certbot
will create a second lineage — `kvenno.app-0001` — write the new certificate
there, and leave nginx serving the old expiring one from
`/etc/letsencrypt/live/kvenno.app/`. The site stays broken and the cause is
invisible from the config.

If renewal fails with **"Could not bind TCP port 80 because it is already in use
by another process"**, the lineage is using the `standalone` authenticator, which
starts its own web server on port 80 and cannot coexist with a running nginx.
Check with:

```bash
sudo grep -E "authenticator|installer" /etc/letsencrypt/renewal/kvenno.app.conf
```

Fix it by switching the lineage to the `nginx` authenticator, which validates
through the running nginx with no downtime and persists the change to the
renewal config:

```bash
sudo certbot certonly --nginx --cert-name kvenno.app \
  -d kvenno.app -d www.kvenno.app
sudo nginx -t && sudo systemctl reload nginx
sudo certbot renew --dry-run
```

*(This happened in production on 2026-08-27: the lineage had been on `standalone`
with no pre/post hooks, so every automatic renewal had been failing silently
against a running nginx.)*

The `webroot` authenticator is also viable — `nginx-site.conf` serves
`/.well-known/acme-challenge/` from `/var/www/certbot` for it — but that
directory must exist and be readable by nginx first:

```bash
sudo mkdir -p /var/www/certbot && sudo chown www-data:www-data /var/www/certbot
```

Do **not** point the challenge webroot at `/var/www/kvenno.app`: `scripts/deploy.sh`
rsyncs that directory with `--delete`, so a deploy during a renewal would erase the
challenge token. Note also that the HTTPS server block ends in
`location / { try_files $uri /index.html; }`, so a missing file there returns the
SPA shell with HTTP 200 rather than a 404 — a misconfigured webroot challenge
fails by handing Let's Encrypt a page of HTML with a success status.

To verify a renewal actually reached the browser (run from a machine outside the
server, since nginx must be reloaded before it serves the new certificate):

```bash
echo | openssl s_client -connect kvenno.app:443 -servername kvenno.app 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates -ext subjectAltName
```

Check `notAfter` is ~90 days out and that the SAN list covers **both**
`kvenno.app` and `www.kvenno.app` — a certificate missing the `www` SAN fails for
half the people who type the address.

### Verify Deployment

1. **Check backend is running** — must be run **on the host** and **with an
   `Origin` header** (nginx proxies `/api/` only, so no public URL reaches
   `/health`; and in production the CORS middleware rejects requests with no
   `Origin` — `server/src/index.ts:63-69`):

   ```bash
   ssh siggi@kvenno.app \
     "curl -s -H 'Origin: https://kvenno.app' http://127.0.0.1:8000/health"
   ```

   Should return: `{"status":"ok","timestamp":"..."}`

2. **Check frontend is accessible:**

   ```bash
   curl http://localhost
   ```

   Should return HTML content.

3. **There is no `/api/health` endpoint — do not health-check from outside.**
   The only health route is `app.get('/health')` (`server/src/index.ts:113`), and
   nginx proxies the `/api/` prefix _without_ stripping it, so a request for
   `/api/health` arrives at the backend as `/api/health` and 404s. A public
   request for `https://kvenno.app/health` is worse: it is not under `/api/`, so
   it falls through to `try_files $uri /index.html` and returns the SPA with
   HTTP 200 **even when the backend is completely down**. Never use a public URL
   as a health signal — use the loopback check in step 1, which is what
   `scripts/deploy.sh:89-90` does.

## Troubleshooting

### Service won't start

```bash
# Check logs
sudo journalctl -u labreports -n 50 --no-pager

# Check if port is in use
sudo netstat -tulpn | grep 8000
```

### 502 Bad Gateway

- Backend server is not running
- Check: `sudo systemctl status labreports`
- Restart: `sudo systemctl restart labreports`

### 405 Method Not Allowed

- nginx is not proxying to backend
- Check nginx configuration: `sudo nginx -t`
- Check proxy_pass URL in nginx config

### Pandoc not found

```bash
# Install pandoc
sudo apt update
sudo apt install pandoc

# Verify
pandoc --version

# Restart service
sudo systemctl restart labreports
```

### Permission errors

```bash
# Fix ownership
sudo chown -R www-data:www-data /var/www/labreports

# Fix permissions
sudo chmod 755 /var/www/labreports
sudo chmod 644 /var/www/labreports/server/.env
```

### CORS errors

Check that your frontend URL is in the allowed origins list at
`server/src/index.ts:47-52`:

```typescript
const allowedOrigins: (string | undefined)[] = [
  'https://kvenno.app',
  'https://www.kvenno.app',
  process.env.FRONTEND_URL,
];
```

Setting `FRONTEND_URL` in `.env` is the supported way to add a domain. Note that
in production the same middleware rejects requests with **no** `Origin` header
(`server/src/index.ts:63-69` — the origin callback errors out), which is why
`curl` health checks must pass one.

## Updating the Application

```bash
# Navigate to app directory
cd /var/www/labreports

# Pull latest changes
sudo -u www-data git pull

# Update frontend
sudo -u www-data npm install
sudo -u www-data npm run build

# Update backend
cd server
sudo -u www-data npm install

# Restart backend service
sudo systemctl restart labreports

# Reload nginx (if config changed)
sudo systemctl reload nginx
```

## Monitoring

### View logs

```bash
# Backend logs
sudo journalctl -u labreports -f

# nginx access logs
sudo tail -f /var/log/nginx/access.log

# nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Check service status

```bash
# Backend service
sudo systemctl status labreports

# nginx
sudo systemctl status nginx

# Disk usage
df -h

# Memory usage
free -h
```

## Security Recommendations

1. **Firewall**: Only allow ports 80, 443, and SSH

   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 22/tcp
   sudo ufw enable
   ```

2. **Keep system updated**:

   ```bash
   sudo apt update && sudo apt upgrade
   ```

3. **Secure .env file**:

   ```bash
   sudo chmod 600 /var/www/labreports/server/.env
   sudo chown www-data:www-data /var/www/labreports/server/.env
   ```

4. **Monitor logs** for suspicious activity

5. **Backup regularly**:
   - Database (if you add one)
   - Environment configuration
   - Application code

## Process Management with systemd

The production backend uses systemd (NOT PM2). The service is managed as follows:

**Service name:** `kvenno-backend`
**Service file:** `/etc/systemd/system/kvenno-backend.service` (install the
checked-in `server/kvenno-backend.service`; do not hand-write one)
**Backend location:** `/opt/kvenno-server/` (`scripts/deploy.sh`), started as
`/usr/bin/node dist/index.js` from that working directory

### systemd Commands

```bash
# Check status
sudo systemctl status kvenno-backend

# Start the service
sudo systemctl start kvenno-backend

# Stop the service
sudo systemctl stop kvenno-backend

# Restart (use after code changes)
sudo systemctl restart kvenno-backend

# Enable auto-start on boot
sudo systemctl enable kvenno-backend

# View logs
sudo journalctl -u kvenno-backend -n 100

# Follow logs in real-time
sudo journalctl -u kvenno-backend -f
```

### Service File Example

> **Superseded — do not copy this block.** The real unit is checked in at
> `server/kvenno-backend.service`; install that file. It differs from the
> illustration below on every path: `WorkingDirectory=/opt/kvenno-server`,
> `ExecStart=/usr/bin/node dist/index.js`, an `EnvironmentFile=`, and a systemd
> hardening stanza (`NoNewPrivileges`, `ProtectSystem=strict`, `ProtectHome`,
> `PrivateTmp`, `PrivateDevices`, `ProtectKernel*`, `RestrictSUIDSGID`,
> `ReadWritePaths=/tmp`). There is no `server.js` and no
> `/var/www/kvenno.app/backend` — the backend is compiled TypeScript
> (`server/src/index.ts` → `server/dist/index.js`). See `docs/DEPLOYMENT.md`
> § Backend (systemd). Kept below only as a record of the earlier layout.

Location: `/etc/systemd/system/kvenno-backend.service`

```ini
[Unit]
Description=Kvenno.app Backend API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/kvenno.app/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node /var/www/kvenno.app/backend/server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=kvenno-backend

[Install]
WantedBy=multi-user.target
```

After creating or modifying the service file:

```bash
sudo systemctl daemon-reload
sudo systemctl enable kvenno-backend
sudo systemctl start kvenno-backend
```

## Performance Tips

1. **Enable nginx caching** for static assets (already configured)
2. **Use gzip compression** (already configured)
3. **Monitor memory usage**: `htop`
4. **Set up log rotation** for nginx logs
5. **Consider adding Redis** for session storage if you add user accounts

## Development

### Local development

```bash
cd server
npm run dev
```

Runs `tsx watch src/index.ts` (`server/package.json`), auto-restarting on
changes and running the TypeScript sources directly — no build step needed.
`npm start` is the production form and runs the compiled `dist/index.js`.

### Testing API endpoints

```bash
# Health check (dev only — production rejects requests with no Origin header)
curl http://localhost:8000/health

# Test analyze endpoint (requires actual frontend or curl with JSON)
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"content":"test","systemPrompt":"test","mode":"teacher"}'
```

## Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTPS
       ↓
┌─────────────┐
│   nginx     │ (Port 80/443)
│  - Static   │
│  - Proxy    │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  Express.js │ (Port 8000)
│  - /api/*   │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│ Anthropic   │
│    API      │
└─────────────┘
```

## Configuration

### Token Limits

The backend uses `max_tokens: 8192` for Claude API calls (both teacher and student modes). This was increased from 2000 to prevent response truncation for complex reports.

**Location**: `server/src/index.ts:485` (`/api/analyze`) and `:605`
(`/api/analyze-2ar`) — two call sites, both must be changed together.

```typescript
max_tokens: 8192,  // Increased to handle complex reports without truncation
```

**Why 8192?**

- Handles detailed feedback for long reports (8+ pages)
- Prevents JSON truncation mid-response
- Supports multiple sections with reasoning
- Accommodates both teacher and student mode requirements

**Environment Variable** (Optional):
You can make this configurable by adding to `.env`:

```bash
MAX_TOKENS=8192
```

Then in code:

```javascript
max_tokens: parseInt(process.env.MAX_TOKENS || '8192', 10),
```

### Debug Logging

The backend includes enhanced logging for troubleshooting API responses:

**Location**: `server/src/index.ts:526-539`

```typescript
console.log('[Analysis] Response received:', {
  stopReason: data.stop_reason,
  textLength: textContent.length,
  textPreview: textContent.substring(0, 200),
  textEnd: textContent.substring(textContent.length - 200),
  usage: data.usage,
  cacheCreated: data.usage?.cache_creation_input_tokens || 0,
  cacheHit: data.usage?.cache_read_input_tokens || 0,
});
```

**What's Logged**:

- `stopReason`: Why Claude stopped generating (e.g., "end_turn", "max_tokens")
- `textLength`: Character count of response
- `textPreview`: First 200 characters
- `textEnd`: Last 200 characters (helpful for truncation detection)
- `usage`: Token usage statistics (input_tokens, output_tokens)
- `cacheCreated` / `cacheHit`: prompt-cache tokens written and read

**When to Check Logs**:

- Responses seem incomplete
- JSON parsing errors occur
- Want to monitor token usage
- Debugging timeout issues

**View Logs**:

```bash
sudo journalctl -u kvenno-backend -n 100
```

**Filter for Analysis Logs**:

```bash
sudo journalctl -u kvenno-backend | grep "\[Analysis\]"
```

### Timeouts

**Analyze Endpoint**: 85 seconds (90s limit with 5s buffer)

- Generous timeout for processing 8+ reports simultaneously
- Anthropic API typically responds in 30-60 seconds per report
- Adjust if needed in `server/src/index.ts:470` (`/api/analyze`) and `:593`
  (`/api/analyze-2ar`)

**Process Document Endpoint**: 30 seconds

- Sufficient for .docx → PDF conversion via LibreOffice
- Includes pandoc equation extraction
- Adjust if needed in `server/src/index.ts:162` (the LibreOffice `execFile`
  timeout)

### nginx Buffering

**Important**: For large API responses (8192 token responses), nginx must have proper buffering:

```nginx
# In /etc/nginx/sites-available/kvenno.app
location /api/ {
    proxy_buffering on;  # MUST be "on" for large responses
    proxy_buffer_size 16k;
    proxy_buffers 8 16k;
    proxy_busy_buffers_size 32k;
    proxy_pass http://localhost:8000;
}
```

Without proper buffering, responses may be truncated mid-JSON.

## Support

For issues, check:

1. System logs: `sudo journalctl -u labreports`
2. nginx logs: `/var/log/nginx/`
3. Application logs in stdout/stderr

For more help, open an issue on GitHub: https://github.com/SigurdurVilhelmsson/kvenno-app/issues
