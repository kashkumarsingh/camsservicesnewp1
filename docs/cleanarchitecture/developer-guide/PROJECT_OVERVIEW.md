## CAMS Service Monorepo - Project Overview

### Files Modified/Created (In Order)
1. **File:** `docs/cleanarchitecture/developer-guide/PROJECT_OVERVIEW.md`  
 - Layer: Developer Guide / Cross-Cutting Documentation  
 - Order: 1  
 - Purpose: High-level overview of folder structure, API routes, components, tech stack, features, and FAANG-level practices applied to this monorepo.

---

### 1. Current Folder Structure (High-Level)

**Monorepo root**
- **`backend/`**: Laravel 12 LTS API (API-only; universal dashboard on frontend), Sanctum authentication, Stripe integration.
  - **`app/`**: Application code (actions, HTTP controllers, models, policies, etc.).
    - `Actions/Booking/…`: Booking and schedule business logic.
    - `Http/Controllers/Api/…`: API controllers (auth, bookings, trainers, activities, safeguarding, payments, etc.).
    - `Models/…`: Eloquent models (e.g. `BookingSchedule`, `Trainer`, `TimeEntry`, `TrainerEmergencyContact`).
  - **`routes/`**
    - `api.php`: Versioned public + authenticated JSON API (`/api/v1/...`).
  - **`database/`**
    - `migrations/…`: Schema migrations, including time entries and trainer emergency contacts.
  - **`storage/`**
    - `framework/views/…`: Compiled view cache (runtime artefacts).
  - **`composer.json`**: Backend dependencies and scripts (Laravel, Sanctum, Stripe, testing).

- **`frontend/`**: Next.js 16 + React 19 + TypeScript 5 + Tailwind 4 application.
  - **`src/app/`**: Route segments and pages (App Router).
    - `(public)/…`: Marketing site, auth, bookings, policies, blog, FAQ, trainers, packages, etc. (no dashboard routes).
    - `dashboard/…`: Role-based dashboard only—`/dashboard` (role picker), `/dashboard/parent`, `/dashboard/trainer`, `/dashboard/admin` and sub-routes.
    - `layout.tsx`, `error.tsx`, `not-found.tsx`, `loading.tsx`, `global-error.tsx`: Root layout and error boundaries.
  - **`src/components/`**: Reusable and feature-specific components.
    - `booking/…`: Booking flows, calendars, pickers, payment forms, session builder.
    - `dashboard/…`: Parent dashboard sidebars, cards, modals.
    - `trainer/…`: Trainer dashboard sidebars, schedules, bookings, profile management, activity logs.
    - `ui/…`: Design system primitives (buttons, modals, skeletons, calendars, stats, toasts, layout helpers).
    - `features/…`: Higher-level UX features (packages, navigation, CTA bars).
    - `layout/…`: Header, footer, auth buttons.
    - `theme/…`: Theme context, script, toggle.
    - `trainerApplications/…`: Trainer application form.
  - **`src/interfaces/web/components/`**: CMS-facing display components for pages, blog, services, packages, FAQ, activities, trainers, policies and booking summaries (thin adapter layer over domain/use-cases).
  - **`src/core/`**: Application/domain types and use-cases (e.g. trainer types and dashboard logic).
  - **`src/infrastructure/http/`**: HTTP `ApiClient`, typed repositories, API endpoint constants.
  - **`src/utils/`**: Shared helpers (e.g. live update constants).
  - **`package.json`**: Frontend dependencies (Next.js, React, Stripe, Tailwind, animation libs, markdown, calendar, etc.).

- **`docs/`**
  - **`cleanarchitecture/`**: Core architecture documentation.
    - `api/API_ROUTES.md`: Detailed listing of backend API routes.
    - `backend/LARAVEL12_NEXT_ADMIN_MIGRATION_PLAN.md`: Backend migration strategy.
    - `frontend/TRAINER_MOBILE_TABLET_UI_IMPLEMENTATION.md`: Trainer mobile/tablet UI details.
    - `features/*.md`: Feature specifications (trainer dashboard, safeguarding concerns, session activities, live updates).
    - `CONVERSATION_SUMMARY_FOR_MIGRATION_PHASE2.md`: High-level migration history.
  - **`cursorcontext/`**: Cursor AI guidance (UX principles, database design, skeleton loading, API best practices, etc.).

