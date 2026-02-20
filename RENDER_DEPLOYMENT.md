# Render deployment – CAMS Services

This document covers deploying the CAMS backend, frontend, and Reverb services to Render, plus health checks, cold starts, and optional keep-warm setup.

---

## Health checks and cold starts

### Health check endpoints

| Service   | Endpoint             | Purpose |
|-----------|----------------------|---------|
| Backend   | `GET /health`        | Render internal health check. **Served by Nginx only** (no PHP/Laravel/DB) so it responds as soon as Nginx is up, before migrations complete. |
| Backend   | `GET /api/v1/health` | Full health (checks DB, cache). Use for monitoring/uptime. |
| Frontend  | `GET /api/health`    | Next.js health; use for Render or external monitoring. |

### How we avoid Render health check timeout (no grace period on free plan)

Render does **not** offer a configurable “health check grace period” on the free plan. Each health check has a **5-second response timeout**; if the new instance fails all checks for **15 consecutive minutes**, the deploy is cancelled.

To pass the health check without a grace period we:

1. **Nginx serves `/health` directly** — In `backend/nginx.conf`, `location = /health` returns `200 OK` with `text/plain`. No PHP or Laravel is involved, so the response is immediate once Nginx is listening.
2. **Web mode: Nginx starts first, migrations in background** — In `backend/docker-entrypoint.sh`, for web mode we start PHP-FPM and Nginx **before** waiting for the database or running migrations. DB wait, migrations, config cache, and scheduler/queue run in a background subshell. So `/health` is reachable within seconds; the rest of the app bootstraps in parallel.
3. **`render.yaml`** — `cams-backend` has `healthCheckPath: /health` so Render hits that Nginx-served endpoint.

### UptimeRobot to prevent spin-down (free tier)

Render removes the grace period option from the UI on free plans. After deploy, use UptimeRobot so services are pinged **before** the ~15-minute spin-down and stay warm (avoids the ~50s cold start):

1. Go to [uptimerobot.com](https://uptimerobot.com) and create a free account.
2. Add an **HTTP(s)** monitor:
   - **URL:** `https://cams-backend-oj5x.onrender.com/health` (or your backend’s Render URL + `/health`).
   - **Monitoring interval:** 14 minutes.
3. Add a second monitor for the frontend:
   - **URL:** `https://cams-frontend.onrender.com/api/health` (or your frontend URL + `/api/health`).
   - **Interval:** 14 minutes.

This keeps backend and frontend warm on the free tier. **Note:** Render may change behaviour or discourage this; it is not guaranteed. For production, prefer the permanent fix below.

### Permanent fix (no cold start)

Upgrade **cams-backend** to the Render **Starter** plan ($7/month). The service stays always-on and no longer spins down, so health checks and first-request latency are consistent. The frontend can remain on the free tier; Next.js cold starts are typically much faster than the Laravel backend.

---

## Summary checklist

- [ ] Deploy via Render blueprint (from `render.yaml`). Health check at `/health` should pass as soon as Nginx is up (migrations run in background).
- [ ] After deploy confirms healthy: add UptimeRobot monitors for backend `/health` and frontend `/api/health` at 14-minute intervals to avoid free-tier spin-down.
- [ ] (Recommended for production) Upgrade cams-backend to Starter plan for always-on behaviour.
