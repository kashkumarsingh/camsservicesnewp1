# Frontend & Dashboard UI Audit

Audit date: 2025-02-19 (findings updated 2026-02-19). Checked against `.cursor/rules/frontend-ui-design-tokens.mdc` and `.cursor/rules/frontend-ui-behaviour.mdc`.

---

## Findings from UI Audit (2026-02-19)

**Canonical list of known violations — do not replicate. Use when fixing existing code or writing new UI.**

### Known violations to fix (do not replicate)

- **Never use hardcoded hex** — all brand colours exist in `tailwind.config.js`:
  - `#0080FF` → `text-primary-blue` / `border-primary-blue`
  - `#1E3A5F` → `text-navy-blue`
  - `#FFD700` → `text-star-gold`
  - `#00D4FF` → `text-light-blue-cyan`
  - `#7FFF00` → `text-orbital-green`
- **Never use `text-[11px]`** — use `text-2xs` (add to `tailwind.config.js` if not present).
- **Never use `rounded-[30px]`** — use a named radius token from `tailwind.config.js`.
- **Never use raw `<a href>` for internal routes** — always use Next.js `<Link>` (breaks prefetching and client-side navigation).

### Component API violations to fix (do not replicate)

- DataTable prop is `loading` — new code should use `isLoading`; do not add more `loading` usage.
- ParentBookingModal prop is `onSave` — new modals must use `onSubmit`; do not add more `onSave` props.
- Do not expose `handleSubmit` or `handleChange` as public component props.

### Empty states

- EmptyState component exists at `components/dashboard/universal/EmptyState.tsx`.
- All "No … yet" messages must use EmptyState with copy from a constants file.
- Never write ad hoc empty state JSX inline in a page or component.

### Status badges

- Use `getStatusBadgeClasses` / `getPaymentStatusBadgeClasses` helpers — never write inline badge classes.
- Badge helpers must include font size — never add `text-[11px]` alongside a badge helper call.

---

## Summary

| Area | Status | Notes |
|------|--------|--------|
| Design tokens / hardcoded values | **Issues** | Hex and arbitrary px in multiple files |
| Component API (loading, onSubmit) | **Issues** | Mixed `loading` vs `isLoading`; many `handleSubmit` / `onSave` |
| Shared components (Modal, Button, DataTable) | **Good** | BaseModal, Button, DataTable, EmptyState in use |
| Internal navigation | **Issues** | Raw `<a href>` in 2 places |
| Empty states | **Mixed** | EmptyState component exists; many ad hoc "No … yet" messages |
| Toasts | **Good** | No `alert()`; toastManager used |
| Icons | **Good** | lucide-react used consistently |

---

## 1. Design tokens & styling (single source of truth)

**Rule:** Colours, spacing, font sizes from Tailwind config; no hardcoded hex or arbitrary px.

### Hardcoded hex colours

- **`frontend/src/app/(public)/HomePageClient.tsx`** — Many `#0080FF`, `#1E3A5F`, `#FFD700`, `#00D4FF`, `#7FFF00`, `#FF69B4`. These exist in `tailwind.config.js` as `primary-blue`, `navy-blue`, `star-gold`, `light-blue-cyan`, `orbital-green`; use theme tokens instead.
- **`frontend/src/interfaces/web/`** — Itineraries (strategies, shared): `text-[#0080FF]`, `border-[#0080FF]`, `text-[#1E3A5F]`, `focus:ring-[#0080FF]`. Same for TrainerProfile, ServiceDetail, BlogPostDetail, ActivityCard, ActivityDetail.
- **`frontend/src/components/features/packages/PackageBookingFlow.tsx`** — `text-[#0080FF]` on links.

**Action:** Add/use Tailwind theme keys for brand colours and replace all inline hex with those tokens (e.g. `text-primary-blue`, `border-primary-blue`).

### Arbitrary font sizes / dimensions

