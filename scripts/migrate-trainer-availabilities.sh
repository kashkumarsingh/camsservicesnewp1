#!/usr/bin/env bash
# Run from project root. Creates trainer_availabilities table (for trainer "Set my availability").
# Usage: ./scripts/migrate-trainer-availabilities.sh

set -e
cd "$(dirname "$0")/.."

echo "Copying trainer_availabilities migration into database/migrations..."
cp backend/migrations_trainer_workflow/2026_01_21_000001_create_trainer_availabilities_table.php \
   backend/database/migrations/2026_02_17_100000_create_trainer_availabilities_table.php

echo "Running migrations inside Docker backend container..."
docker compose exec backend php artisan migrate --force

echo "Done. trainer_availabilities table is ready."
