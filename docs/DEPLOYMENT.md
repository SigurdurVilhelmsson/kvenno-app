# Deployment Guide - kvenno.app

## Prerequisites

### Local

- Node.js >= 22 (`.nvmrc` pins 24; CI builds on 24)
- pnpm >= 9
- SSH access to the production server

### Server

- Ubuntu 24.04
- nginx
- Node.js — see [Server runtime](#server-runtime) below
- pandoc (for .docx equation extraction)
- libreoffice (for .docx → PDF conversion)
- systemd (for backend process management)

## Build

```bash
pnpm install    # Install all dependencies
pnpm build      # Build everything
```

`scripts/build-all.mjs` orchestrates:

1. Landing app → `dist/` (root + chemistry hub/year SPA routes)
2. 20 games → `dist/efnafraedi/{1-ar,2-ar,3-ar}/games/*.html`
3. Lab reports ×2 → `dist/efnafraedi/{2-ar,3-ar}/lab-reports/`
4. Íslenskubraut → `dist/islenskubraut/`
5. **Backend** (TypeScript → `server/dist/`)
6. Media assets → `dist/media/`

Two separate outputs: `dist/` is the static site, `server/dist/` is the compiled
backend. Both are gitignored.

> **The backend build is not optional.** The systemd unit runs
> `node dist/index.js`. Deploying without compiling first leaves the service
> crash-looping. Both deploy paths now refuse to proceed if `dist/index.js` is
> missing from the bundle, but the correct fix is always to run `pnpm build`.

Skip flags for faster iteration: `--skip-landing`, `--skip-games`,
`--skip-lab-reports`, `--skip-islenskubraut`, `--skip-server`.

## Deploy

### Manual (primary path today)

```bash
pnpm build                    # Required — builds frontend AND backend
./scripts/deploy.sh           # Deploy to production
./scripts/deploy.sh --dry-run # Preview without changes
```

The script:

1. Rsyncs `dist/` → `/var/www/kvenno.app/` (with `--delete`)
2. Builds a standalone backend bundle via `pnpm --filter kvenno-server deploy --prod`
   (compiled `dist/` + resolved production `node_modules`, no workspace context
   needed on the host)
3. Refuses to continue if that bundle has no `dist/index.js`
4. Rsyncs the bundle → `/opt/kvenno-server/` (with `--delete`, preserving `.env`)
5. Restarts the systemd service
6. Sets permissions (`www-data:www-data`, 755)
7. Health-checks the backend and fails loudly with recent journal logs if it
   did not come back up

### Automated (GitHub Actions)

`.github/workflows/deploy.yml` runs the same sequence after CI passes on `main`.
It requires four repository secrets, which must be configured under
**Settings → Secrets and variables → Actions**:

| Secret            | Meaning                         | Example                         |
| ----------------- | ------------------------------- | ------------------------------- |
| `SSH_PRIVATE_KEY` | Private key for the deploy user | contents of `~/.ssh/id_ed25519` |
| `DEPLOY_HOST`     | Server hostname                 | `kvenno.app`                    |
| `DEPLOY_USER`     | SSH username                    | `siggi`                         |
| `DEPLOY_PATH`     | Static web root                 | `/var/www/kvenno.app`           |

The deploy user also needs passwordless sudo for `systemctl restart
kvenno-backend`, `chown`, and `chmod` on the web root.

> Until these secrets exist the workflow fails at the "Configure SSH" step with
> an `ssh-keyscan` usage error, because the host argument expands to an empty
> string. Automated deploy has never completed successfully; every production
> deploy to date has gone out via `scripts/deploy.sh`.

## Server Configuration

### nginx

Checked in at `server/nginx-site.conf` — copy to
`/etc/nginx/sites-available/kvenno` and symlink into `sites-enabled/`.

It serves the static site from `/var/www/kvenno.app`, proxies **`/api/` only**
to the backend on port 8000, redirects legacy year URLs (`/1-ar` →
`/efnafraedi/1-ar`), and applies per-location CSP headers.

> **`/health` is not proxied.** It lives on the backend but is not under
> `/api/`, so a public request for `https://kvenno.app/health` falls through to
> `try_files $uri /index.html` and returns the SPA with HTTP 200 — even when the
> backend is completely down. Never use it as an external health signal.

### Backend (systemd)

The unit file is checked in at `server/kvenno-backend.service` — install it to
`/etc/systemd/system/` rather than hand-writing one. It runs as `www-data` from
`/opt/kvenno-server`, executes `/usr/bin/node dist/index.js`, restarts always,
and applies systemd sandboxing (`ProtectSystem=strict`, `PrivateTmp`, etc.,
with `/tmp` writable for document conversion).

### Server runtime

`ExecStart=/usr/bin/node` is **not version-pinned** — production runs whatever
Node the host has installed. This is independent of `.nvmrc`, of the `engines`
floor, and of the Node version CI builds on, and `scripts/deploy.sh` ships a
pre-built bundle rather than installing against the declared engine, so a
mismatch will not be caught automatically.

Verify it directly, and keep it on a supported line (Node 20 reached
end-of-life in April 2026):

```bash
ssh siggi@kvenno.app 'node -v'
```

### Environment variables (`server/.env`)

Template at `server/.env.example`. Never committed; both deploy paths exclude
`.env` from rsync so the host copy survives deploys.

```bash
CLAUDE_API_KEY=sk-ant-...      # Anthropic API key (ANTHROPIC_API_KEY also accepted)
PORT=8000
NODE_ENV=production
FRONTEND_URL=https://kvenno.app
```

`FRONTEND_URL` is load-bearing beyond CORS convenience: in production the server
**rejects requests with no `Origin` header**, and any `Origin` that does not
match, with HTTP 500.

## Verification

After deployment:

- [ ] Landing page: <https://kvenno.app/>
- [ ] Chemistry hub: `/efnafraedi/`
- [ ] Year hubs: `/efnafraedi/{1-ar,2-ar,3-ar,val,f-bekkir}/`
- [ ] Games load: `/efnafraedi/1-ar/games/molmassi.html`
- [ ] Lab reports: `/efnafraedi/{2-ar,3-ar}/lab-reports/`
- [ ] Íslenskubraut: `/islenskubraut/`
- [ ] Legacy redirect: `/1-ar/` → `/efnafraedi/1-ar/`
- [ ] Icelandic characters render correctly
- [ ] Mobile responsive layout works

Backend health — must be run **on the host** and **with an `Origin` header**,
for the two reasons documented above:

```bash
ssh siggi@kvenno.app \
  "curl -s -H 'Origin: https://kvenno.app' http://127.0.0.1:8000/health"
# => {"status":"ok","timestamp":"..."}
```

If that fails:

```bash
ssh siggi@kvenno.app 'sudo journalctl -u kvenno-backend -n 50 --no-pager'
```