- **`text-[11px]`** — Admin services/packages (`AdminServicesPageClient.tsx`, `AdminPackagesPageClient.tsx`), itinerary strategies, SessionDetailModal, TrainerSessionDetailModal, TrainerCard. Not in Tailwind scale.
- **`max-h-[420px]`** — Admin services and packages tables. Prefer a theme spacing/key if used elsewhere.
- **`rounded-[30px]`** — HomePageClient, TrainerProfile, ActivityCard. Consider adding to Tailwind theme for consistency.

**Action:** Add a small set of text sizes (e.g. `text-2xs`) and radius tokens in `tailwind.config.js` and replace arbitrary values.

---

## 2. Component API consistency

**Rule:** Loading = `isLoading`; modals = `isOpen` / `onClose`; submit = `onSubmit`; change = `onChange`. Booleans prefixed with `is` / `has`.

### Loading prop

- **DataTable** uses `loading` (not `isLoading`). Used across dashboard tables.
- **BlogList** uses `loading`.
- Hooks often expose `loading` (e.g. `useAuth`, `useMyBookings`, `useAdminBookings`). Acceptable at hook level; components that pass it to shared UI should map to `isLoading` when calling shared components.

**Action:** Extend DataTable (and any shared list/table) to accept `isLoading` (and support `loading` as deprecated alias) and use `isLoading` in new code.

### Submit / change handlers

- **ParentBookingModal** — Prop `onSave`; internal `handleSubmit`. Rule prefers `onSubmit` for the prop and internal handler can stay as implementation detail.
- **TrainerApplicationForm**, **SafeguardingConcernModal**, **TrainerAddClockOutModal**, **TrainerCreateSessionNoteModal**, **AddAbsenceModal**, **ActivityLogForm**, **ActivityOverrideModal**, **NewsletterSubscribe** — Use `handleSubmit` for the form `onSubmit` handler (internal name). Rule applies to **public component API**: parent should pass `onSubmit`, not `onSave` / `handleSubmit` as prop names.
- **AvailabilitySidePanel** — `onSave(month)`. For a save action this is acceptable; if it were form submit, `onSubmit` would be preferred.
- **SafeguardingConcernModal** — `handleChange` for field updates. Prefer `onChange` in the component's public API for consistency.

**Action:** Where a component's prop is the "submit" or "change" callback, name it `onSubmit` / `onChange`; keep internal `handleSubmit` / `handleChange` as implementation details.

---

## 3. Shared components usage

**Rule:** Use shared Modal, Button, inputs, skeletons, EmptyState; no inline reimplementation.

### Modals

- **BaseModal** from `@/components/ui/Modal` is used in ParentBookingModal, AttendanceModal, TrainerSessionDetailModal. Good.
- Ensure all new modals use BaseModal and follow Escape/backdrop/focus/close button and cancel-left / primary-right.

### Tables & lists

- **DataTable** uses **EmptyState**, **TableRowsSkeleton** / **ListRowsSkeleton**, **SKELETON_COUNTS**. Good.
- **AdminBookingsPageClient** uses TableRowsSkeleton and has loading/error handling; status badges use colour helpers (`getStatusBadgeClasses`, `getPaymentStatusBadgeClasses`). Those helpers do not yet include font size — call sites still add `text-[11px]` inline. Fix: move font size into the helpers so no `text-[11px]` (or `text-2xs`) is needed at call sites.

### Empty states

- **EmptyState** exists in `components/dashboard/universal/EmptyState.tsx` with `title`, `message`, `action`.
- Many places still use ad hoc copy: e.g. "No logs yet", "No entries yet", "No qualifications uploaded yet", "No notes yet", "No sessions booked yet", "No children added yet", "No timesheet entries available yet". These should use EmptyState (or a thin wrapper) with copy from a constants file.

**Action:** Replace ad hoc "No … yet" blocks with EmptyState (or shared variant) and centralise copy.

### Status badges

