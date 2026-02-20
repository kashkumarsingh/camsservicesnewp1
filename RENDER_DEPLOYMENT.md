# Render deployment – CAMS Services

This document covers deploying the CAMS backend, frontend, and Reverb services to Render, plus health checks, cold starts, and optional keep-warm setup.

---

## Health checks and cold starts

### Health check endpoints

| Service   | Endpoint             | Purpose |
|-----------|----------------------|---------|
| Backend   | `GET /health`        | Render internal health check. No DB, no auth; responds in <100ms. |
| Backend   | `GET /api/v1/health` | Full health (checks DB, cache). Use for monitoring/uptime. |
| Frontend  | `GET /api/health`    | Next.js health; use for Render or external monitoring. |

The lightweight `/health` route lives in `backend/routes/web.php` and must stay fast and middleware-light so Render’s check can pass as soon as the app is listening.

### Grace period (set in Render dashboard, not in code)

Render runs its health check shortly after the container starts. Laravel runs migrations and then starts Nginx, so the app may not be ready for tens of seconds.

**Required step after deploy:**

1. Open **Render Dashboard** → **cams-backend** → **Settings** → **Health & Alerts**.
2. Set **Health Check Grace Period** to **120 seconds**.

This prevents the deploy from failing due to health check timeouts during migrations and startup. This value cannot be set in `render.yaml`; it must be configured in the dashboard.

### Free tier cold start workaround (UptimeRobot)

On the free plan, Render spins down services after about 15 minutes of inactivity. The first request after spin-down can take 30–60 seconds (cold start).

A common workaround is to ping the service **before** the 15-minute threshold so it stays warm:

1. Sign up at [uptimerobot.com](https://uptimerobot.com) (free account).
2. Add an **HTTP(s)** monitor:
   - **URL:** `https://cams-backend-oj5x.onrender.com/health` (or your backend’s Render URL + `/health`).
   - **Monitoring interval:** 14 minutes (so the service is pinged before Render’s ~15 min sleep).
3. Add a second monitor for the frontend:
   - **URL:** `https://cams-frontend.onrender.com/api/health` (or your frontend URL + `/api/health`).
   - **Interval:** 14 minutes.

This can keep the backend and frontend warm on the free tier. **Note:** Render may change behaviour or discourage this; it is not guaranteed. For production, prefer the permanent fix below.

### Permanent fix (no cold start)

Upgrade **cams-backend** to the Render **Starter** plan ($7/month). The service stays always-on and no longer spins down, so health checks and first-request latency are consistent. The frontend can remain on the free tier; Next.js cold starts are typically much faster than the Laravel backend.

---

## Summary checklist

- [ ] Deploy via Render blueprint (from `render.yaml`).
- [ ] Set **Health Check Grace Period** to **120 seconds** for cams-backend in the Render dashboard.
- [ ] (Optional) Add UptimeRobot monitors for `/health` (backend) and `/api/health` (frontend) at 14-minute intervals.
- [ ] (Recommended for production) Upgrade cams-backend to Starter plan for always-on behaviour.
