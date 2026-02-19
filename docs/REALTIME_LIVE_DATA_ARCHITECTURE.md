# Real-Time Live Data and Notifications – Architecture and Improvement Options

## Current Gaps

What’s missing from the current implementation that users might expect:

| Gap | Status / behaviour |
|-----|-------------------|
| **Real-time notifications** | **Addressed via WebSocket only:** bell and list update on broadcast (no polling). |
| **No push to browser/OS** | No Web Push, no OS notifications when the tab is in the background. |
| **No presence indicators** | No “who’s online” or typing/active status. |
| **No activity feed broadcasts** | No live stream of “X did Y” across the app (e.g. “Admin assigned a trainer”). |

Push, presence, and activity feed are optional (see Implementation Stages below).

---

## Current Implementation Summary

| Layer | Implementation |
|-------|----------------|
| **Backend** | Broadcasts `LiveRefreshContextsUpdated` via Reverb/Pusher. |
| **Frontend** | **WebSocket (Echo) only:** subscribe to private channel, listen for event → `notifyContext()` → refetch. No polling. |
| **Notifications** | Central dispatcher + in-app bell; real-time via broadcast when Reverb is running. |
| **Manual invalidation** | `liveRefreshContext.invalidate('bookings')` etc. after actions. |

---

## Are live refresh and notifications working / running?

**Short answer:** The **code is implemented**. They are **only running** if you have completed setup and started the Reverb server.

