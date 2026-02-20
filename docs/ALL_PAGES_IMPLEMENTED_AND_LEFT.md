# All Pages — Implemented vs Left

Single reference for every app page: what's been refactored (constants, sections, hooks) and what's still to do.  
**Scope:** Public refactor = constants + section components + slim client + no hardcoded strings. Dashboard = same standards where applied; no formal "refactor phases" for dashboard.

---

## Public pages (marketing, auth, booking, content)

| Route | Page client / entry | Implemented | Left |
|-------|---------------------|-------------|------|
| `/` | HomePageClient | ✅ Constants (homePageDefaults, home/constants); useHomePageData + useHomePageState; section components (Hero, HowItWorks, Services, Packages, ImpactStats, Testimonials, Blog); ICON_COMPONENT_MAP in utils/iconMap; mapFallbackTestimonials in testimonialUtils; DEFAULT_IMPACT_STATS + getEffectiveImpactStats; rounded-card; server-props fallback comment; ~38 lines | Run typecheck + check-segments locally |
| `/contact` | ContactPageClient | ✅ Constants (contact/constants.ts); section components (Hero, StatsStrip, Form, Sidebar, Visit, CTA); types (contactFormTypes); ~310 lines | — |
| `/contact/thank-you` | page.tsx (likely minimal) | — | Not in refactor plan; add constants/sections if it grows |
| `/register` | RegisterPageClient | ✅ Constants (register/constants); RegisterHeroSection, RegisterFormSection; types; ~230 lines | — |
| `/login` | LoginPageClient | ✅ Constants (login/constants); LoginHeroSection, LoginFormSection; types; ~140 lines | — |
| `/blog` | BlogPageClient | ✅ Constants (blog/blogPageConstants); copy from constants; debug log removed | — |
| `/blog/[slug]` | page.tsx (server + client components) | — | No *PageClient refactor plan; follow CMS rules (buildPublicMetadata, revalidate, tags) |
| `/bookings` | page.tsx | — | No refactor plan (listing/entry) |
| `/bookings/[reference]` | BookingDetailPageClient | ✅ Constants (bookingDetail/); BookingDetailStateCard, Header, MainCard; statusBadgeHelpers + ROUTES; ~165 lines | — |
| `/bookings/[reference]/payment` | BookingPaymentPageClient | ✅ Constants (bookingPayment/); BookingPaymentStateCard; ROUTES; no console.error; ~265 lines | — |
| Bookings callback | BookingsCallbackPageClient | ✅ Constants (bookingsCallback/); status cards (Loading, Success, Canceled, Error); ~165 lines | — |
| `/about` | page.tsx | — | No *PageClient; CMS/content rules apply; rounded-[30px] still in about sections (hex-cleanup rule) |
| `/services` | page.tsx | — | No refactor plan; use shared components + constants if added |
| `/services/[slug]` | page.tsx | — | Same |
| `/packages` | page.tsx | — | Same |
| `/packages/[slug]` | page.tsx | — | Same |
| `/trainers` | page.tsx | — | Same; rounded-[30px] present |
| `/trainers/[slug]` | page.tsx | — | Same |
| `/faq` | page.tsx | — | Same |
| `/faq/[slug]` | page.tsx | — | Same |
| `/policies` | page.tsx | — | Same |
| `/policies/[slug]` | page.tsx | — | Same |
| `/account` | page.tsx | — | rounded-[30px] still present |
| `/become-a-trainer` | page.tsx | — | No refactor plan |
| `/checkout` | page.tsx | — | No refactor plan |
| `/book/retrieve` | page.tsx | — | No refactor plan |
| `/book/[slug]` | page.tsx | — | No refactor plan |
| `/thank-you/[slug]` | page.tsx | — | No refactor plan |

---

## Dashboard — Parent