- **Root files**
  - `docker-compose.yml`: Local container orchestration.
  - `.cursorrules`: Monorepo-wide engineering and AI collaboration standards.

---

### 2. API Routes (From `backend/routes/api.php`)

> **Base prefix:** All endpoints below are served under `/api/v1/...` (Laravel `api.php` group + `Route::prefix('v1')`).  
> **Auth & guards:** `auth:sanctum` for authenticated parents/trainers; `admin` and `trainer` middlewares for role-restricted routes; `require.approval` for approved parents/children; `api.cache` for public read caching.

#### 2.1 Health Check
- **GET** `/api/v1/health`  
  - Returns service health, environment, DB/cache status, request ID.

#### 2.2 Authentication
- **POST** `/api/v1/auth/register` – Register a new user.
- **POST** `/api/v1/auth/login` – Login and obtain Sanctum token (cookie-based for SPA).

**Authenticated (`auth:sanctum`)**
- **GET** `/api/v1/auth/user` – Get current authenticated user.
- **POST** `/api/v1/auth/logout` – Logout current user.

#### 2.3 Parent Profile & Children (Authenticated)
- **GET** `/api/v1/user/profile` – View parent profile.
- **PUT** `/api/v1/user/profile` – Update parent profile.

- **POST** `/api/v1/children/{id}/archive` – Soft-archive a child.
- **REST** `/api/v1/children` – `index`, `show`, `store`, `update`, `destroy`.

#### 2.4 Checklists (Parent + Child)
- **GET** `/api/v1/children/{childId}/checklist`
- **POST** `/api/v1/children/{childId}/checklist`
- **PUT** `/api/v1/children/{childId}/checklist`

- **GET** `/api/v1/user/checklist`
- **POST** `/api/v1/user/checklist`
- **PUT** `/api/v1/user/checklist`

#### 2.5 Parent Dashboard (Stats, Notes, Safeguarding)
- **GET** `/api/v1/dashboard/stats` – Parent dashboard stats (bookings, sessions, etc.).
- **GET** `/api/v1/dashboard/session-notes` – Trainer notes for completed sessions.
- **POST** `/api/v1/dashboard/safeguarding-concerns` – Submit safeguarding concern as parent.

#### 2.6 Admin Approvals (`auth:sanctum` + `admin`)
- **POST** `/api/v1/approvals/users/{userId}/approve`
- **POST** `/api/v1/approvals/users/{userId}/reject`
- **POST** `/api/v1/approvals/children/{childId}/approve`
- **POST** `/api/v1/approvals/children/{childId}/reject`

#### 2.7 Trainer API (`auth:sanctum` + `trainer`, prefix `/api/v1/trainer`)

**Bookings**
- **GET** `/api/v1/trainer/bookings`
- **GET** `/api/v1/trainer/bookings/stats`
- **GET** `/api/v1/trainer/bookings/{id}`
- **POST** `/api/v1/trainer/bookings/{bookingId}/schedules`
- **PUT** `/api/v1/trainer/bookings/{bookingId}/schedules/{scheduleId}/status`

**Schedules (Phase 2)**
- **GET** `/api/v1/trainer/schedules`
- **PUT** `/api/v1/trainer/schedules/{scheduleId}/attendance`
- **GET** `/api/v1/trainer/schedules/{scheduleId}/notes`
- **POST** `/api/v1/trainer/schedules/{scheduleId}/notes`

