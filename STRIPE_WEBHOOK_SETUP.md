# Stripe Webhook Setup — Reusable Guide

Use this guide for any project so you never forget how to get Stripe webhooks working locally and in production.

---

## Why this matters

The **booking (or order) only updates** when:

1. Stripe sends the webhook to your backend URL.
2. Your app receives it and verifies it with **STRIPE_WEBHOOK_SECRET**.
3. Your handler processes the event (e.g. `payment_intent.succeeded`) and updates the record.

The **webhook signing secret is tied to the endpoint URL**. You need a different secret per environment:

- **Localhost:** Stripe cannot call `http://localhost:...` — use the **Stripe CLI** to forward events; the CLI gives you a **temporary secret** for that session.
- **Production:** In Stripe Dashboard you add an endpoint with your **public URL**; the Dashboard gives you a **signing secret** for that URL. Use that secret in your deployed app (e.g. Railway, Render).

---

## Quick reference: env vars

| Variable | Local | Production (e.g. Railway) |
|----------|--------|----------------------------|
| **STRIPE_SECRET_KEY** | From Dashboard → API keys | Same (copy from Dashboard) |
| **STRIPE_PUBLIC_KEY** | From Dashboard → API keys | Same (copy from Dashboard) |
| **STRIPE_WEBHOOK_SECRET** | From `stripe listen` output (CLI) | From Dashboard → Webhooks → **that endpoint’s** signing secret |

Never use the local CLI secret in production, or the Dashboard (production) secret on localhost.

**Same Stripe account per environment:** Backend and frontend must use the **same** Stripe keys (same Stripe account) for that environment. If the backend uses one set of test keys and the frontend another, payment intents and webhooks will not match and the booking will not update. In localhost, set `STRIPE_SECRET_KEY` and `STRIPE_PUBLIC_KEY` in the backend `.env`, and the frontend must use the same `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` (or equivalent) from the same Stripe Dashboard → API keys.

---

## Part 1: Localhost (development)

Stripe’s servers cannot reach `http://localhost:...`. Use the **Stripe CLI** to forward events.

### Option A: Stripe CLI on your machine (recommended)

**1. Install Stripe CLI**

- **macOS:** `brew install stripe/stripe-cli/stripe`
- **Windows (Scoop):** `scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git` then `scoop install stripe`
- **Linux (Debian/Ubuntu):**
  ```bash
  curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
  echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
  sudo apt update && sudo apt install stripe
  ```
- **WSL Ubuntu:** Use the Linux (apt) steps above in your WSL terminal.

**2. Log in once**

```bash
stripe login
```

**3. Start forwarding (keep this terminal open)**

Replace `http://localhost:9080` with your backend’s local URL and `/api/v1/webhooks/stripe` with your actual webhook path:

```bash
stripe listen --forward-to http://localhost:9080/api/v1/webhooks/stripe
```

**4. Copy the signing secret**

The CLI prints something like:

```
Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxxxxx
```

Put that in your backend `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxx
```

**5. Restart the backend** so it loads the new env. Leave the CLI running while you test payments.

---

### Option B: Stripe CLI via Docker (backend also in Docker)

If your backend runs in Docker and you want the CLI in Docker too:

1. Ensure the `stripe-cli` service in `docker-compose.yml` uses an **entrypoint** that maps `STRIPE_SECRET_KEY` → `STRIPE_API_KEY` (so the container gets the key from `backend/.env`).
2. From project root:

   ```bash
   docker compose run --rm stripe-cli listen \
     --forward-to http://backend:80/api/v1/webhooks/stripe \
     --print-secret
   ```

3. Copy the printed `whsec_...` into `backend/.env` as `STRIPE_WEBHOOK_SECRET`, restart the backend container, and leave the CLI run.

---

## Localhost troubleshooting (still not working?)

If the parent dashboard still shows "Complete payment" after a successful Stripe payment locally, work through this checklist.

**1. Stripe CLI is running and forwarding**

- In the terminal where you ran `stripe listen --forward-to http://localhost:9080/api/v1/webhooks/stripe`, you should see lines like `Forwarding...` and event types when you pay.
- If you never see any events when you complete a payment in the browser, the CLI is not receiving them (wrong Stripe account or CLI not running).
- **Forward-to URL:** If your backend runs in Docker on port 9080, use `http://localhost:9080/api/v1/webhooks/stripe` (CLI runs on the host and forwards to the host’s localhost).

**2. Webhook secret matches the CLI**

- Every time you run `stripe listen`, the CLI prints a **new** signing secret (`whsec_...`). Your backend must use that **exact** value in `STRIPE_WEBHOOK_SECRET` in `backend/.env`.
- If you restarted the CLI and didn’t update `.env`, signature verification will fail. Update `STRIPE_WEBHOOK_SECRET`, restart the backend, and try again.

**3. Same Stripe keys everywhere**

- Backend `.env`: `STRIPE_SECRET_KEY` and (if used) `STRIPE_PUBLIC_KEY` from **one** Stripe account (e.g. test keys from Dashboard → API keys).
- Frontend: the publishable key (e.g. `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`) must be from the **same** Stripe account. Different keys = different account = payment intents and webhooks won’t match your app.

**4. Check Laravel logs**

