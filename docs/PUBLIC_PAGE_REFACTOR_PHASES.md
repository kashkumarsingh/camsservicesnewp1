# Public Page Refactor — Phased Plan

Same pattern as the Home page refactor: extract constants, section components, shared hooks where useful, and slim page clients. One phase at a time.

---

## Page clients (by line count, as of audit)

| Page | Lines | Hooks | Main issues |
|------|-------|--------|-------------|
| **ContactPageClient** | ~1059 | useContactForm, useState×10+, useEffect (validation) | Huge form + hero, stats strip, form, sidebar (benefits, contact, hours), visit section, CTA; many hardcoded strings; repetitive input+validation UI |
| **RegisterPageClient** | ~636 | useAuth, useState×6, useEffect×2 | Form + validation; hardcoded copy; similar pattern to Contact (could share form-field pattern later) |
| **BookingDetailPageClient** | ~515 | (audit needed) | Booking detail + actions |
| **BookingsCallbackPageClient** | ~409 | useBooking, useState×6, useCallback, useRef | Payment callback flow; status UI; some hardcoded strings |
| **LoginPageClient** | ~276 | useAuth | Smaller; still can use constants |
| **BookingPaymentPageClient** | ~244 | (audit needed) | Payment form |
| **BlogPageClient** | ~158 | (minimal) | Already moderate; optional copy to constants |
| **HomePageClient** | ~218 | useHomePageData | ✅ Done |

---

## Phases

### Phase 1 — Contact page (~1059 → ~150–200 target)

**Findings:**
- One hook: `useContactForm`. Many local `useState` (formData, errors, touched, isValid, childErrors, childValid, isSubmitting, hasSubmitted, submitAttempted).
- Large `useEffect` for real-time validation (could stay in page or move to `useContactFormState`).
- **Sections:** Hero, Stats strip, Two-column (Form | Sidebar: benefits, contact buttons, office hours), Visit our centre (map + address/hours), Bottom CTA.
- **Hardcoded copy:** Hero (title, subtitle, trust badges, CTAs), stats (500+, 10+, 98%, 24h), form labels/placeholders/options/validation messages, sidebar (“Why families choose us”, benefits list, “Prefer to talk?”, office hours), visit section (“Visit our centre”, “Map coming soon”, “Address coming soon”, “Get directions”, “Parking & access”, “Book a visit”), bottom CTA, success/error messages.
- **Design:** Use `rounded-card` / design tokens where applicable; no new hex.

**Steps:**
1. **Constants** — `frontend/src/components/contact/constants.ts`: hero, stats, form labels/placeholders/options, sidebar copy, visit section, CTA, validation fallbacks.
2. **Section components** — Under `frontend/src/components/contact/`:
   - `ContactHeroSection.tsx` — title, subtitle, trust badges, primary + phone CTA.
   - `ContactStatsStrip.tsx` — 4 stat cards (configurable items).
   - `ContactFormSection.tsx` — form wrapper + all fields (receives form state + handlers from page or from a hook); uses constants for labels/placeholders.
   - `ContactSidebar.tsx` — “Why families choose us” list, contact buttons, office hours (data from constants).
   - `ContactVisitSection.tsx` — “Visit our centre”, map embed, address, parking, book a visit.
   - `ContactCTASection.tsx` — “Ready to take the first step?” + buttons.
3. **Optional:** `useContactFormState.ts` — form state + validation effect + handlers (can be Phase 1b to avoid one huge step).
4. **Slim ContactPageClient** — Compose sections; pass props; keep submit + redirect logic in page (or in useContactForm). Remove inline section JSX.

**Files to create:**
- `frontend/src/components/contact/constants.ts`
- `frontend/src/components/contact/ContactHeroSection.tsx`
- `frontend/src/components/contact/ContactStatsStrip.tsx`
- `frontend/src/components/contact/ContactFormSection.tsx`
- `frontend/src/components/contact/ContactSidebar.tsx`
- `frontend/src/components/contact/ContactVisitSection.tsx`
- `frontend/src/components/contact/ContactCTASection.tsx`
- `frontend/src/components/contact/index.ts`

**Files to modify:**
- `frontend/src/app/(public)/contact/ContactPageClient.tsx`

---

### Phase 2 — Register page (~636) ✅ Done

- Constants for copy; optional shared “auth form field” pattern if Contact introduced one.
- Sections: Hero/header, Form (grouped fields), optional trust strip.
- Target: ~120–180 lines.

### Phase 3 — BookingsCallback page (~409) ✅ Done

- Constants for status messages and button labels.
- Optional: small status/result components.
- Target: ~150–200 lines.

### Phase 4 — BookingDetailPageClient (~515) ✅ Done

- Constants (bookingDetail/constants.ts), section components (BookingDetailStateCard, BookingDetailHeader, BookingDetailMainCard), status from statusBadgeHelpers + BOOKING_STATUS_LABELS/PAYMENT_STATUS_LABELS; slim client.

### ~~Phase 5 — AddChildPageClient~~ Removed

- Add child is done in dashboard via **AddChildModal**. Standalone `/children/add` page removed.

### ~~Phase 6 — ChildChecklistPageClient~~ Removed

- Child checklist is done in dashboard via **CompleteChecklistModal**. Standalone `/children/[id]/checklist` page removed.