| Route | Page client | Implemented | Left |
|-------|-------------|-------------|------|
| `/dashboard/parent` | ParentDashboardPageClient, ParentOverviewPageClient | Uses shared dashboard layout, DataTable, modals | No "public-style" refactor; dashboard standards (DASHBOARD_RULES.md) apply |
| `/dashboard/parent/bookings` | ParentBookingsPageClient | — | Same |
| `/dashboard/parent/children` | ParentChildrenPageClient | — | Same |
| `/dashboard/parent/progress` | ParentProgressPageClient | — | Same |
| `/dashboard/parent/schedule` | page.tsx | — | Same |
| `/dashboard/parent/settings` | page.tsx | — | Same |

---

## Dashboard — Trainer

| Route | Page client | Implemented | Left |
|-------|-------------|-------------|------|
| `/dashboard/trainer` | TrainerDashboardPageClient | — | Dashboard standards |
| `/dashboard/trainer/bookings` | BookingsListPageClient | — | Same |
| `/dashboard/trainer/bookings/[id]` | BookingDetailPageClient (trainer) | — | Same |
| `/dashboard/trainer/schedule` | page.tsx | — | Same |
| `/dashboard/trainer/schedule/shift/[id]` | ShiftDetailPageClient | — | Same |
| `/dashboard/trainer/schedules` | SchedulesPageClient | — | Same |
| `/dashboard/trainer/availability` | page.tsx | — | Same |
| `/dashboard/trainer/clients` | page.tsx | — | Same |
| `/dashboard/trainer/timesheets` | page.tsx | — | Same |
| `/dashboard/trainer/sessions` | page.tsx | — | Same |
| `/dashboard/trainer/progress` | page.tsx | — | Same |
| `/dashboard/trainer/settings` | SettingsPageClient | — | Same |

---

## Dashboard — Admin

| Route | Page client | Implemented | Left |
|-------|-------------|-------------|------|
| `/dashboard/admin` | AdminDashboardOverviewPageClient | — | Dashboard standards |
| `/dashboard/admin/bookings` | AdminBookingsPageClient | — | Same |
| `/dashboard/admin/trainers` | AdminTrainersPageClient | — | Same |
| `/dashboard/admin/trainer-applications` | AdminTrainerApplicationsPageClient | — | Same |
| `/dashboard/admin/trainer-applications/[id]` | AdminTrainerApplicationDetailPageClient | — | Same |
| `/dashboard/admin/parents` | AdminParentsPageClient | — | Same |
| `/dashboard/admin/children` | AdminChildrenPageClient | — | Same |
| `/dashboard/admin/packages` | AdminPackagesPageClient | — | Same |
| `/dashboard/admin/services` | AdminServicesPageClient | — | Same |
| `/dashboard/admin/activities` | AdminActivitiesPageClient | — | Same |
| `/dashboard/admin/users` | AdminUsersPageClient | — | Same |
| `/dashboard/admin/public-pages` | AdminPublicPagesPageClient | — | Same |
| `/dashboard/admin/absence-requests` | AdminAbsenceRequestsPageClient | — | Same |
| `/dashboard/admin/settings` | page.tsx | — | Same |
| `/dashboard/admin/reports` | page.tsx | — | Same |

---

## Dashboard — Editor

| Route | Page client | Implemented | Left |
|-------|-------------|-------------|------|
| `/dashboard` | page.tsx (role picker) | — | — |
| `/dashboard/editor` | EditorDashboardPageClient | — | Dashboard standards |
| `/dashboard/editor/public-pages` | page.tsx | — | Same |

---

## Summary

- **Public refactor plan (phases 1–7 + Home):** All planned public page clients are **implemented** (Home, Contact, Register, Login, Blog, BookingsCallback, BookingDetail, BookingPayment). Nothing left in that plan.
- **Other public routes** (about, services, packages, trainers, faq, policies, account, checkout, book, thank-you): No *PageClient refactor plan; apply CMS/design rules when touching them (constants, rounded-card, no hex).
- **Dashboard:** No formal "refactor phases"; all dashboard pages follow DASHBOARD_RULES.md. Implemented = current behaviour; left = any future cleanup (e.g. shared hooks, constants) as needed.
- **Global "left" for whole app:** Run `npm run typecheck` and `npm run check-segments`; replace remaining `rounded-[30px]` / `rounded-[20px]` with `rounded-card` where appropriate (see hex-cleanup / nextjs-segment rules).