**Activity Assignment**
- **GET** `/api/v1/trainer/schedules/{scheduleId}/activities`
- **POST** `/api/v1/trainer/schedules/{scheduleId}/activities`
- **POST** `/api/v1/trainer/schedules/{scheduleId}/activities/confirm`
- **PUT** `/api/v1/trainer/schedules/{scheduleId}/activities/override`
- **DELETE** `/api/v1/trainer/schedules/{scheduleId}/activities/override`
- **DELETE** `/api/v1/trainer/schedules/{scheduleId}/activities/{activityId}`

**Activity Logging (Phase 3)**
- **GET** `/api/v1/trainer/activity-logs`
- **GET** `/api/v1/trainer/activity-logs/children/{childId}`
- **GET** `/api/v1/trainer/activity-logs/{id}`
- **POST** `/api/v1/trainer/activity-logs`
- **PUT** `/api/v1/trainer/activity-logs/{id}`
- **POST** `/api/v1/trainer/activity-logs/{id}/photos`

**Trainer Profile (Phase 5)**
- **GET** `/api/v1/trainer/profile`
- **PUT** `/api/v1/trainer/profile`
- **POST** `/api/v1/trainer/profile/image`
- **POST** `/api/v1/trainer/profile/qualifications`
- **DELETE** `/api/v1/trainer/profile/qualifications/{certificationId}`
- **PUT** `/api/v1/trainer/profile/availability`

**Trainer Emergency Contacts**
- **GET** `/api/v1/trainer/profile/emergency-contacts`
- **POST** `/api/v1/trainer/profile/emergency-contacts`
- **PUT** `/api/v1/trainer/profile/emergency-contacts/{id}`
- **DELETE** `/api/v1/trainer/profile/emergency-contacts/{id}`

**Trainer Time Tracking**
- **GET** `/api/v1/trainer/time-entries`
- **POST** `/api/v1/trainer/schedules/{scheduleId}/clock-in`
- **POST** `/api/v1/trainer/schedules/{scheduleId}/clock-out`

**Trainer Safeguarding**
- **GET** `/api/v1/trainer/safeguarding-concerns`
- **PATCH** `/api/v1/trainer/safeguarding-concerns/{id}`

#### 2.8 Public Read API (with HTTP Caching)

> These are wrapped in `Route::prefix('v1')->middleware(['api.cache:300'])` with some detail routes using `api.cache:600`.

**Pages**
- **GET** `/api/v1/pages`
- **GET** `/api/v1/pages/{slug}` (600s cache)

**Packages**
- **GET** `/api/v1/packages`
- **GET** `/api/v1/packages/{slug}` (600s cache)

**Blog**
- **GET** `/api/v1/blog/posts`
- **GET** `/api/v1/blog/posts/{slug}` (600s cache)

**Trainers**
- **GET** `/api/v1/trainers`
- **GET** `/api/v1/trainers/{slug}` (600s cache)

**Activities**
- **GET** `/api/v1/activities`
- **GET** `/api/v1/activities/{slug}` (600s cache)

**Services**
- **GET** `/api/v1/services`
- **GET** `/api/v1/services/{slug}` (600s cache)

**FAQs**
- **GET** `/api/v1/faqs`
- **GET** `/api/v1/faqs/{slug}` (600s cache)

**Site Settings**
- **GET** `/api/v1/site-settings` (600s cache)

**Testimonials & Reviews**
- **GET** `/api/v1/testimonials`
- **GET** `/api/v1/testimonials/{identifier}` (600s cache)
- **GET** `/api/v1/reviews/aggregate`

#### 2.9 Public Write API (No Caching)

**Contact & Newsletter**
- **POST** `/api/v1/contact/submissions` (rate limited: `throttle:contact-submissions`).
- **POST** `/api/v1/newsletter/subscribe`
- **POST** `/api/v1/newsletter/unsubscribe`

**Trainer Applications**
- **POST** `/api/v1/trainer-applications`

