# Page Builder — Docker Commands

Use these when running the app with Docker Compose. Service name: **backend** (container: `camsnew-backend`).

## Phase 1 — Migration

1. **Copy the migration file** (migrations folder may be in .cursorignore, so do this manually):
   - Copy `MIGRATION_create_page_blocks.php` → `backend/database/migrations/2026_02_26_071736_create_page_blocks_table.php`

2. **Run the migration:**
   ```bash
   docker compose exec backend php artisan migrate
   ```

3. **Rollback** (if needed):
   ```bash
   docker compose exec backend php artisan migrate:rollback
   ```

## Other useful backend commands (Docker)

- **Artisan (any command):**
  ```bash
  docker compose exec backend php artisan <command>
  ```

- **Create a new migration:**
  ```bash
  docker compose exec backend php artisan make:migration create_something_table
  ```

- **Run seeds:**
  ```bash
  docker compose exec backend php artisan db:seed
  ```

- **Tinker:**
  ```bash
  docker compose exec backend php artisan tinker
  ```

- **Clear config/cache:**
  ```bash
  docker compose exec backend php artisan config:clear
  docker compose exec backend php artisan cache:clear
  ```

## Frontend (Docker, if using frontend profile)

- **Install deps:**
  ```bash
  docker compose --profile frontend run --rm frontend npm install
  ```

- **Typecheck:**
  ```bash
  docker compose --profile frontend run --rm frontend npm run typecheck
  ```

- **Build:**
  ```bash
  docker compose --profile frontend run --rm frontend npm run build
  ```
