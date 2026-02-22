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
echo ""
echo "⚙️  Deploying backend to $BACKEND_DIR..."
rsync -avz ${DRY_RUN:+"$DRY_RUN"} \
  --exclude='node_modules' \
  --exclude='.env' \
  "$SERVER_DIR/" "$SERVER:$BACKEND_DIR/"

# Step 3: Install backend dependencies and restart
if [ -z "$DRY_RUN" ]; then
  echo ""
  echo "📦 Installing backend dependencies and restarting..."
  ssh "$SERVER" "cd $BACKEND_DIR && pnpm install --frozen-lockfile --prod && sudo systemctl restart kvenno-backend"

  echo ""
  echo "🔍 Setting permissions..."
  ssh "$SERVER" "sudo chown -R www-data:www-data $WEB_ROOT && sudo chmod -R 755 $WEB_ROOT"

  echo ""
  echo "✅ Deployment complete!"
  echo "   Frontend: https://kvenno.app/"
  echo "   Backend:  http://127.0.0.1:8000/health"
else
  echo ""
  echo "🔍 Dry run complete - no changes made"
fi