- Logs: `backend/storage/logs/laravel.log` (or `storage/logs/laravel.log` inside the backend container).
- After a test payment, look for:
  - `Stripe webhook received` — request reached the backend.
  - `Stripe webhook event verified` — signature OK and event type (e.g. `payment_intent.succeeded` or `charge.updated`).
  - `Stripe payment succeeded` / `Stripe charge succeeded` — handler ran.
  - `Failed to confirm payment after webhook` — confirmPayment failed; check the next log lines for `Payment not found`, `payment_details check`, `No checkout session found`, or `Checkout session has no booking_id`.
- If you see `Invalid Stripe webhook signature`, the webhook secret is wrong (see step 2).
- If you never see `Stripe webhook received`, the request isn’t reaching the backend (CLI not running, wrong forward-to URL, or firewall).

**5. Resend a past event (optional)**

- In Stripe Dashboard → Developers → Webhooks → (your endpoint or CLI) → find the event (e.g. `payment_intent.succeeded`) → **Resend**. Then check the logs again.

**6. Payment confirms but emails fail with "Please provide a valid cache path"**

- Payment and booking update are working; the failure is in the notification (email) layer. Laravel needs writable `storage/framework` subdirs for view/cache. Create them (e.g. inside the backend container or on the host if storage is mounted):
  ```bash
  mkdir -p backend/storage/framework/cache backend/storage/framework/sessions backend/storage/framework/views
  chmod -R 775 backend/storage/framework
  ```
- If you run the backend in Docker, run the same inside the container or ensure the volume mount doesn’t hide these directories.

---

## Part 2: Production (deployed backend)

Use a **public** backend URL. Examples: Railway, Render, Fly.io, etc.

### Steps (same for any host)

**1. Get your public API base URL**

e.g. `https://your-app-name.up.railway.app` (no trailing slash).

**2. Open Stripe Dashboard**

Go to **Developers → Webhooks** (or **Developers → Webhook destinations** in newer Stripe).

**3. Add endpoint**

- Click **Add endpoint** (or **Add destination**).
- **Endpoint URL:** `https://YOUR-PUBLIC-DOMAIN/api/v1/webhooks/stripe`  
  (replace with your real backend URL and your actual webhook path.)
- **Events:** Select at least **payment_intent.succeeded**. The backend also handles **charge.updated** (when the charge status is `succeeded`) so that if Stripe sends only that event (e.g. on localhost), the booking still updates. Add **payment_intent.payment_failed** and **payment_intent.canceled** if you want failure/cancel handling.

**4. Account selection (if asked)**

- **Your account** — Use this for a single business (your Stripe account only).
- **Connected and v2 accounts** — Only for Stripe Connect / platforms with connected accounts.

For most apps (single business, direct payments), choose **Your account**.

**5. Get the signing secret**

After saving the endpoint, open it and **Reveal** the **Signing secret** (starts with `whsec_...`). Copy it.

**6. Set the secret in your host**

- **Railway:** Project → your backend service → **Variables** → add `STRIPE_WEBHOOK_SECRET` = the `whsec_...` value.
- **Render:** Service → **Environment** → add `STRIPE_WEBHOOK_SECRET`.
- **Other:** Add `STRIPE_WEBHOOK_SECRET` to the environment where the backend runs.

Redeploy if your host doesn’t auto-redeploy on env change.

**7. Verify**

Trigger a test payment on the deployed app; the booking/order should update. You can also use **Send test webhook** in the Dashboard for that endpoint.

---

## Summary table

| Environment   | Endpoint URL (example)                          | Where the secret comes from        |
|---------------|--------------------------------------------------|------------------------------------|
| Localhost     | `http://localhost:9080/api/v1/webhooks/stripe`  | Output of `stripe listen` (CLI)    |
| Railway       | `https://your-app.up.railway.app/api/v1/webhooks/stripe` | Stripe Dashboard → that endpoint’s signing secret |
| Render / etc. | `https://your-api.onrender.com/api/v1/webhooks/stripe`   | Same as above                      |

---

## Events handled by the backend

| Event | Purpose |
|-------|---------|
| `payment_intent.succeeded` | Primary: marks payment and booking as paid. |
| `charge.updated` | When charge status is `succeeded`, confirms payment (backup if `payment_intent.succeeded` is not received, e.g. localhost). |
| `payment_intent.payment_failed` | Marks payment as failed. |
| `payment_intent.canceled` | Marks payment as canceled. |

---

## Checklist for a new project

- [ ] Backend has route: `POST /api/v1/webhooks/stripe` (or your chosen path).
- [ ] Backend reads `STRIPE_WEBHOOK_SECRET` from env and verifies the signature.
- [ ] **Local:** Stripe CLI installed; run `stripe listen --forward-to <your-local-webhook-url>`; put printed secret in `.env`.
- [ ] **Production:** In Stripe Dashboard, add endpoint with **your public webhook URL**; choose **Your account** (unless Connect); subscribe to at least `payment_intent.succeeded` (and optionally `charge.updated`, `payment_intent.payment_failed`, `payment_intent.canceled`); put that endpoint’s **signing secret** in the deployed app’s env as `STRIPE_WEBHOOK_SECRET`.
- [ ] Never use the local CLI secret in production, or the production secret on localhost.

---

*Keep this file in your repo or copy it into new projects so you never have to re-derive the steps.*
