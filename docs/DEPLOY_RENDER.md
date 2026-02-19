# Deploy to Render.com (Blueprint)

Step-by-step guide to create and deploy this app on Render using `render.yaml`.

## Prerequisites

- GitHub repo pushed (e.g. `kashkumarsingh/camsservicep1`)
- [Render.com](https://render.com) account (sign up with GitHub)

## 1. Create the deployment from Blueprint

1. Go to **[Render Dashboard](https://dashboard.render.com)** → sign in with GitHub.
2. Click **New +** → **Blueprint**.
3. Connect the repository **camsservicep1** and choose the branch (e.g. `main`).
4. Render detects `render.yaml`. Click **Apply**.
5. Render creates:
   - **cams-database** (PostgreSQL)
   - **cams-backend** (Docker)
   - **cams-frontend** (Docker)

## 2. Set required secret environment variables

In the dashboard, open each service and add the variables marked `sync: false` in `render.yaml`.

### Backend (cams-backend)

| Key | What to set |
|-----|----------------|
| `APP_KEY` | Run: `docker compose exec backend php artisan key:generate --show` and paste the key |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_ENCRYPTION` | Your SMTP settings |
| `FRONTEND_URL` | After frontend is live: `https://cams-frontend.onrender.com` |
| `SANCTUM_STATEFUL_DOMAINS` | `cams-frontend.onrender.com` (no `https://`) |
| `NEXT_REVALIDATE_URL` | `https://cams-frontend.onrender.com/api/revalidate` |
| `NEXT_REVALIDATE_SECRET` | Random string (e.g. `openssl rand -hex 32`) |
| `STRIPE_SECRET_KEY`, `STRIPE_PUBLIC_KEY`, `STRIPE_WEBHOOK_SECRET` | From Stripe dashboard |

### Frontend (cams-frontend)

| Key | What to set |
|-----|----------------|
| `NEXT_PUBLIC_SITE_URL` | `https://cams-frontend.onrender.com` (after first deploy) |
| `NEXT_PUBLIC_API_URL` | `https://cams-backend-xxxx.onrender.com/api/v1` (from backend service URL) |
| `API_URL` | Same as `NEXT_PUBLIC_API_URL` |
| `NEXT_REVALIDATE_SECRET` | Same as backend |
| `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` | Same as backend `STRIPE_PUBLIC_KEY` |
| `NEXT_PUBLIC_IDEAL_POSTCODES_API_KEY` | (Optional) UK address lookup |

## 3. Deploy and wire URLs

1. Let the Blueprint create resources; Render will build and deploy.
2. Copy the **backend** service URL (e.g. `https://cams-backend-xxxx.onrender.com`) and set on **frontend**: `NEXT_PUBLIC_API_URL` and `API_URL` = that URL + `/api/v1`.
3. Copy the **frontend** service URL and set on **backend**: `FRONTEND_URL`, `SANCTUM_STATEFUL_DOMAINS`, `NEXT_REVALIDATE_URL`.
4. **Manual deploy** both services so they use the new env vars.

## 4. After first deploy

- Migrations and seeding run automatically in the backend container on startup.
- Admin: `https://your-frontend-url.onrender.com/dashboard/admin`
- Stripe webhook: use `https://cams-backend-xxxx.onrender.com/api/v1/webhooks/stripe` and set `STRIPE_WEBHOOK_SECRET`.

## Troubleshooting

- **419 CSRF:** Ensure `FRONTEND_URL` and `SANCTUM_STATEFUL_DOMAINS` match the frontend domain (no trailing slash).
- **Backend fails:** Check `APP_KEY` and DB vars; see **Logs** on the backend service.
- **Frontend API errors:** Ensure `NEXT_PUBLIC_API_URL` and `API_URL` end with `/api/v1`.
