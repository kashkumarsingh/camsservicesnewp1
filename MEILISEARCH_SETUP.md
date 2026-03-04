# Meilisearch Setup (Self-Hosted, Free)

Meilisearch is integrated for full-text search on **packages**, **services**, **trainers**, and **FAQs**. The [Community Edition is free and open source](https://www.meilisearch.com/docs/learn/self_hosted/getting_started_with_self_hosted_meilisearch) when self-hosted.

**All backend steps below use Docker only** (run from project root).

---

## 1. Start Meilisearch

```bash
docker compose up -d meilisearch
```

Meilisearch is available at **http://localhost:7701**. The backend container uses `MEILISEARCH_HOST=http://meilisearch:7700` and `SCOUT_DRIVER=meilisearch` (set in `docker-compose.yml`).

---

## 2. Install backend PHP dependencies (Scout + Meilisearch)

```bash
docker compose exec backend composer install
```

If the lock file was changed (e.g. Scout/Meilisearch added), update it inside the container:

```bash
docker compose exec backend composer update laravel/scout meilisearch/meilisearch-php
```

---

## 3. Index data

With Meilisearch and backend running:

```bash
docker compose exec backend php artisan scout:import "App\Models\Package"
docker compose exec backend php artisan scout:import "App\Models\Service"
docker compose exec backend php artisan scout:import "App\Models\Trainer"
docker compose exec backend php artisan scout:import "App\Models\FAQ"
```

New/updated records are indexed automatically. To re-index from scratch:

```bash
docker compose exec backend php artisan scout:flush "App\Models\Package"
docker compose exec backend php artisan scout:import "App\Models\Package"
# repeat for Service, Trainer, FAQ
```

---

## 4. API search

Public list endpoints accept optional **`q`**:

| Endpoint | Example |
|----------|---------|
| `GET /api/v1/packages` | `?q=football` |
| `GET /api/v1/services` | `?q=swimming` |
| `GET /api/v1/trainers` | `?q=tennis` |
| `GET /api/v1/faqs` | `?q=booking` |

Response shape is unchanged (same list format, camelCase).

---

## 5. Frontend

Use the same list endpoints and pass **`q`**. Param name: **`SEARCH_QUERY_PARAM`** in `frontend/src/utils/appConstants.ts` (value `'q'`). `ApiPackageRepository.search(query)` already uses `q`.

---

## 6. Security

In production, set a strong **master key** (e.g. `MEILISEARCH_MASTER_KEY`) and do not expose Meilisearch to the internet. The backend uses the key server-side only.