- Helpers `getStatusBadgeClasses` and `getPaymentStatusBadgeClasses` (e.g. in AdminBookingsPageClient, and similar in AdminServicesPageClient / AdminPackagesPageClient) give consistent colours but do not include font size. Call sites add `text-[11px]` next to the helper output, which duplicates the violation and scatters font size.
- **Action:** Have badge helpers return a full className string that includes the correct font size (e.g. `text-2xs` from theme). Remove all `text-[11px]` (or any font class) from JSX that uses these helpers.

---

## 4. Navigation

**Rule:** Internal links use Next.js `<Link>`, not raw `<a href>`.

### Raw `<a href>` for internal routes

- **`frontend/src/components/features/packages/PackageBookingFlow.tsx`** — `<a href="/packages">` (two places). Replace with `<Link href="/packages">`.
- **`frontend/src/components/booking/forms/BookingRetrievalForm.tsx`** — `<a href="/contact">`, `<a href="/packages">`. Replace with `<Link href="…">`.

**Action:** Replace with `<Link>` and keep styling (e.g. underline, colour via Tailwind token).

---

## 5. Forms

**Rule:** Shared input components; label → input → helper/error; submit disabled while submitting; preserve input on error.

- Parent dashboard and modals use forms with validation and toasts; submit state is generally handled.
- **ParentBookingModal** uses `onSave` and disables submit during save; preserve input on error is expected. Align prop name to `onSubmit` for consistency.

---

## 6. Icons & typography

- **Icons:** lucide-react used across dashboard and public pages. No mixed icon libraries found. Good.
- **Typography:** Headings and body use Tailwind classes; main issue is arbitrary `text-[11px]` and similar. Move to theme scale.

---

## 7. Recommended order of work

1. **Internal links (do first — bugs, not style)**
   - Replace raw `<a href>` with Next.js `<Link>` in PackageBookingFlow and BookingRetrievalForm. These break prefetching and client-side navigation; ~2-minute fix.
2. **Empty states (high priority — most visible to users)**
   - Introduce a constants file for empty-state title/message/action copy.
   - Replace all ad hoc "No … yet" JSX with EmptyState (or shared variant) using that constants file. Keeps copy in sync and avoids scattered inconsistency.
3. **Theme and tokens**
   - Add `text-2xs` (and any radius token e.g. `rounded-card`) to `tailwind.config.js`.
   - Replace all hardcoded hex with theme tokens; replace `text-[11px]` and `rounded-[30px]` with named tokens.
4. **Status badges**
   - Update `getStatusBadgeClasses` / `getPaymentStatusBadgeClasses` (and any similar badge helpers) to include font size (e.g. `text-2xs`) in the returned class string. Remove every `text-[11px]` (or `text-2xs`) at call sites that use these helpers.
5. **Component API**
   - DataTable: add `isLoading` (and deprecate or alias `loading`).
   - ParentBookingModal: rename prop `onSave` → `onSubmit` (with backward-compat or one-shot migration).
   - SafeguardingConcernModal: consider exposing `onChange`-style API if used as a reusable form.

---

## 8. Dashboard-specific notes

- **Parent dashboard** — Uses shared modals, ToastContainer, DashboardSkeleton, Button, Link. Main improvements: tokenise colours in any dashboard-specific blocks and ensure all empty states use EmptyState + constants.
- **Admin dashboard** — AdminBookingsPageClient, AdminServicesPageClient, AdminPackagesPageClient use skeletons and tables and status badge helpers. The helpers are the right pattern but today call sites still add `text-[11px]` alongside them. Fix: badge helpers must absorb font size so no inline `text-[11px]` remains; use theme token `text-2xs` inside the helpers.
- **Trainer dashboard** — Uses BaseModal, shared patterns; same token and empty-state improvements apply.

---

## References

- Design tokens & single source of truth: `.cursor/rules/frontend-ui-design-tokens.mdc`
- Component API & behaviour: `.cursor/rules/frontend-ui-behaviour.mdc`
- Tailwind config: `frontend/tailwind.config.js`
- Shared UI: `frontend/src/components/ui/` (Button, Modal, Skeleton, Toast, etc.)
- Universal dashboard: `frontend/src/components/dashboard/universal/` (DataTable, EmptyState)
