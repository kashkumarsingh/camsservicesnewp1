#!/usr/bin/env bash
# Clean Docker stack, rebuild backend, start services, and verify Laravel version.
# Run from monorepo root: ./scripts/docker-clean-and-verify-laravel.sh
set -e
cd "$(dirname "$0")/.."
echo "Stopping containers..."
docker compose down --remove-orphans
echo "Building backend (using cache; use --no-cache in script for full rebuild)..."
docker compose build backend
echo "Starting stack..."
docker compose up -d
echo "Waiting for backend to be ready..."
sleep 5
echo "Laravel version:"
docker compose exec backend php artisan --version
echo "Laravel framework package:"
docker compose exec backend composer show laravel/framework 2>/dev/null || true
echo "Done. Backend should be on http://localhost:9080"
