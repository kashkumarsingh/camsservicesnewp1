#!/bin/bash
# Clear Laravel caches inside the backend Docker container.
# Use this when running the app with docker compose (e.g. after 403 on broadcasting/auth).
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"
echo "Clearing Laravel caches in backend container..."
docker compose exec backend php /var/www/html/artisan config:clear
docker compose exec backend php /var/www/html/artisan cache:clear
docker compose exec backend php /var/www/html/artisan route:clear
docker compose exec backend php /var/www/html/artisan view:clear
docker compose exec backend php /var/www/html/artisan optimize:clear
echo "✅ All Laravel caches cleared in backend container."