**Bookings & Booking Schedules** (protected: `auth:sanctum` + `require.approval`)
- **GET** `/api/v1/bookings`
- **GET** `/api/v1/bookings/reference/{reference}`
- **GET** `/api/v1/bookings/{id}`
- **POST** `/api/v1/bookings`
- **POST** `/api/v1/bookings/create-after-payment`
- **PUT** `/api/v1/bookings/{id}`
- **POST** `/api/v1/bookings/{id}/cancel`
- **GET** `/api/v1/children/{childId}/booked-dates`
- **GET** `/api/v1/children/{childId}/active-bookings`

**Booking Schedules (Parent Session Booking)**
- **POST** `/api/v1/bookings/{bookingId}/schedules`
- **PUT** `/api/v1/bookings/schedules/{id}`
- **DELETE** `/api/v1/bookings/schedules/{id}`
- **POST** `/api/v1/bookings/schedules/{id}/cancel`

**Payments (Stripe)**
- **POST** `/api/v1/bookings/{bookingId}/payments/create-intent`
- **POST** `/api/v1/bookings/{bookingId}/payments/refresh`
- **POST** `/api/v1/payments/get-intent-from-session`
- **POST** `/api/v1/payments/confirm`

**Stripe Webhooks**
- **POST** `/api/v1/webhooks/stripe` (rate limited: `throttle:60,1`).

> **Note:** There is also a richer API breakdown in `docs/cleanarchitecture/api/API_ROUTES.md`; this overview keeps all routes in one place for quick reference.

---

### 3. Frontend Component Lists (Key Examples)

> The lists below highlight the main component groups. The actual codebase contains more components than listed here; this is a curated, human-readable overview.

#### 3.1 Core UI / Design System (`src/components/ui`)
- **Buttons & Layout**
  - `Button/Button.tsx`
  - `Adaptive/AdaptiveContainer.tsx`
  - `SideCanvas.tsx`
- **Modals**
  - `Modal/BaseModal.tsx`
- **Feedback & Status**
  - `Toast/Toast.tsx`
  - `Toast/ToastContainer.tsx`
  - `StatCard/StatCard.tsx`
- **Calendar Components**
  - `Calendar/BaseMonthCalendar.tsx`
  - `Calendar/HorizontalCalendar.tsx`
  - `Calendar/BookingCalendar.tsx`
- **Skeletons**
  - `Skeleton/DashboardSkeleton.tsx`
  - `Skeleton/CalendarSkeleton.tsx`
  - `Skeleton/ChildrenListSkeleton.tsx`
  - `Skeleton/DashboardSidebarSkeleton.tsx`
  - `Skeleton/DashboardLeftSidebarSkeleton.tsx`
  - `Skeleton/StatCardSkeleton.tsx`

#### 3.2 Layout & Theming
- **Layout (`src/components/layout`)**
  - `Header.tsx`
  - `FooterClient.tsx`
  - `AuthButtons.tsx`
- **Theme (`src/components/theme`)**
  - `ThemeContext.tsx`
  - `ThemeScript.tsx`
  - `ThemeToggle.tsx`

#### 3.3 Booking UX (`src/components/booking`)
- **High-Level Flows**
  - `BookingPageClient.tsx`
  - `SessionBuilder.tsx`
  - `sessionBuilder/CalendarBookingFlow.tsx`
  - `sessionBuilder/ActivitiesSection.tsx`
  - `sessionBuilder/ReviewCTA.tsx`
- **Calendars & Pickers**
  - `calendars/MonthCalendar.tsx`
  - `pickers/EnhancedTimeSlotSelector.tsx`
  - `pickers/TimePicker.tsx`
  - `pickers/ActivityPicker.tsx`
- **Forms & Editors**
  - `forms/ParentChildDetailsForm.tsx`
  - `editors/CustomActivityEditor.tsx`
- **Payment**
  - `payment/StripePaymentForm.tsx`
  - `payment/PaymentForm.tsx`
- **Modals**
  - `modals/SessionDetailModal.tsx` (parent context)
  - `modals/TrainerInfoModal.tsx`

