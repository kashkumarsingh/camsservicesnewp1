# Next steps plan – CAMS monorepo

Prioritised roadmap of improvements and clean-up. Use as a backlog; order is by impact and dependency.

---

## 1. Notifications – finish centralisation (high) ✅ Done

**Goal:** All notification flows go through `INotificationDispatcher`; no direct `EmailNotificationService` / `DashboardNotificationService` from feature code.

| Task | Status |
|------|--------|
| Migrate scheduled jobs to dispatcher | Done: `SendSessionTodayNotifications`, `SendSessionReminders`, `SendDraftBookingReminders`, `SendPaymentReminders` use `NotificationIntentFactory` + `INotificationDispatcher`. Auto-cancel in `SendPaymentReminders` dispatches `bookingCancelled`. |
| Migrate child/approval flows | Done: `ChildChecklistController`, `ApprovalController`, `AdminChildController`, `Child` model, `ChildController` use dispatcher for checklist, child/user approved/rejected, child approval required. |
| Migrate remaining controllers | Done: `AdminBookingsController` (session confirmation request), `ProcessTrainerDeclineAndTryNextAction`, `TrainerApplicationController`, `TrainerApplication` model use dispatcher. |
| Trim legacy LaravelEmailNotificationService | Done: Approval/trainer/child methods delegate to dispatcher; PaymentConfirmation/PaymentFailed/BookingStatusUpdate/SessionCancelled TODOs resolved or documented. |

**Out of scope for now:** Activity confirmation (booking + schedule + activities) stays on `EmailNotificationService` until the dispatcher supports compound subjects or a dedicated intent.

---

## 2. Backend TODOs and small fixes (medium) ✅ Documented

| Item | Status |
|------|--------|
| Trainer / Activity category query | Documented in `docs/cleanarchitecture/backend/BACKEND_TODOS.md`. Activity has `category`; optional follow-up to replace hardcoded example lists with dynamic query. |
| Payment reminder – overdue cancellation | Implemented: 14 days overdue → auto-cancel + `bookingCancelled` via dispatcher. |
| Notification log migration | Documented: ensure `notification_logs` migration runs in all envs (`docker compose exec backend php artisan migrate`). |

---

## 3. Frontend – type safety and TODOs (medium) ✅ Addressed

**Goal:** Reduce `any` and `@ts-ignore`, resolve critical TODOs.

- **Done:** `ApiClient.ts`; `useMyBookings.ts`; `ApiBookingRepository.ts` (payload/error types, `ApiError`, `toBookingList`); `useItineraryCalculations.ts` (`ItineraryTemplate`, `Segment`, `getField: (key: string) => unknown`); SessionBuilder/CalendarBookingFlow trainer types; TrainerPicker capabilities; `useAdminChildren`, `useAdminPages`, `useAdminServices`, `useAdminActivities` (`err: unknown`, `getApiErrorMessage`); `useAuth`, `useDashboardStats`; `PackageCheckout` (user/child types). Shared `utils/errorUtils.ts` for `getApiErrorMessage` / `getApiValidationErrors`.
- **Optional follow-up:** Any remaining `err: any` in lower-traffic hooks; further tightening in `FooterClient`/`ActivityPicker` if needed.

---

## 4. Testing (medium)

**Goal:** Add tests for critical paths so refactors are safe.

- **Backend:** Feature or unit tests for: central notification dispatcher (dedupe, rate limit, channel routing), key actions (e.g. `CreateBookingAction`, `ProcessPaymentAction`), and critical API endpoints (bookings, payments, notifications).
- **Frontend:** Component or integration tests for: booking flow (session builder, payment), dashboard notifications, and auth-gated routes.
- **E2E (optional):** One happy path (e.g. book → pay → see notification) with Playwright or similar.

Start with one slice (e.g. "notification dispatcher" or "create booking API") and expand.

---

## 5. UX and accessibility (ongoing)

**Goal:** Align with `.cursorrules` (WCAG 2.1 AA, skeleton loading, zero confusion).

- **Skeletons:** Done – `DashboardSidebarSkeleton` uses `SKELETON_COUNTS.DASHBOARD_CHILDREN` and `DASHBOARD_PENDING_ACTIONS`; HomePageClient blog skeleton uses `Math.min(blogLimit, SKELETON_COUNTS.BLOG_POSTS)`. All major lists use components from `components/ui/Skeleton/` with `skeletonConstants.ts`.
- **Accessibility:** Run axe DevTools or Lighthouse on key pages (dashboard, booking flow, notifications). Fix: focus order (tab order, modal focus trap); labels (inputs, buttons); contrast (WCAG AA). Use `aria-live`/`role="status"` for dynamic messages.
- **Copy and status:** Per UX_DESIGN_PRINCIPLES – separate cards per status, clear CTAs, no mixed statuses in one block; use non-technical language.

---

## 6. Documentation and ops (lower)

- **API and runbooks:** Document critical endpoints (bookings, payments, notifications) and how to run migrations, queues, and schedulers.
- **Clean architecture docs:** Notification system is in `backend/app/Services/Notifications/README_CENTRAL_NOTIFICATIONS.md`; add similar summaries for booking and payment flows if missing.
- **Env and config:** Document required env vars for notifications (e.g. rate limits, queue name), Stripe, and WhatsApp.

---

## 7. Performance and observability (as needed)

- **ISR / cache:** CMS and pages use `revalidate` (e.g. 1800 in `ApiPageRepository`, `ApiBlogRepository`, policies, contact). On-demand revalidation: `app/api/revalidate/route.ts` with `tag` query param; backend can call it when content changes. For any new server-rendered booking/package pages, add `revalidate` and tags (e.g. `bookings`, `packages`) for on-demand invalidation.
- **Queue and jobs:** Confirm notification and reminder jobs run on the configured queue and worker; add or confirm monitoring for failed jobs and queue depth (e.g. Horizon, health endpoint).
- **Logging:** Use structured logs for payment and notification outcomes; keep PII out of logs.

---

## Suggested order of execution

1. **Week 1:** Notifications – migrate scheduled jobs and child/approval flows to the dispatcher; trim legacy service TODOs.
2. **Week 2:** Backend TODOs (Trainer/Activity, payment reminder cancellation or doc); run and verify `notification_logs` migration everywhere.
3. **Week 3:** Frontend – type safety and TODOs in payment/booking/auth code paths.
4. **Ongoing:** Tests for new or changed code; UX/accessibility and docs as part of feature work or small sprints.

Adjust order by business priority (e.g. if a regulatory or product deadline affects payments or notifications, move those items up).
