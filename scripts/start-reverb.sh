#!/usr/bin/env bash
# Start Laravel Reverb (WebSocket server) for real-time live refresh.
# Run from project root. Requires backend/.env with REVERB_* set (see backend/.env.example).
# Frontend must have .env.local with NEXT_PUBLIC_LIVE_REFRESH_WEBSOCKET_ENABLED=true and NEXT_PUBLIC_REVERB_*.

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"

if [ ! -d "$BACKEND_DIR" ]; then
  echo "Backend directory not found: $BACKEND_DIR"
  exit 1
fi

if [ ! -f "$BACKEND_DIR/.env" ]; then
  echo "Backend .env not found. Copy backend/.env.example to backend/.env and set REVERB_APP_KEY (e.g. local-dev-key)."
  exit 1
fi

cd "$BACKEND_DIR"
if ! grep -q 'REVERB_APP_KEY=.\+' .env 2>/dev/null; then
  echo "REVERB_APP_KEY is empty in backend/.env. Set it (e.g. REVERB_APP_KEY=local-dev-key) and ensure REVERB_APP_SECRET is set."
  exit 1
fi

echo "Starting Reverb (WebSocket) on port 8080..."
exec php artisan reverb:start