#### 3.4 Parent Dashboard (`src/components/dashboard`)
- **Core Layout**
  - `DashboardLeftSidebar.tsx`
  - `DashboardRightSidebar.tsx`
  - `ChildrenActivitiesCalendar.tsx`
  - `SessionNotesCard.tsx`
  - `SafeguardingCard.tsx`
- **Modals**
  - `modals/AddChildModal.tsx`
  - `modals/BookedSessionsModal.tsx`
  - `modals/SessionDetailModal.tsx`
  - `modals/TopUpModal.tsx`
  - `modals/BuyHoursModal.tsx`
  - `modals/ParentBookingModal.tsx`
  - `modals/CompleteChecklistModal.tsx`
  - `modals/CompletePaymentModal.tsx`
  - `modals/SafeguardingConcernModal.tsx`
  - `modals/SessionNotesModal.tsx`
  - `modals/ParentSettingsModal.tsx`
  - `modals/MiniPackageCard.tsx`
  - `modals/PackageDetailsTooltip.tsx`

#### 3.5 Trainer Dashboard (`src/components/trainer`)
- **Desktop Trainer Dashboard**
  - `TrainerDashboardLeftSidebar.tsx`
  - `TrainerDashboardRightSidebar.tsx`
  - `TrainerTopNavigation.tsx`
- **Schedules & Bookings**
  - `schedules/ScheduleCalendar.tsx`
  - `schedules/ScheduleList.tsx`
  - `schedules/AttendanceModal.tsx`
  - `bookings/BookingsList.tsx`
  - `bookings/BookingDetail.tsx`
  - `bookings/ParticipantCard.tsx`
- **Activities & Logs**
  - `activities/ActivityLogList.tsx`
  - `activities/ActivityLogForm.tsx`
  - `activities/ActivityOverrideModal.tsx`
- **Profile**
  - `profile/ProfileEditForm.tsx`
  - `profile/AvailabilityCalendar.tsx`
  - `profile/QualificationsManager.tsx`
- **Modals**
  - `modals/TrainerSessionDetailModal.tsx`
  - `modals/BookingDetailModal.tsx`
  - `modals/TrainerCreateSessionNoteModal.tsx`
  - `modals/TrainerViewConcernsModal.tsx`
  - `modals/TrainerSettingsModal.tsx`
- **Mobile Trainer Shell (`src/components/trainer/mobile`)**
  - `TrainerMobileHeader.tsx`
  - `TrainerBottomNav.tsx`
  - `TrainerSectionLabel.tsx`

#### 3.6 Marketing & Feature Components
- **Features (`src/components/features`)**
  - `packages/PackageCheckout.tsx`
  - `packages/PackageBookingFlow.tsx`
  - `common/BookNowStickyFooter.tsx`
- **Shared Sections**
  - `shared/CTASection/CTASection.tsx`
- **Trainer Applications**
  - `trainerApplications/TrainerApplicationForm.tsx`

#### 3.7 CMS-Facing Web Components (`src/interfaces/web/components`)
- **Blog**
  - `blog/BlogList.tsx`
  - `blog/BlogPostCard.tsx`
  - `blog/BlogPostDetail.tsx`
- **Packages**
  - `packages/PackageList.tsx`
  - `packages/PackageCard.tsx`
  - `packages/PackageDetail.tsx`
- **Services**
  - `services/ServiceList.tsx`
  - `services/ServiceCard.tsx`
  - `services/ServiceDetail.tsx`
- **Trainers**
  - `trainers/TrainerList.tsx`
  - `trainers/TrainerCard.tsx`
  - `trainers/TrainerProfile.tsx`
- **Activities**
  - `activities/ActivityList.tsx`
  - `activities/ActivityCard.tsx`
  - `activities/ActivityDetail.tsx`
- **FAQ**
  - `faq/FAQList.tsx`
  - `faq/FAQItem.tsx`
  - `faq/FAQItemCard.tsx`
