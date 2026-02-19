# Render Environment Variables – Value Guide

Use this when creating or editing the three web services (**cams-reverb**, **cams-backend**, **cams-frontend**) in the Render dashboard. Replace placeholders with your real values and keep shared secrets identical where noted.

---

## Why a separate cams-reverb service?

**cams-backend** has Reverb *configuration* (REVERB_APP_KEY, REVERB_APP_SECRET) so it can **send** broadcast events to Reverb. It does **not** run the WebSocket server.

- **cams-backend** = HTTP API only. Short-lived requests; process handles one request at a time.
- **cams-reverb** = WebSocket server only. Long-lived connections; one process runs `php artisan reverb:start` and holds all client connections.

On Render, each web service runs **one** process. So you need two services: one for the API, one for the WebSocket server. They share APP_KEY and Reverb credentials so the backend can authenticate when pushing events to Reverb.

**If you don’t want a second service:** set `BROADCAST_CONNECTION=log` on cams-backend and **do not** create cams-reverb. The frontend can disable WebSocket live refresh (or use polling). See [Alternative: run without Reverb](#alternative-run-without-reverb) below.

---

## 1. cams-reverb

| Key | Value | Notes |
|-----|--------|--------|
| **APP_KEY** | `base64:...` | **Same as cams-backend.** Generate once (see below), then copy to both services. |
| **REVERB_APP_KEY** | e.g. `cams-prod-key` or random string | **Must match** `REVERB_APP_KEY` on cams-backend and `NEXT_PUBLIC_REVERB_APP_KEY` on cams-frontend. Use one shared value. |
| **REVERB_APP_SECRET** | e.g. `cams-prod-secret` or random string | **Must match** `REVERB_APP_SECRET` on cams-backend. Generate a secure random string (e.g. `openssl rand -hex 32`). |

**Generating APP_KEY (Laravel):**  
From your machine (with PHP/Composer or inside backend container):

```bash
cd backend && php artisan key:generate --show
```

Copy the full output (e.g. `base64:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx=`) into **APP_KEY** for both **cams-reverb** and **cams-backend**.

---

## 2. cams-backend

| Key | Value | Notes |
|-----|--------|--------|
| **APP_KEY** | `base64:...` | Same value as cams-reverb (see above). |
| **MAIL_HOST** | e.g. `smtp.mailtrap.io`, `smtp.sendgrid.net`, `smtp.postmarkapp.com` | Your SMTP server hostname. |
| **MAIL_PORT** | `2525`, `587`, or `465` | 587 (TLS), 465 (SSL), 2525 (Mailtrap). |
| **MAIL_USERNAME** | Your SMTP username | From your mail provider. |
| **MAIL_PASSWORD** | Your SMTP password | From your mail provider. |
| **MAIL_ENCRYPTION** | `tls`, `ssl`, or leave empty | Usually `tls` for port 587. |
| **FRONTEND_URL** | `https://cams-frontend.onrender.com` | Your frontend URL (no trailing slash). |
| **SANCTUM_STATEFUL_DOMAINS** | `cams-frontend.onrender.com` | Frontend host only (no `https://`). |
| **NEXT_REVALIDATE_URL** | `https://cams-frontend.onrender.com/api/revalidate` | Full URL the backend will call for ISR revalidation. |
| **NEXT_REVALIDATE_SECRET** | e.g. `openssl rand -hex 32` | **Must match** `NEXT_REVALIDATE_SECRET` on cams-frontend. |
| **STRIPE_SECRET_KEY** | `sk_test_...` or `sk_live_...` | From [Stripe Dashboard](https://dashboard.stripe.com/apikeys). |
| **STRIPE_PUBLIC_KEY** | `pk_test_...` or `pk_live_...` | From Stripe Dashboard (same account). |
| **STRIPE_WEBHOOK_SECRET** | `whsec_...` | From Stripe → Developers → Webhooks (after adding your backend URL). |
| **REVERB_APP_KEY** | Same as cams-reverb | e.g. `cams-prod-key` – must match Reverb and frontend. |
| **REVERB_APP_SECRET** | Same as cams-reverb | Must match cams-reverb. |

---

## 3. cams-frontend

| Key | Value | Notes |
|-----|--------|--------|
| **NEXT_PUBLIC_SITE_URL** | `https://cams-frontend.onrender.com` | Public site URL (no trailing slash). |
| **NEXT_PUBLIC_API_URL** | `https://cams-backend.onrender.com/api/v1` | Backend API base URL. |
| **API_URL** | `https://cams-backend.onrender.com/api/v1` | Same as above (server-side / ISR). |
| **NEXT_REVALIDATE_SECRET** | Same as backend `NEXT_REVALIDATE_SECRET` | Must match cams-backend. |
| **NEXT_PUBLIC_REVERB_APP_KEY** | Same as `REVERB_APP_KEY` on backend/Reverb | Must match cams-backend and cams-reverb. |
| **NEXT_PUBLIC_REVERB_WS_HOST** | `cams-reverb.onrender.com` | Reverb service host (no `wss://` or path). |
| **NEXT_PUBLIC_STRIPE_PUBLIC_KEY** | `pk_test_...` or `pk_live_...` | Same as backend `STRIPE_PUBLIC_KEY`. |
| **NEXT_PUBLIC_IDEAL_POSTCODES_API_KEY** | `ak_...` | From [Ideal Postcodes](https://idealpostcodes.co.uk/) (UK address lookup). Optional: leave empty if not using. |

---

## Values that must match across services

| Value | Used in |
|--------|---------|
| **APP_KEY** | cams-reverb, cams-backend |
| **REVERB_APP_KEY** | cams-reverb, cams-backend, cams-frontend (`NEXT_PUBLIC_REVERB_APP_KEY`) |
| **REVERB_APP_SECRET** | cams-reverb, cams-backend |
| **NEXT_REVALIDATE_SECRET** | cams-backend, cams-frontend |
| **STRIPE public key** | cams-backend (`STRIPE_PUBLIC_KEY`), cams-frontend (`NEXT_PUBLIC_STRIPE_PUBLIC_KEY`) |

---

## Quick generation commands

```bash
# Laravel APP_KEY (run in backend directory or container)
php artisan key:generate --show

# Secure random string (e.g. for NEXT_REVALIDATE_SECRET or REVERB_APP_SECRET)
openssl rand -hex 32
```

After deployment, replace `cams-frontend.onrender.com`, `cams-backend.onrender.com`, and `cams-reverb.onrender.com` with your actual Render URLs if different.

---

## Alternative: run without Reverb

If you want **only two services** (cams-backend + cams-frontend) and can do without real-time WebSockets:

1. **Do not create** the cams-reverb web service.
2. On **cams-backend**, set **BROADCAST_CONNECTION** = `log` (in Render env vars; add it if missing). You can remove or leave REVERB_APP_KEY / REVERB_APP_SECRET; they are unused when broadcast is `log`.
3. On **cams-frontend**, set **NEXT_PUBLIC_LIVE_REFRESH_WEBSOCKET_ENABLED** = `false` so the app uses polling or no live refresh instead of WebSocket.

Result: one fewer service to maintain; no real-time push from backend to frontend.
