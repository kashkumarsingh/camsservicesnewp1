# Docker and Backend (Laravel) – Don’t Forget Docker

Backend (Laravel) runs in Docker. **Composer and Artisan commands must be run inside the backend container**, not on the host.

---

## Running Composer and Artisan in Docker

From the **monorepo root** (where `docker-compose.yml` lives):

```bash
# Backend Composer (install, update, remove packages)
docker compose exec backend composer <command>

# Examples:
docker compose exec backend composer install
docker compose exec backend composer update
docker compose exec backend composer update laravel/framework

# Artisan
docker compose exec backend php artisan migrate
docker compose exec backend php artisan config:clear
```

**Service name:** `backend` (container: `kidzrunz-backend`).

---

## Admin dashboard

Admin is the **Next.js dashboard** at the frontend (e.g. `http://localhost:4300/dashboard/admin`). The backend is API-only for admin; use the frontend after logging in with an admin account.

---

## Rebuild After composer.json / composer.lock Changes

If you change `backend/composer.json` or `backend/composer.lock` and the app is mounted as a volume (`./backend:/var/www/html`), run inside the container:

```bash
docker compose exec backend composer install
```

So dependency changes are applied in the running container. For a clean slate, rebuild the image (see above).

---

## Clean, run Docker, and verify Laravel

From the **monorepo root**:

```bash
# 1. Clean: stop and remove containers (optional: add -v to remove volumes)
docker compose down --remove-orphans

# 2. Rebuild backend (use cache; omit --no-cache unless you need a full rebuild)
docker compose build backend

# 3. Start the stack (backend depends on db + redis)
docker compose up -d

# 4. Verify Laravel version inside the backend container
docker compose exec backend php artisan --version
docker compose exec backend composer show laravel/framework
```

**Full clean rebuild** (slower; compiles PHP extensions from scratch):

```bash
docker compose down --remove-orphans
docker compose build --no-cache backend
docker compose up -d
docker compose exec backend php artisan --version
```

You should see **Laravel Framework 12.x** (e.g. 12.34.0 or latest 12.x patch). The exact patch is determined by `composer.lock`; to get the latest 12.x run `docker compose exec backend composer update laravel/framework` and then rebuild or run `composer install` in the container.

---

## Summary

- **Backend = Docker.** Use `docker compose exec backend` for all `composer` and `php artisan` commands.
- **Admin** is the Next.js dashboard (frontend `/dashboard/admin`).
- Laravel is already constrained to `^12.0`; use `composer update laravel/framework` in the container to get the latest 12.x patch.