- **Policies & Booking**
  - `policies/PolicyDisplay.tsx`
  - `booking/BookingCard.tsx`
  - `booking/BookingList.tsx`
  - `booking/BookingDetail.tsx`

---

### 4. Tech Stack Overview

#### 4.1 Frontend
- **Framework**: Next.js **16.x** (App Router, `next dev --turbopack`).
- **UI Library**: React **19.x** with React DOM 19.
- **Language**: TypeScript **5.9+** (strict type checking via `tsc --noEmit`).
- **Styling**: Tailwind CSS **4.x** (via `@tailwindcss/postcss`).
- **State & UX Utilities**:
  - `framer-motion`, `gsap` for animations.
  - `react-big-calendar` for calendar UI.
  - `react-datepicker` for date picking.
  - `canvas-confetti` for celebratory effects.
  - `lucide-react`, `react-icons` for icons.
  - `react-markdown` + `isomorphic-dompurify` for safe CMS content rendering.
- **Payments**: `@stripe/react-stripe-js`, `@stripe/stripe-js`.
- **Tooling**:
  - ESLint 9 + `eslint-config-next` 16.
  - TypeScript 5.9.
  - Tailwind 4 PostCSS integration.

#### 4.2 Backend
- **Framework**: Laravel **11.x** (LTS policy from `.cursorrules`, actual composer uses `^11.0`).
- **Language**: PHP **8.2+**.
- **Auth**: Laravel **Sanctum** (SPA cookie-based auth).
- **CMS/Admin**: **Next.js admin dashboard** at `/dashboard/admin`; backend is API-only.
- **Permissions**: `spatie/laravel-permission`.
- **Payments**: `stripe/stripe-php`.
- **Testing & Quality**:
  - Pest + Pest Laravel plugin.
  - PHPUnit.
  - Laravel Pint (`lint` script) for PSR-12 formatting.

#### 4.3 Infrastructure
- **Containerisation**: `docker-compose.yml` for backend + supporting services.
- **Database**: MySQL/PostgreSQL (LTS) as per monorepo database guidelines.
- **CI/CD**: GitHub Actions (policy-level) + Vercel/backend hosting as per `.cursorrules` standards.

---

### 5. Feature Overview (High-Level)

#### 5.1 Public Marketing Site
- CMS-managed pages: home, about, services, packages, policies (T&Cs, safeguarding, cookies, privacy, refunds, cancellation).
- Public directory structure under `src/app/(public)/`:
  - Static + dynamic pages for blog, FAQ, trainers, activities, services, packages.
  - SEO-friendly slug routes for posts, services, packages, activities, policies, FAQs.
- Contact form with thank-you flow and rate-limited API.
- Newsletter subscription and unsubscription.
- Trainer application form and workflow entry point.

#### 5.2 Parent Experience
- Registration/login via `src/app/(public)/register` and `login`.
- **Parent dashboard** (`/dashboard`) with:
  - Children management (add child, checklist, approvals).
  - Calendar-first booking UX (Google Calendar-style) for sessions.
  - Booking summary, active bookings and date availability per child.
  - Payment flows (Stripe checkout, payment confirmation, top-up).
  - Session notes feed and safeguarding concern submission.
  - Settings and profile management.

#### 5.3 Trainer Experience
- **Trainer dashboard** (`/trainer/dashboard`) with desktop + mobile shells.
- **Bookings module**:
  - List of assigned bookings, stats, and booking details.
  - Trainer-led session booking per booking ID.
- **Schedules module**:
  - Schedules list + calendar view.
  - Attendance marking.
  - Session notes creation and viewing.
- **Activity management**:
  - Assigning activities to sessions.
  - Counting and overriding activity counts.
  - Confirming assignments.
  - Logging activities (with photos) and viewing history per child.
- **Safeguarding**:
  - Viewing and updating safeguarding concerns for children they work with.
- **Profile**:
  - Editing bio and personal information.
  - Managing availability.
  - Uploading and deleting qualifications.
  - Managing emergency contacts.
  - Time tracking (time entries + clock in/out linked to schedules).

