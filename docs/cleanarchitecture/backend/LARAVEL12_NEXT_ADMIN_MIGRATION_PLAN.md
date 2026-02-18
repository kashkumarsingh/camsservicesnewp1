## Laravel 12.x Upgrade & Next.js Admin Dashboard Migration Plan

### 1. Context & Objectives

- **Current state**
  - Frontend: Next.js (LTS) + TypeScript, following Clean Architecture.
  - Backend: Laravel (pre‑12.x) with Filament as the primary admin/CMS interface.
- **Target state**
  - Backend upgraded to **Laravel 12.x LTS** (latest stable).
  - **Filament removed as the primary admin UI** and replaced with a **Next.js admin dashboard** that consumes backend APIs.
  - Clean Architecture and DDD preserved and strengthened across frontend and backend.

### 2. High‑Level Strategy

1. **Stabilise API contracts** used by existing frontends (public site + trainer dashboard).
2. **Introduce versioned APIs** for admin responsibilities (e.g. `/api/admin/v1/...`) without breaking existing consumers.
3. **Upgrade the Laravel codebase to 12.x** in a controlled branch, keeping feature parity and automated tests where available.
4. **Abstract Filament‑specific logic** into application/domain services and repositories so that:
   - Business logic lives in services/use‑cases.
   - UI (Filament vs Next.js admin) becomes a replaceable layer.
5. **Build a new Next.js admin dashboard** (separate app or app segment) that:
   - Authenticates via Laravel Sanctum / token‑based API.
   - Uses repository adapters pointing at the new `/api/admin/v1` endpoints.
6. **Retire Filament gradually**, feature by feature, once the Next.js admin reaches parity.

### 3. Phased Plan (Backend‑First)

#### Phase 1 – Discovery & Baseline (1–2 days)

- **Inventory**
  - List all Filament panels, resources, pages, widgets and actions currently in use.
  - Classify them into domains: bookings, trainers, parents, sessions, finance, configuration, content.
- **Stability**
  - Confirm current Laravel version and key packages.
  - Capture current `.env`, queue, cache and storage configuration.
- **Outcome**
  - Clear list of admin features to be replicated in the Next.js admin.

#### Phase 2 – Laravel 12.x Upgrade (3–5 days)

- **Upgrade path**
  - Create a **feature branch** for the Laravel 12 upgrade.
  - Follow official Laravel upgrade guides step‑by‑step (framework, HTTP kernel, console kernel, config changes).
  - Upgrade Composer dependencies to Laravel 12‑compatible versions.
- **Refactoring**
  - Move business logic out of Filament classes (e.g. form actions, table actions) into:
    - **Application services / Actions** (e.g. `App\Application\Bookings\ApproveBooking`).
    - **Domain services / Entities** for core rules.
  - Ensure all Filament resources call these services instead of embedding logic directly.
- **Testing**
  - Smoke tests for all existing features (API + Filament).
  - Fix deprecations and breaking changes.
- **Outcome**
  - Laravel 12.x backend running with Filament still in place but business logic centralised.

#### Phase 3 – API Design for Admin Responsibilities (2–4 days)

- **API architecture**
  - Introduce `api.php` routes for admin under `/api/admin/v1`.
  - Use Laravel Sanctum or token‑based authentication for admin clients.
- **Resource mapping**
  - For each Filament resource, define API endpoints for:
    - Listing, filtering and pagination.
    - Show details.
    - Create / update / delete.
    - Domain‑specific actions (approve, cancel, mark paid, etc.).
- **Implementation**
  - Controllers → call Application use‑cases only (no domain logic in controllers).
  - Use transformers / DTOs to shape API responses for the Next.js admin.
- **Outcome**
  - Stable, documented admin API that is independent of Filament.

#### Phase 4 – Next.js Admin Dashboard (5–10 days)

- **Architecture**
  - Create a dedicated **Next.js admin app/segment** (e.g. `frontend/src/app/(admin)/...`).
  - Follow the same Clean Architecture structure:
    - `core/` for domain and application use‑cases.
    - `infrastructure/http` for the admin API client and endpoints.
    - `components/admin` for UI.
- **Authentication & authorisation**
  - Implement login via the Laravel backend (Sanctum / JWT / session).
  - Implement role‑/permission‑aware UI (e.g. admin, supervisor, finance).
