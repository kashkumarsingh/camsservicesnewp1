# Railway Frontend – Environment Variables

Use this in **Railway Dashboard → cams-frontend service → Variables** so the frontend at `https://cams-frontend-production-9f1b.up.railway.app` is fully working.

## Required variables (copy into Railway)

Set **Root Directory** to `frontend` for this service. Then add:

```env
# App & API
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
NEXT_PUBLIC_SITE_URL=https://cams-frontend-production-9f1b.up.railway.app
NEXT_PUBLIC_SITE_NAME=CAMS Services
API_URL=https://cams-backend-production-21a2.up.railway.app/api/v1
NEXT_PUBLIC_API_URL=https://cams-backend-production-21a2.up.railway.app/api/v1

# Repositories (api = use backend)
NEXT_PUBLIC_PACKAGE_REPOSITORY=api
NEXT_PUBLIC_SERVICE_REPOSITORY=api
NEXT_PUBLIC_TRAINER_REPOSITORY=api
NEXT_PUBLIC_PAGE_REPOSITORY=api
NEXT_PUBLIC_FAQ_REPOSITORY=api
NEXT_PUBLIC_BLOG_REPOSITORY=api

# Revalidation (must match backend NEXT_REVALIDATE_SECRET)
NEXT_REVALIDATE_SECRET=<same-value-as-backend>

# Live refresh / Reverb (optional; set to true if you want WebSocket on Railway frontend)
NEXT_PUBLIC_LIVE_REFRESH_WEBSOCKET_ENABLED=true
NEXT_PUBLIC_REVERB_APP_KEY=<same-as-backend-REVERB_APP_KEY>
NEXT_PUBLIC_REVERB_WS_HOST=cams-reverb-production-a616.up.railway.app
NEXT_PUBLIC_REVERB_WS_PORT=443
NEXT_PUBLIC_REVERB_SCHEME=https

# Stripe (use same as Vercel / backend STRIPE_PUBLIC_KEY)
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=<your-stripe-publishable-key>

# TinyMCE (use same as Vercel)
NEXT_PUBLIC_TINYMCE_API_KEY=<your-tinymce-api-key>
```

Replace placeholders:

- `<same-value-as-backend>` – same `NEXT_REVALIDATE_SECRET` as on the Laravel backend (for on-demand ISR revalidation). If you don’t use revalidation yet, set any secure random string and the same in backend.
- `<same-as-backend-REVERB_APP_KEY>` – same as backend `REVERB_APP_KEY`.
- `<your-stripe-publishable-key>` – same as Vercel `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` (or backend `STRIPE_PUBLIC_KEY`).
- `<your-tinymce-api-key>` – same as Vercel `NEXT_PUBLIC_TINYMCE_API_KEY`.

## Backend: allow Railway frontend URL

So the Railway frontend can call the API and use Sanctum auth, add its host to the **backend** service variables:

- **SANCTUM_STATEFUL_DOMAINS**  
  Add the Railway frontend host. Example (both production and Railway frontend):  
  `www.camsservices.co.uk,cams-frontend-production-9f1b.up.railway.app`

- **CORS_ALLOWED_ORIGINS**  
  Add the Railway frontend origin. Example:  
  `https://www.camsservices.co.uk,https://cams-frontend-production-9f1b.up.railway.app`

Redeploy the backend after changing these so CORS and cookies work for the Railway frontend.

## Optional

- **NEXT_PUBLIC_IDEAL_POSTCODES_API_KEY** – if you use address lookup (same as Vercel).
- **NEXT_PUBLIC_GOOGLE_MAPS_API_KEY** – if you use maps (same as Vercel).
