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

# Step 1: Deploy frontend
echo ""
echo "📄 Deploying frontend to $WEB_ROOT..."
rsync -avz --delete ${DRY_RUN:+"$DRY_RUN"} \
  --exclude='.git' \
  --exclude='node_modules' \
  "$DIST_DIR/" "$SERVER:$WEB_ROOT/"

# Step 2: Deploy backend
# Use `pnpm deploy` to produce a standalone, self-contained bundle of the
# server package (with node_modules and a resolved lockfile) — no workspace
# context or `pnpm install` needed on the production host.
BUNDLE_DIR="$(mktemp -d -t kvenno-server-bundle-XXXXXX)"
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

echo ""
echo "⚙️  Deploying backend to $BACKEND_DIR..."
rsync -avz --delete ${DRY_RUN:+"$DRY_RUN"} \
  --exclude='.env' \
  "$BUNDLE_DIR/" "$SERVER:$BACKEND_DIR/"

# Step 3: Restart backend
if [ -z "$DRY_RUN" ]; then
  echo ""
  echo "🔄 Restarting backend..."
  ssh "$SERVER" "sudo systemctl restart kvenno-backend"

  echo ""
  echo "🔍 Setting permissions..."
  ssh "$SERVER" "sudo chown -R www-data:www-data $WEB_ROOT && sudo chmod -R 755 $WEB_ROOT"

  # Verify the backend actually came back up. Checked on the host against the
  # backend port (nginx only proxies /api/, so a public /health request returns
  # the SPA with HTTP 200 even when the backend is dead), and with an Origin
  # header (production CORS rejects origin-less requests with HTTP 500).
  echo ""
  echo "🩺 Checking backend health..."
  HEALTH_STATUS="000"
  for _ in $(seq 1 10); do
    HEALTH_STATUS=$(ssh "$SERVER" \
      "curl -s -o /dev/null -w '%{http_code}' -H 'Origin: https://kvenno.app' http://127.0.0.1:8000/health" 2>/dev/null || echo "000")
    [ "$HEALTH_STATUS" = "200" ] && break
    sleep 3
  done

  if [ "$HEALTH_STATUS" != "200" ]; then
    echo "❌ Backend health check failed (HTTP $HEALTH_STATUS)"
    echo "   Recent service logs:"
    ssh "$SERVER" "sudo journalctl -u kvenno-backend -n 30 --no-pager" || true
    exit 1
  fi
  echo "   ✅ Backend healthy (HTTP 200)"

  echo ""
  echo "✅ Deployment complete!"
  echo "   Frontend: https://kvenno.app/"
  echo "   Backend:  http://127.0.0.1:8000/health"
else
  echo ""
  echo "🔍 Dry run complete - no changes made"
fi
