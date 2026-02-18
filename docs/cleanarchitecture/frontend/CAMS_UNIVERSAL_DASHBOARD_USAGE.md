# CAMS Services (camsservicep1) – Role-Based Dashboard (Independent of Public Pages)

## Summary

The project has **one** dashboard: a **role-based dashboard** (admin, parent, trainer) that is **independent of public pages**. The app’s dashboard shell lives in **`frontend/src/components/dashboard/`**. The **`universal-dashboard/`** folder at repo root is a **reference/template** only (not imported by the app). All dashboard experiences live under `/dashboard/*`.

---

## How It Works

1. **Single dashboard entry**  
   - **`/dashboard`** is the only dashboard entry. It shows a role picker (Parent / Trainer / Admin). After login, users can be redirected by role to `/dashboard/parent`, `/dashboard/trainer`, or `/dashboard/admin` (see `getDashboardRoute` in `utils/navigation.ts`).

2. **Dashboard shell (app-owned)**  
   `frontend/src/components/dashboard/layout/DashboardShell.tsx` is the layout used for all `/dashboard/*` routes. The reference/template lives in repo root `universal-dashboard/` and is not used by the app at build time.

3. **Layout**  
   - **File:** `frontend/src/app/dashboard/layout.tsx`  
   - Renders `<DashboardShell>{children}</DashboardShell>` so all routes under `/dashboard/*` use the same shell (navbar + sidebar). Project-specific behaviour (e.g. auth guard) can be added in this layout if needed.

4. **Role-based content**  
   - **Parent:** `app/dashboard/parent/page.tsx` and sub-routes (bookings, children, progress, settings, `bookings/[id]/sessions`) render the real parent dashboard (calendar, bookings, session booking).  
   - **Trainer:** `app/dashboard/trainer/page.tsx` and sub-routes (bookings, schedules, settings, etc.) render the real trainer dashboard.  
   - **Admin:** Placeholder pages under `app/dashboard/admin/` until wired to real admin features.

5. **No legacy routes.** There are no redirects from old URLs. The only dashboard routes are under `/dashboard/*`. Do not add `(public)/dashboard` or `(trainer)/trainer`.

---

## Routes

| Route | Content | Shell |
|-------|---------|--------|
| `/dashboard` | Role picker (Parent / Trainer / Admin) | Yes |
| `/dashboard/parent` | Parent dashboard (calendar, bookings) | Yes |
| `/dashboard/parent/bookings` | Parent bookings | Yes |
| `/dashboard/parent/bookings/[id]/sessions` | Parent: book sessions for a package | Yes |
| `/dashboard/parent/children`, `progress`, `settings` | Parent sub-pages | Yes |
| `/dashboard/trainer` | Trainer dashboard (overview) | Yes |
| `/dashboard/trainer/bookings`, `schedules`, `settings` | Trainer sub-pages | Yes |
| `/dashboard/trainer/bookings/[id]`, `bookings/[id]/sessions` | Trainer booking detail & session booking | Yes |
| `/dashboard/admin` and `/dashboard/admin/*` | Admin placeholders | Yes |

Public pages (home, about, services, packages, login, register, etc.) remain under `(public)` and do **not** include dashboard UI. The dashboard is a separate, role-based area.

---

## Files Touched (Project Only)

| File | Purpose |
|------|---------|
| `src/app/dashboard/layout.tsx` | Uses `DashboardShell` directly for all `/dashboard/*` routes. |
| `src/app/dashboard/page.tsx` | Role picker (only dashboard entry). |
| `src/app/dashboard/parent/page.tsx` | Renders parent dashboard client. |
| `src/app/dashboard/parent/bookings/[id]/sessions/page.tsx` | Parent session booking. |
| `src/app/dashboard/trainer/page.tsx` | Renders trainer dashboard client. |
| `src/app/dashboard/trainer/bookings/*`, `schedules`, `settings` | Trainer sub-pages. |
| `src/app/(public)/dashboard/` | **Removed.** No legacy public dashboard. |
| `src/app/(trainer)/` | **Removed.** No legacy trainer route group; trainer UI lives under `app/dashboard/trainer/`. |
| `src/utils/navigation.ts` | `getDashboardRoute` and `getParentDashboardRoute` point to `/dashboard/parent`, `/dashboard/trainer`, `/dashboard/admin`. |
| `src/components/dashboard/layout/DashboardShell.tsx` | App’s dashboard shell (navbar + sidebar). Reference/template is in repo root `universal-dashboard/` only. |

All in-app links that referred to “dashboard” for parents use **`/dashboard/parent`**; for trainers, **`/dashboard/trainer`** (or the appropriate sub-route).
