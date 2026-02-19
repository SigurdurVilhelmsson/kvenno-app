# Deployment Guide - kvenno.app

## Prerequisites

### Local
- Node.js >= 18.0.0
- pnpm >= 8.0.0
- SSH access to production server

### Server
- Ubuntu 24.04
- nginx
- Node.js >= 18.0.0
- pandoc (for .docx equation extraction)
- libreoffice (for .docx → PDF conversion)
- systemd (for backend process management)

## Build

```bash
pnpm install    # Install all dependencies
pnpm build      # Build everything to dist/
```

The build script (`scripts/build-all.mjs`) orchestrates:
1. Landing app → `dist/` (root + year hubs)
2. 17 games → `dist/[year]/games/[game].html`
3. Lab reports × 2 → `dist/2-ar/lab-reports/` and `dist/3-ar/lab-reports/`
4. Media assets → `dist/media/`

## Deploy

```bash
./scripts/deploy.sh           # Deploy to production
./scripts/deploy.sh --dry-run # Preview without changes
```

The deploy script:
1. Rsyncs `dist/` to `/var/www/kvenno.app/`
2. Rsyncs `server/` to `/opt/kvenno-server/`
3. Installs backend deps and restarts systemd service
4. Sets file permissions (www-data:www-data, 755)

## Server Configuration

### nginx
Route `/api/*` to Express backend on port 8000. Serve static files from `/var/www/kvenno.app/`.

### Backend (systemd)
```ini
[Unit]
Description=kvenno.app Backend API
After=network.target

[Service]
Type=simple
User=siggi
WorkingDirectory=/opt/kvenno-server
ExecStart=/usr/bin/node index.js
Restart=on-failure
EnvironmentFile=/opt/kvenno-server/.env

[Install]
WantedBy=multi-user.target
```

### Environment Variables (server/.env)
```bash
CLAUDE_API_KEY=sk-ant-...    # Anthropic API key (NEVER commit)
PORT=8000
NODE_ENV=production
FRONTEND_URL=https://kvenno.app
```

## Verification

After deployment:
- [ ] Landing page: https://kvenno.app/
- [ ] Year hubs: /1-ar/, /2-ar/, /3-ar/, /val/, /f-bekkir/
- [ ] Games load: /1-ar/games/molmassi.html
- [ ] Lab reports: /2-ar/lab-reports/, /3-ar/lab-reports/
- [ ] Backend health: `curl https://kvenno.app/api/health`
- [ ] Icelandic characters render correctly
- [ ] Mobile responsive layout works