### Phase 7 — Login, BookingPayment, Blog

- **Login ✅ Done:** Constants, LoginHeroSection, LoginFormSection, slim client (~140 lines, down from ~276).
- **Blog ✅ Done:** Constants (blogPageConstants.ts), remove debug log, all copy from constants.
- **Booking ✅ Done:** BookingPayment — constants (bookingPayment/constants.ts), BookingPaymentStateCard; slim client; console.error removed.

---

## Implementation order

**Policy: Complete all non-booking pages first, then booking-related pages.**

1. ~~Phase 1: Contact page.~~ Done.
2. ~~Phase 2: Register page.~~ Done.
3. ~~Phase 3: BookingsCallback (booking).~~ Done.
4. ~~Phase 7 (non-booking): Login, Blog.~~ Done.
5. ~~**Last (booking):** Phase 4 — BookingDetail → Phase 7 — BookingPayment.~~ Done.
6. After each phase: run `cd frontend && npm run typecheck` and `npm run check-segments` locally.

---

## Done

- **Home page** — useHomePageData, section components under `components/home/`, `homePageDefaults.ts`, iconMap, testimonialUtils; HomePageClient ~218 lines.

- **Phase 1 — Contact page (implemented):**
  - `frontend/src/components/contact/constants.ts` — CONTACT_HERO, CONTACT_STATS, CONTACT_FORM, CONTACT_SIDEBAR, CONTACT_VISIT, CONTACT_CTA, CONTACT_VALIDATION_FALLBACKS.
  - `frontend/src/components/contact/contactFormTypes.ts` — ContactFormData, ChildInfo, ContactFormSectionProps.
  - Section components: ContactHeroSection, ContactStatsStrip, ContactFormSection, ContactSidebar, ContactVisitSection, ContactCTASection (all under `components/contact/`).
  - ContactPageClient refactored to use sections and types; form state and validation remain in the page; ~310 lines (down from ~1059).

- **Phase 2 — Register page (implemented):**
  - `frontend/src/components/register/constants.ts` — REGISTER_HERO, REGISTER_NOTICE, REGISTER_FORM, REGISTER_VALIDATION_FALLBACKS.
  - `frontend/src/components/register/registerFormTypes.ts` — RegisterFormData, RegisterFormSectionProps.
  - Section components: RegisterHeroSection, RegisterFormSection (under `components/register/`).
  - RegisterPageClient refactored to use sections and types; form state and validation remain in the page; ~230 lines (down from ~636).

- **Phase 3 — BookingsCallback page (implemented):**
  - `frontend/src/components/bookingsCallback/constants.ts` — CALLBACK_LOADING, CALLBACK_SUCCESS, CALLBACK_CANCELED, CALLBACK_ERROR, TOAST_COPY_SUCCESS.
  - `frontend/src/components/bookingsCallback/callbackTypes.ts` — CallbackStatus, CallbackSuccessCardProps, CallbackCanceledCardProps, CallbackErrorCardProps.
  - Status card components: CallbackLoadingCard, CallbackSuccessCard, CallbackCanceledCard, CallbackErrorCard (under `components/bookingsCallback/`).
  - BookingsCallbackPageClient refactored to use constants and status cards; payment confirmation and URL handling remain in the page; ~165 lines (down from ~409).

- **Phase 7 (non-booking) — Login & Blog (implemented):**
  - **Login:** `frontend/src/components/login/constants.ts`, `loginFormTypes.ts`, LoginHeroSection, LoginFormSection; LoginPageClient slim (~140 lines, down from ~276). Removed console.error in catch.
  - **Blog:** `frontend/src/components/blog/blogPageConstants.ts` — BLOG_HERO, BLOG_STATS, BLOG_FEATURED, BLOG_LIST, BLOG_CTA; BlogPageClient uses constants, debug console.log removed.

- **Phase 4 — BookingDetail (implemented):**
  - `frontend/src/components/bookingDetail/constants.ts` — BOOKING_DETAIL_LOADING, ERROR, NOT_FOUND, HEADER, FINANCIAL, SECTIONS, PAYMENT_REFRESH, ACTIONS, BOOKING_STATUS_LABELS, PAYMENT_STATUS_LABELS.
  - `frontend/src/components/bookingDetail/bookingDetailTypes.ts` — BookingDetailHeaderProps, BookingDetailMainCardProps, BookingDetailStateCardProps.
  - Section components: BookingDetailStateCard, BookingDetailHeader, BookingDetailMainCard (under `components/bookingDetail/`).
  - BookingDetailPageClient uses sections, getStatusBadgeClasses/getPaymentStatusBadgeClasses, ROUTES; refresh catch no console.error; ~165 lines (down from ~515).

- **Phase 7 (booking) — BookingPayment (implemented):**
  - `frontend/src/components/bookingPayment/constants.ts` — BOOKING_PAYMENT_LOADING, ERROR, NOT_FOUND, HEADER, SUMMARY, CANCELLED, COMPLETE, FORM, ACTIONS.
  - BookingPaymentStateCard (under `components/bookingPayment/`).
  - BookingPaymentPageClient uses constants, ROUTES, state card; handlePaymentFailed no console.error; ~265 lines (down from ~274, copy centralised).