#### 5.4 Booking & Payments
- Parent-first booking flow:
  - Create bookings.
  - Option for "Pay First → Book Later".
  - Manage booking schedules (create, update, cancel).
  - View booked dates and active bookings per child.
- Stripe payments:
  - Payment intents, status refresh, confirmation.
  - Intent retrieval from session.
  - Webhook handling with rate limiting.

#### 5.5 CMS-Driven Content & Live Updates
- Backend provides:
  - Pages, packages, services, trainers, activities, FAQs, testimonials, site settings.
- Frontend uses repository pattern with `API_ENDPOINTS` constants and strongly typed DTOs.
- HTTP caching at API level (ETag + `Cache-Control`) plus frontend-level ISR and cache tags (per `.cursorrules`).
- Live update patterns for dashboards (see `LIVE_UPDATES_DASHBOARDS.md` and `liveUpdateConstants.ts`).

---

### 6. FAANG-Level Practices Applied

The following FAANG-level engineering practices from `.cursorrules` are actively applied in this repository and reflected in the structures above:

- **Clean Architecture & DDD**
  - Clear separation of concerns: presentation (`app/`, `components/`), interfaces (`interfaces/web`), application/domain (`core`), and infrastructure (`infrastructure/http`).
  - Repositories and use-cases mediate between UI and remote backend API (no direct `fetch` in leaf UI components).

- **Strict Type Safety & Quality Gates**
  - Frontend: TypeScript strict mode, `tsc --noEmit` for linting/typecheck.
  - Backend: Type-hinted PHP 8.2+, PSR-12 formatting enforced via Pint.
  - No `any`/`@ts-ignore` patterns encouraged; optional fields handled defensively (e.g. parent/guardian booking rules).

- **LTS/Stable Stack Choices**
  - Next.js 16, React 19, TypeScript 5.9, Tailwind 4.
  - Laravel 12, PHP 8.4, Sanctum 4; admin UI is Next.js.
  - Modern ecosystem around testing (Pest, PHPUnit) and code quality (Pint, ESLint 9).

- **Performance & Scalability**
  - API-level HTTP caching (ETag + `api.cache` middleware) for public reads.
  - Clear split between read-heavy (cached) and write-sensitive (non-cached) endpoints.
  - Calendar-oriented dashboards built with virtualised calendar components and skeleton loading patterns.

- **Security & Compliance**
  - Sanctum cookie-based authentication; `admin` and `trainer` middleware for role-based access.
  - `require.approval` middleware ensures only approved parents/children can book.
  - Rate limiting on sensitive endpoints (contact form, Stripe webhooks).
  - Safe HTML rendering on frontend via `isomorphic-dompurify`.

- **UX Standards (Zero-Confusion Policy)**
  - Parent booking UX modelled on Google Calendar (calendar-first, dashboard-focused).
  - Clear, modal-based flows for both parents and trainers.
  - Skeleton loading components centralised under `ui/Skeleton`.
  - Consistent CTAs and clear visual hierarchy (headers, CTABars, sticky book-now footers).

- **Monorepo & Documentation Discipline**
  - Central `.cursorrules` governing engineering standards.
  - Feature-level specifications and implementation notes under `docs/cleanarchitecture/features/`.
  - API documentation under `docs/cleanarchitecture/api/API_ROUTES.md` plus this consolidated overview file.

---

### 7. How to Use This Document

- **New engineers**: Start here to understand the directory layout, major features, and APIs before diving into individual specs in `docs/cleanarchitecture/features/`.
- **API consumers**: Use Section 2 for a quick view of all available `/api/v1` routes, then refer to `API_ROUTES.md` for field-level details.
- **Frontend/UX**: Use Sections 3 and 5 to locate relevant components for a given feature (parent vs trainer vs marketing).
- **Architecture reviews**: Use Section 6 to validate that FAANG-level practices and clean architecture principles are being upheld.

