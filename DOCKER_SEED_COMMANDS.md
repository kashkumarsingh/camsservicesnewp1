# Database seeders — Docker commands only

Run these from the **project root** with the backend container up (`docker compose up -d backend` or `docker compose up -d`).

## One-time: copy seeders into Laravel

Seeder sources live in **`scripts/seeders/`**. Copy them into Laravel’s seeders directory once (e.g. after clone or before first seed):

```bash
cp scripts/seeders/*.php backend/database/seeders/
```

If you prefer not to copy, you can run artisan from inside the container with the project mounted; the same Docker commands below still apply once the PHP files are in `backend/database/seeders/`.

## Run all seeders

```bash
docker compose exec backend php /var/www/html/artisan db:seed
```

## Run a single seeder

**Public pages** (home, about, policy pages):

```bash
docker compose exec backend php /var/www/html/artisan db:seed --class=PublicPagesSeeder
```

**Services** (list + service details):

```bash
docker compose exec backend php /var/www/html/artisan db:seed --class=ServicesSeeder
```

**Blog** (categories, tags, posts):

```bash
docker compose exec backend php /var/www/html/artisan db:seed --class=BlogSeeder
```

## Optional: re-run migrations then seed

```bash
docker compose exec backend php /var/www/html/artisan migrate --force
docker compose exec backend php /var/www/html/artisan db:seed
```

## What each seeder does

| Seeder | Content |
|--------|--------|
| **PublicPagesSeeder** | Home (sections), About (mission, core values, safeguarding), 6 policy pages (privacy, terms, cancellation, cookie, payment-refund, safeguarding) |
| **ServicesSeeder** | 4 CAMS services: SEN Mentoring & Support, Trauma-Informed Care, Home & Community-Based Sessions, School & Education Support (title, slug, summary, description, body, hero, content_section, cta_section, category, icon) |
| **BlogSeeder** | 3 categories (SEN & Inclusion, Parenting & Family, News & Updates), 5 tags (SEN, Trauma-informed, Families, Mentoring, Safeguarding), 4 blog posts with CAMS-relevant copy |

All seeders use `updateOrCreate` by slug (or equivalent), so re-running is safe and idempotent.