| Question | Answer |
|----------|--------|
| **Is the code there?** | Yes. Backend broadcasts; frontend subscribes via Echo. Notifications create a `UserNotification` and trigger a broadcast; the bell refetches when the WebSocket event is received. |
| **Are they running right now?** | Only if: (1) Reverb is installed in the backend, (2) the Reverb server is running (e.g. `reverb` container or `php artisan reverb:start`), and (3) the frontend has `NEXT_PUBLIC_LIVE_REFRESH_WEBSOCKET_ENABLED=true` and Reverb client env vars. |
| **If Reverb is not running?** | Notifications are still **stored** (bell data comes from the API). The bell does **not** update in real time until the next page refresh or manual refresh. Live refresh (bookings, children, etc.) also does not update until you refresh. |
| **How do I check?** | See [How to check if it’s running](#how-to-check-if-its-running) below. |


### "There are no commands defined in the reverb namespace"

If the reverb container fails with this error, the mounted `./backend` directory has an empty or incomplete `vendor` (both backend and reverb mount `./backend:/var/www/html`). Fix by installing dependencies in the backend container, then restart reverb:

```bash
docker compose exec backend composer install --no-interaction
docker compose up -d reverb
```

### How to check if it’s running

1. **Reverb server:**  
   `docker compose ps` – you should see a `reverb` (or backend) service, and something listening on port 8080, e.g. `lsof -i :8080` or `curl -s http://localhost:8080` (Reverb may respond or close the connection).

2. **Backend broadcasting:**  
   In backend `.env` or Docker env: `BROADCAST_CONNECTION=reverb`. If it’s `log` or `null`, broadcasts are not sent to Reverb.

3. **Frontend WebSocket:**  
   In frontend `.env.local` or Docker env: `NEXT_PUBLIC_LIVE_REFRESH_WEBSOCKET_ENABLED=true` and `NEXT_PUBLIC_REVERB_APP_KEY`, `NEXT_PUBLIC_REVERB_WS_HOST`, `NEXT_PUBLIC_REVERB_WS_PORT` set. Open the app, log in, open DevTools → Network → WS: you should see a connection to the Reverb host/port.

4. **Live test (notification bell):**  
   - **Option A (checklist → admin bell):** Log in as **parent** in one browser and **admin** in another (or incognito). On the parent dashboard, add a child and submit the child’s checklist. In the **admin** window, the notification bell count should increase **without** refreshing the page (new “Child checklist submitted” notification).  
   - **Option B (admin → parent bell):** As admin, create a notification for the parent (e.g. assign a trainer to a session). In the **parent** window, the bell count should update without refresh.  
   If the bell only updates after a manual refresh, Reverb or the frontend WebSocket config is not running or not connected.

5. **Live test (admin Today’s activity):**  
   As **admin**, open the dashboard and check the right sidebar **“Today’s activity”** (In progress / Upcoming). In another tab or device, as a **trainer**, clock in to a session or update “What I’m doing”. The admin sidebar should update **without** pressing Refresh (session appears in “In progress”, trainer name and latest activity reflect). If you must press the Refresh button to see the change, Reverb is not connected: ensure `NEXT_PUBLIC_LIVE_REFRESH_WEBSOCKET_ENABLED=true` and the Reverb server is running.

### Troubleshooting: “Bell doesn’t update until I reopen the modal or refresh”

If the notification bell only shows new items after you open the dropdown again or refresh the page, the live WebSocket path is not active. Use this checklist:

| Check | What to do |
|-------|------------|
| **1. Reverb server running** | `docker compose ps` – ensure `reverb` (or `camsservice-reverb`) is **Up**. If missing, run `docker compose up -d reverb`. From host: `curl -s -o /dev/null -w "%{http_code}" http://localhost:8080` (Reverb may return 200 or close; port must be open). |
| **2. Backend broadcasting** | Backend `.env` or Docker env must have `BROADCAST_CONNECTION=reverb`. If it’s `log` or empty, Laravel won’t send events to Reverb. |
| **3. Frontend WebSocket enabled** | Frontend must have `NEXT_PUBLIC_LIVE_REFRESH_WEBSOCKET_ENABLED=true`. For **Next.js** this is baked in at **build time** for production; for `npm run dev` it’s read from `.env.local` at runtime. |
| **4. Reverb client vars** | Frontend needs `NEXT_PUBLIC_REVERB_APP_KEY`, `NEXT_PUBLIC_REVERB_WS_HOST`, `NEXT_PUBLIC_REVERB_WS_PORT` (and optionally `NEXT_PUBLIC_REVERB_SCHEME`). If you run the app in the browser on the host, use `localhost` and `8080` so the browser can reach the Reverb container’s published port. |
| **5. Echo connection** | After logging in, open DevTools → **Network** → filter **WS**. You should see a WebSocket connection to your Reverb host:port. If there is no WS connection, Echo didn’t start (check env and that `laravel-echo` / `pusher-js` are installed). |
| **6. Private channel auth** | Echo subscribes to `private-live-refresh.{userId}`. That uses `POST /api/v1/broadcasting/auth` with the Bearer token. If auth fails (401), the channel subscription fails and you won’t get events. Ensure the user is logged in and the token is valid. |

After fixing, trigger a notification again (e.g. trainer clocks in, or admin assigns a trainer); the bell should update without reopening the modal.

---

## Improvement Options

### 1. Laravel Broadcasting + WebSockets (primary)

- Laravel broadcasts to a private channel (e.g. per user); Next.js subscribes via **Laravel Echo** (Reverb or Pusher).
- On event, frontend calls same `notifyContext(...)` so existing refetches run. **WebSocket only – no polling.**

### 2. Server-Sent Events (SSE)

- Long-lived stream from Laravel; Redis pub/sub to push “context X changed.” Requires auth via cookie or Next.js proxy (EventSource cannot send `Authorization` header).

### 3. Redis for context versions (optional)

- Store last-updated per context in Redis if the broadcast pipeline needs it; WebSocket remains the only client notification path.

## Implementation Stages

Break rollout into stages instead of doing everything at once:

| Stage | What’s in place | Frontend | Backend |
|-------|------------------|----------|---------|
| **Stage 0** | No live refresh. | Manual `invalidate()` only. | — |
| **Stage 1** | Broadcast events; no frontend change yet. | Manual only. | Emit `LiveRefreshContextsUpdated`; Reverb optional. |
| **Stage 2 (WebSocket – primary)** | Real-time only; WebSocket only, no polling. | Echo subscribes; on event → `notifyContext()`. | `BROADCAST_CONNECTION=reverb`, Reverb running. |
| **Stage 3 (Optional)** | Push, presence, activity feed. | Push subscription (Web Push API), presence channel subscription, activity feed UI. | Push payloads, presence channels, activity events. |

## Recommended direction

1. **Now:** Use **Laravel Reverb** (or Pusher) + broadcast event `LiveRefreshContextsUpdated` with `{ contexts: ['bookings', ...] }`. Trigger from model observers or listeners. Frontend: **Echo** subscribes to private channel; on event → `notifyContext`. **WebSocket only – no polling.**
2. **Optional:** Cache context versions in Redis if needed for server-side logic.

## Target architecture

```
Laravel → Reverb/Pusher (private channel per user / admin channel)
Next.js → Echo subscribes → on event → notifyContext() → refetch
WebSocket only – no polling
```

See backend event `App\Events\LiveRefreshContextsUpdated` and frontend `LiveRefreshContext` + Echo wiring (when Reverb is enabled).

---

## What Breaks If…

Risk scenarios and how the system behaves:

| Scenario | Outcome |
|----------|--------|
| **Reverb crashes** | No live updates until Reverb is back; manual refresh or invalidate still works. ✓ |
| **WebSocket connected** | Updates are instant. ✓ |
| **Auth fails (e.g. token expired)** | Echo subscribe fails; manual refresh or re-login. ✓ |
| **User loses internet** | Last cached state shown; when connection returns, Echo reconnects and state can be refreshed. ✓ |

---

## Concrete Payload Examples

**Broadcast event payload** (sent over WebSocket to Echo, event name `LiveRefreshContextsUpdated`):

```json
{
  "contexts": ["notifications", "bookings"]
}
```

---

## Trigger Points Checklist

Where `LiveRefreshBroadcastService::notify(...)` is called so the right users get live-refresh:

| When | Call | Notes |
|------|------|--------|
| **UserNotification created** | `notify(['notifications'], [$userId])` | Done in `DashboardNotificationService`. |
| **Booking created/updated/deleted** | `notify(['bookings'], [$parentUserId, ...trainerUserIds], true)` | `BookingObserver`: parent + trainer user IDs + admins. |
| **BookingSchedule created/updated/deleted** | `notify(['bookings', 'trainer_schedules'], [$parentUserId, $trainerUserId], true)` | `BookingScheduleObserver`: parent, trainer, admins. |
| **Child created/updated/deleted** | `notify(['children'], [$parentUserId], true)` | `ChildObserver`: parent + admins. |
| **TrainerAvailability** | `notify(['trainer_availability', 'trainer_schedules'], [$trainerUserId], true)` | `TrainerAvailabilityObserver`; bulk path: `SetTrainerAvailabilityDatesAction` calls notify once after transaction. |
| **TrainerAbsenceRequest created/updated/deleted** | `notify(['trainer_availability', 'trainer_schedules'], [$trainerUserId], true)` | `TrainerAbsenceRequestObserver`: trainer + admins. |
| **Payment processed** | `notify(['notifications'], [$userId])` | Often covered by UserNotification. |
| **Admin-only system change** | `notify([...contexts], [], true)` | Only admins (e.g. bulk action). |
| **Trainer clock-in / clock-out** | `notify(['bookings', 'trainer_schedules'], [parentUserId, trainerUserId], true)` | Done in `TrainerTimeEntryController::recordTimeEntry` so admin and parent see live session (clock-in, current activity) without refresh. |
| **Trainer updates current activity** (e.g. "performed X at location") | `notify(['bookings', 'trainer_schedules'], [parentUserId, trainerUserId], true)` | Done in `TrainerScheduleController::updateCurrentActivity` so Session activity timeline and "Right now" update live for admin and parent. |
| **Trainer creates or updates an activity log** | `notify(['bookings', 'trainer_schedules'], [parentUserId, trainerUserId], true)` | Done in `TrainerActivityLogController::store` and `update` so Activity logs list and Session activity panel update live for admin and parent. |

**Live session view:** Admin dashboard schedule calendar subscribes to `trainer_schedules` and `trainer_availability`; admin overview subscribes to `bookings` and `trainer_schedules`. When a trainer clocks in, updates “what I’m doing”, or clocks out, the backend broadcasts so admin and parent see the update without manual refresh.

---

## Frontend Wiring Diagram

```
LiveRefreshContext (WebSocket only + manual invalidate)
  │
  └─ useEffect (when WEBSOCKET_ENABLED and config): Echo only
       ├─ Initialize with authEndpoint + Bearer token
       ├─ Subscribe to private('live-refresh.' + userId)
       ├─ If admin: subscribe to private('live-refresh.admin')
       └─ Listen '.LiveRefreshContextsUpdated' → notifyContext(ctx) for each payload.contexts

Components use useLiveRefresh(context, refetch) → same as today (no changes)
```

---

## Docker: run and set

Config is set in `docker-compose.yml`: backend and reverb services have `BROADCAST_CONNECTION=reverb` and Reverb env vars; frontend service has `NEXT_PUBLIC_LIVE_REFRESH_WEBSOCKET_ENABLED=true` and Reverb client vars (browser connects to `localhost:8080`).

**One-time setup (get Reverb into the lock file so the image builds):**

Your host may have PHP 8.3 while the project requires PHP 8.4, so use one of:

- **Option A (recommended)** – use PHP 8.4 in Docker to update the lock file:
  ```bash
  ./backend/scripts/update-composer-lock.sh
  ```
- **Option B** – on the host (PHP 8.3 is fine; use `--ignore-platform-reqs`):
  ```bash
  cd backend && composer update laravel/reverb --no-interaction --no-scripts --ignore-platform-reqs
  ```

Then rebuild and start:

```bash
docker compose up -d --build
```

**Start the stack (including Reverb on port 8080):**

```bash
docker compose up -d
```

Reverb will listen on host port **8080**. If you run the frontend in Docker (`docker compose --profile frontend up -d`), the app is at `http://localhost:4300` and the browser connects to `ws://localhost:8080` for live refresh. If you run the frontend locally (`cd frontend && npm run dev`), create `frontend/.env.local` from `frontend/env.reverb.example` with `NEXT_PUBLIC_REVERB_WS_HOST=localhost`, `NEXT_PUBLIC_REVERB_WS_PORT=8080`, and the same app key as in docker-compose (`local-dev-key`).

---

## Enabling WebSockets (Reverb)

1. **Backend (in Docker):**
   ```bash
   docker compose exec backend php artisan install:broadcasting --reverb
   docker compose exec backend composer require laravel/reverb
   ```
   Configure `.env`: `BROADCAST_CONNECTION=reverb`, and Reverb env vars from `php artisan reverb:install`. Run the Reverb server (e.g. `php artisan reverb:start` or a process manager).

2. **Broadcasting auth:** The API route `POST /api/v1/broadcasting/auth` is already registered under `auth:sanctum` so Echo can authenticate private channels with the Bearer token.

3. **Frontend:** Install WebSocket deps when enabling Reverb: `npm install laravel-echo pusher-js`. The Echo subscription is not in the main bundle by default (so the app builds without these deps); when you enable Reverb, add a `useEffect` in `LiveRefreshContext.tsx` that dynamically imports `laravel-echo` and `pusher-js`, creates Echo with `authEndpoint` and Bearer token, subscribes to `private('live-refresh.' + user.id)` and `private('live-refresh.admin')` for admins, and listens for `.LiveRefreshContextsUpdated` to call `notifyContext(ctx)` for each payload context. Set in `.env.local`: `NEXT_PUBLIC_LIVE_REFRESH_WEBSOCKET_ENABLED=true`, `NEXT_PUBLIC_REVERB_APP_KEY`, `NEXT_PUBLIC_REVERB_WS_HOST`, `NEXT_PUBLIC_REVERB_WS_PORT`, `NEXT_PUBLIC_REVERB_SCHEME` (match backend Reverb config).

4. **Triggering broadcasts:** Notifications already trigger `LiveRefreshContextsUpdated` for the recipient when an in-app notification is created. For bookings/children/schedules you can call `LiveRefreshBroadcastService::notify(['bookings'], [$userId], $notifyAdmins)` from controllers or observers after mutations.

---

## Config required (env templates)

Copy the following into your real env files (values are placeholders; replace with your Reverb install output):

- **Backend:** Copy `backend/env.reverb.example` into `backend/.env` (or append its contents). Then run `php artisan reverb:install` to generate real `REVERB_APP_ID`, `REVERB_APP_KEY`, `REVERB_APP_SECRET` and update `.env`.
- **Frontend:** Copy `frontend/env.reverb.example` into `frontend/.env.local` (or append). Set `NEXT_PUBLIC_REVERB_*` to match your backend Reverb config (same key, host, port, scheme).

| Backend (`.env`) | Frontend (`.env.local`) |
|------------------|-------------------------|
| `BROADCAST_CONNECTION=reverb` | `NEXT_PUBLIC_LIVE_REFRESH_WEBSOCKET_ENABLED=true` |
| `REVERB_APP_ID`, `REVERB_APP_KEY`, `REVERB_APP_SECRET` | `NEXT_PUBLIC_REVERB_APP_KEY` (same as backend key) |
| `REVERB_HOST`, `REVERB_PORT`, `REVERB_SCHEME` | `NEXT_PUBLIC_REVERB_WS_HOST`, `NEXT_PUBLIC_REVERB_WS_PORT`, `NEXT_PUBLIC_REVERB_SCHEME` |

## Environment Setup Checklist

Step-by-step for the team:

- [ ] **Backend:** Copy `backend/env.reverb.example` into `backend/.env`; run `php artisan reverb:install` to generate credentials and update `.env`
- [ ] **Backend:** Set `BROADCAST_CONNECTION=reverb` in `.env`
- [ ] **Backend:** Run `php artisan reverb:start` (dev); for production run Reverb as a systemd service or Supervisor process
- [ ] **Frontend:** Copy `frontend/env.reverb.example` into `frontend/.env.local` and set values to match backend
- [ ] **Frontend:** Set `NEXT_PUBLIC_LIVE_REFRESH_WEBSOCKET_ENABLED=true` and Reverb vars in `.env.local`
- [ ] **Frontend:** `npm install laravel-echo pusher-js` (Echo subscription is already in `LiveRefreshContext.tsx`)
- [ ] **Test:** Create a notification (e.g. assign trainer); verify bell updates in real time via WebSocket
- [ ] **Test:** Stop Reverb; verify manual refresh and invalidate still work (no live updates until Reverb is back)
- [ ] **Deploy:** Run Reverb as systemd service or Supervisor so it restarts on failure

---

## Monitoring Commands

How to verify it’s working:

```bash
# Check Reverb is listening (default port 8080; adjust if configured)
lsof -i :8080

# Emit a test broadcast (replace 1 with a real user id)
docker compose exec backend php artisan tinker
>>> broadcast(new \App\Events\LiveRefreshContextsUpdated(['notifications'], [1], false));

# If Reverb exposes metrics (e.g. dashboard or /metrics), check connections
curl -s http://localhost:8080/metrics
```

Reverb’s default port may be in `config/reverb.php` or `.env` (`REVERB_PORT`); use that port in `lsof` and `curl` if different.
