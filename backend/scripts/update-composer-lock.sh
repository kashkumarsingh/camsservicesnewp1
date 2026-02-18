#!/usr/bin/env bash
# One-time: update composer.lock using PHP 8.4 in Docker (host may have 8.3).
# Run from repo root: backend/scripts/update-composer-lock.sh
# Or from backend: scripts/update-composer-lock.sh
set -e
cd "$(dirname "$0")/.."
docker run --rm -v "$(pwd):/app" -w /app php:8.4-cli-alpine sh -c \
  'apk add --no-cache git unzip curl && \
   curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer && \
   composer update laravel/reverb --no-interaction --no-scripts'
echo "Done. composer.lock updated. You can now: docker compose up -d --build"
