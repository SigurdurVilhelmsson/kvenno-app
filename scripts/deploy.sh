#!/bin/bash
#
# Deploy kvenno.app to production server
#
# Usage: ./scripts/deploy.sh [--dry-run]
#
# Prerequisites:
#   - SSH access to server (siggi@server)
#   - dist/ built via: pnpm build
#   - server/ contains Express backend

set -euo pipefail

SERVER="siggi@kvenno.app"
WEB_ROOT="/var/www/kvenno.app"
BACKEND_DIR="/opt/kvenno-server"
BACKEND_PORT="8000"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
DIST_DIR="$ROOT_DIR/dist"
SERVER_DIR="$ROOT_DIR/server"

DRY_RUN=""
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN="--dry-run"
  echo "🔍 DRY RUN MODE - no changes will be made"
fi

# Verify dist/ exists
if [ ! -d "$DIST_DIR" ]; then
  echo "❌ dist/ directory not found. Run 'pnpm build' first."
  exit 1
fi

echo "🚀 Deploying kvenno.app..."

# Step 1: Build and validate the backend bundle — before anything is shipped.
# Nothing reaches the server until we know both halves are deployable;
# otherwise a bad backend leaves the site on a new frontend against an old API.
#
# Use `pnpm deploy` to produce a standalone, self-contained bundle of the
# server package (with node_modules and a resolved lockfile) — no workspace
# context or `pnpm install` needed on the production host.
#
# The bundle directory must live inside the repo. pnpm 9.15's `deploy` resolves
# the bundle's node_modules/.bin one directory too shallow when the target sits
# outside the workspace: a /tmp target maps onto root-owned /home and fails with
# `EACCES: mkdir '/home/tmp'` (exit 243), and a target under $HOME silently
# writes the bins one level up from where they belong.
BUNDLE_DIR="$ROOT_DIR/.deploy-bundle"
rm -rf "$BUNDLE_DIR"
trap 'rm -rf "$BUNDLE_DIR"' EXIT

echo ""
echo "📦 Building standalone backend bundle in $BUNDLE_DIR..."
pnpm --filter kvenno-server deploy --prod "$BUNDLE_DIR"

# Guard: the systemd unit runs `node dist/index.js`, and the rsync below uses
# --delete. Shipping a bundle without dist/ would remove the working build on
# the host and leave the service crash-looping, so refuse before touching it.
# `pnpm deploy` copies the package as-is; it does not run the build.
if [ ! -f "$BUNDLE_DIR/dist/index.js" ]; then
  echo "❌ Backend bundle is missing dist/index.js — refusing to deploy."
  echo "   The backend was not compiled. Run 'pnpm build' first."
  exit 1
fi

# Step 2: Deploy frontend
echo ""
echo "📄 Deploying frontend to $WEB_ROOT..."
rsync -avz --delete ${DRY_RUN:+"$DRY_RUN"} \
  --exclude='.git' \
  --exclude='node_modules' \
  "$DIST_DIR/" "$SERVER:$WEB_ROOT/"

# Step 3: Deploy backend
echo ""
echo "⚙️  Deploying backend to $BACKEND_DIR..."
rsync -avz --delete ${DRY_RUN:+"$DRY_RUN"} \
  --exclude='.env' \
  "$BUNDLE_DIR/" "$SERVER:$BACKEND_DIR/"

# Step 4: Restart backend
if [ -z "$DRY_RUN" ]; then
  echo ""
  echo "🔄 Restarting backend..."
  # -t allocates a terminal: sudo on the host requires a password, and without
  # a tty it fails with "a terminal is required to read the password".
  ssh -t "$SERVER" "sudo systemctl restart kvenno-backend"

  # Group-writable on purpose: the deploying user is in the www-data group, so
  # 775/664 is what lets the frontend rsync above run without sudo. Dropping
  # back to 755/644 makes every future deploy fail with permission denied.
  echo ""
  echo "🔍 Setting permissions..."
  ssh -t "$SERVER" "sudo chown -R www-data:www-data $WEB_ROOT && sudo find $WEB_ROOT -type d -exec chmod 775 {} + && sudo find $WEB_ROOT -type f -exec chmod 664 {} +"

  # Verify the backend actually came back up. Checked on the host against the
  # backend port (nginx only proxies /api/, so a public /health request returns
  # the SPA with HTTP 200 even when the backend is dead), and with an Origin
  # header (production CORS rejects origin-less requests with HTTP 500).
  echo ""
  echo "🩺 Checking backend health..."
  HEALTH_STATUS="000"
  for _ in $(seq 1 10); do
    HEALTH_STATUS=$(ssh "$SERVER" \
      "curl -s -o /dev/null -w '%{http_code}' -H 'Origin: https://kvenno.app' http://127.0.0.1:$BACKEND_PORT/health" 2>/dev/null || echo "000")
    [ "$HEALTH_STATUS" = "200" ] && break
    sleep 3
  done

  if [ "$HEALTH_STATUS" != "200" ]; then
    echo "❌ Backend health check failed (HTTP $HEALTH_STATUS)"
    echo "   Recent service logs:"
    ssh -t "$SERVER" "sudo journalctl -u kvenno-backend -n 30 --no-pager" || true
    exit 1
  fi
  echo "   ✅ Backend healthy (HTTP 200)"

  echo ""
  echo "✅ Deployment complete!"
  echo "   Frontend: https://kvenno.app/"
  echo "   Backend:  http://127.0.0.1:$BACKEND_PORT/health"
else
  echo ""
  echo "🔍 Dry run complete - no changes made"
fi