- **Feature migration**
  - Implement a **single admin dashboard page** (e.g. `/admin`) with:
    - A **context switcher dropdown** for `Trainers`, `Parents`, `Editors`.
    - A dashboard content area that changes widgets/tables based on the selected context (without changing the logged‑in user).
  - Prioritise core admin slices behind that context switcher:
    1. **Trainers context** – trainer KPIs, qualifications/compliance alerts, schedule/session oversight.
    2. **Parents context** – parent KPIs, active accounts, outstanding payments, bookings overview.
    3. **Editors context** – blog/content items, drafts, scheduled posts, pending approvals.
    4. Finance / payments dashboards (if Filament currently covers this).
  - Implement table views, filters, forms and modals that mirror or improve upon Filament UX.
- **Outcome**
  - Functional Next.js admin that:
    - Gives `super_admin` a **single dashboard** with a dropdown to switch between **trainers / parents / editors**.
    - Covers the majority of day‑to‑day admin flows via the admin API.

### 4a. Authenticated Dashboards for Parents & Trainers

- **Separate authenticated experiences**
  - **Parent dashboard**:
    - Dedicated route group (e.g. `/parent/dashboard`) using an authenticated **app layout** (no marketing navigation).
    - Focused on parent jobs: managing children, bookings, payments, and communication.
  - **Trainer dashboard**:
    - Dedicated route group (e.g. `/trainer/dashboard`) using a trainer‑specific app layout.
    - Uses the existing trainer dashboard specification (schedule, sessions, time tracking, qualifications, etc.).
- **Post‑login behaviour**
  - After **parent login**, redirect to the parent dashboard route; do not show public marketing pages.
  - After **trainer login**, redirect to the trainer dashboard route; do not show public marketing pages.
  - If an authenticated parent/trainer visits the public home page, redirect them back to their dashboard.
- **Layout separation**
  - **Public layout**: CAMS Services logo, Who We Are, What We Do, Our Packages, Blog, Let’s Connect.
  - **Authenticated layout(s)**: dashboard navigation + profile/logout only (no public marketing links).

#### Phase 5 – Parallel Run & Filament Decommissioning (3–5 days)

- **Parallel run**
  - Run Filament and Next.js admin **side‑by‑side** against the same Laravel 12 backend.
  - Let internal users test and validate the Next.js admin.
- **Cut‑over**
  - Once feature parity is confirmed, progressively disable Filament:
    - Restrict access to Filament routes to super‑admins only.
    - Remove or archive unused Filament resources.
  - Eventually remove Filament dependency from `composer.json` once no longer needed.
- **Outcome**
  - Clean, API‑driven backend with Next.js‑only admin experience.

### 4. Clean Architecture & DDD Considerations

- **Domain first**
  - All core rules implemented in **Domain / Application** layers, not in controllers, Filament, or React components.
- **Repositories & boundaries**
  - Backend exposes repositories as interfaces; infrastructure (Eloquent) provides implementations.
  - Frontend (Next.js admin) depends on TypeScript interfaces and **repository adapters** that call the Laravel admin APIs.
- **CMS‑agnostic**
  - No Filament‑specific concepts ever leak into TypeScript types or React components.
  - All references are to "**remote backend API**" or neutral domain concepts.

### 5. Risks & Mitigations

- **Risk: Upgrade instability (Laravel 12.x)**
  - Mitigation: Isolate upgrade on a feature branch, add smoke tests for critical flows, and perform incremental upgrades.
- **Risk: Hidden business logic in Filament**
  - Mitigation: Systematic scan of all Filament resources/actions; extract logic into services and use‑cases before removing Filament.
- **Risk: Admin UX regression**
  - Mitigation: Run both admin UIs in parallel; gather feedback; iterate on Next.js admin before retiring Filament.

### 6. Next Steps (Actionable)

1. Confirm current Laravel version and Filament footprint (resources, pages, widgets).
2. Create a dedicated **feature branch** for the Laravel 12 upgrade.
3. Begin Phase 2 (Upgrade) and document any breaking changes encountered.
4. In parallel, draft the admin API surface (major resources and endpoints) for Phase 3.

