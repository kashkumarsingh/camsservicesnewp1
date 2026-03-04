# Seeder sources for CAMS backend

These PHP files are **sources** for Laravel database seeders. They must live in `backend/database/seeders/` for `php artisan db:seed` to find them.

## Copy into Laravel (one-time)

From the project root:

```bash
cp scripts/seeders/*.php backend/database/seeders/
```

## Run via Docker

See **`DOCKER_SEED_COMMANDS.md`** in the project root for Docker-only commands to run all seeders or individual seeders (PublicPagesSeeder, ServicesSeeder, BlogSeeder).

## Files

| File | Seeds |
|------|--------|
| `PublicPagesSeeder.php` | Home, About, 6 policy pages |
| `ServicesSeeder.php` | 4 services (list + detail body, hero, CTAs) |
| `BlogSeeder.php` | Categories, tags, 4 blog posts |
| `DatabaseSeeder.php` | Calls the three seeders above (used by `db:seed` with no `--class`) |
