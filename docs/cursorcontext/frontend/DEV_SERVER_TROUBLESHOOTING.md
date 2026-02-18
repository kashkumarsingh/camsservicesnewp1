# Frontend Dev Server Troubleshooting

## ERR_CONNECTION_RESET on RSC / Turbopack chunks

**Symptom:** Console shows `Failed to load resource: net::ERR_CONNECTION_RESET` for a file like `node_modules_next_dist_compiled_react-server-dom-turbopack_*.js`, often when loading a page (e.g. `/checkout?package=earth`).

**Cause:** The Next.js dev server connection was dropped before the chunk finished loading. Common triggers:

- Dev server restarted or crashed (e.g. after a file save or HMR)
- WSL2 / VPN / firewall closing the connection
- Turbopack instability in some environments

**What to do:**

1. **Hard refresh** the page (Ctrl+Shift+R / Cmd+Shift+R). Often the server is back and the page loads.
2. **Restart the dev server:** stop it (Ctrl+C) and run `npm run dev` again.
3. **Clear Next cache and restart:**
   ```bash
   rm -rf .next && npm run dev
   ```
4. **Use webpack instead of Turbopack** if the reset keeps happening:
   ```bash
   npm run dev:webpack
   ```
   This runs `next dev` without the `--turbopack` flag. Slightly slower HMR, but more stable on some setups.

---

## "Unable to add filesystem: &lt;illegal path&gt;"

**Symptom:** Browser or DevTools shows `Unable to add filesystem: <illegal path>`.

**Cause:** This comes from **Chrome DevTools**, not from the Next.js app. It appears when you add a folder to the DevTools **Sources → Workspace** (or older “Filesystem”) with a path that Chrome rejects (e.g. invalid format, special characters, or permission issues).

**What to do:**

- Ignore it if you are not using DevTools workspace mapping; it does not affect the app.
- If you use workspaces: add the project folder with a valid path (e.g. `/home/buildco/camsservicep1/frontend`), grant the permission prompt, and avoid paths with invalid characters.

---

## Port (e.g. 4300)

The app may run on port 4300 if `NEXT_PUBLIC_SITE_URL` or `PORT` is set (e.g. in `.env` or `env.template`). Default with `next dev` is 3000. Ensure nothing else is using the chosen port.

---

## "Page not found" / 404 API errors (RESOURCE_NOT_FOUND)

**Symptom:** Console shows API errors with `errorCode: RESOURCE_NOT_FOUND`, status 404, often on initial page load (GET /). Two identical failing calls are common (server + client or duplicate fetches).

**What’s happening:** The frontend calls `http://localhost:9080/api/v1/...`. If the backend is down, or a resource (e.g. the home page) doesn’t exist in the DB, the API returns 404.

**1. See exactly which URLs fail**

In development, the API client logs every request and every non-OK response:

- `[ApiClient] GET http://localhost:9080/api/v1/...` — request URL
- `[ApiClient] GET ... -> 404 RESOURCE_NOT_FOUND` — response status and error code

Use these to see the exact failing endpoint (e.g. `/api/v1/pages/home`, `/api/v1/site-settings`).

**2. Check the backend is running on port 9080**

From the project root:

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:9080/api/v1/health
```

- **200** — backend is up; focus on the specific endpoint (e.g. missing data).
- **Connection refused / no response** — start the backend, e.g. `docker compose up -d backend` (or your usual backend start).
- **404** — backend may be up but route not registered; try `docker compose exec backend php artisan route:clear` and restart the backend.

**3. Fix missing data (e.g. home page)**

If the failing URL is `GET /api/v1/pages/home`, the "home" page row is missing. Seed it:

```bash
docker compose exec backend php artisan db:seed --class=StaticPagesSeeder
# or run all seeders (includes StaticPagesSeeder):
docker compose exec backend php artisan db:seed
```

After seeding, reload the frontend; the home page request should return 200.

**4. Frontend env**

Ensure the frontend points at the correct API base:

- `NEXT_PUBLIC_API_URL=http://localhost:9080/api/v1` (browser)
- `API_URL=http://backend:80/api/v1` when frontend runs in Docker and talks to the backend service.
