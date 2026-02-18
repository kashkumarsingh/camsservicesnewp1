## Universal Dashboard Components - Frontend Mapping

### Files Modified/Created (In Order)
1. **File:** `docs/cleanarchitecture/frontend/UNIVERSAL_DASHBOARD_COMPONENTS.md`  
 - Layer: Frontend / Documentation  
 - Order: 1  
 - Purpose: Document how the `universal-dashboard` playground components map to the real `frontend` components, and which ones are the canonical versions to use in production.

### Plain English Explanation
The `universal-dashboard/` folder is a **standalone playground app** used to design the dashboard UX (shell, tables, cards, calendar patterns, etc.).  
The **production source of truth** for the live site is the `frontend/` app.

For every component pattern that should be reused across dashboards (parent, trainer, admin), we have created (or upgraded) an equivalent component under `frontend/src/components`.  
Engineers should now **only import from `frontend`**, not from `universal-dashboard`, when building real screens.

The `universal-dashboard` app can still be used as:
- A visual reference for new patterns
- A safe place to prototype UX ideas
- A design playground not directly coupled to production

When a playground component is ready for real use, we **port and adapt** it into `frontend` and treat the `frontend` version as canonical.

### Mapping: Universal → Frontend

#### Layout & Shell

- **Dashboard shell**
  - Universal: `universal-dashboard/components/dashboard/DashboardShell.tsx`
  - Frontend (canonical): `frontend/src/components/dashboard/layout/DashboardShell.tsx`
  - Notes:
    - The frontend version is fully wired to **real auth**, roles, redirects and route access rules.
    - Always use the **frontend** `DashboardShell` when building any page under `/dashboard/*`.

#### Universal Dashboard Building Blocks

- **Breadcrumbs**
  - Universal: `universal-dashboard/components/common/breadcrumbs.tsx`
  - Frontend (canonical): `frontend/src/components/dashboard/universal/Breadcrumbs.tsx`
  - Extras in frontend:
    - `className` prop
    - Marked as a client component
    - Exposed via barrel file:
      - `frontend/src/components/dashboard/universal/index.ts`

- **Data table**
  - Universal: `universal-dashboard/components/tables/data-table.tsx`
  - Frontend (canonical): `frontend/src/components/dashboard/universal/DataTable.tsx`
  - Extras in frontend:
    - Integrated with shared **EmptyState** pattern
    - Uses the main `Button` component from `frontend`
    - Stronger typing and accessibility tweaks
  - Usage:
    - Import from the barrel file:
      ```ts
      import {
        DataTable,
        type Column,
        type DataTableProps,
      } from '@/components/dashboard/universal';
      ```

- **Empty state card**
  - Universal: `universal-dashboard/components/cards/empty-state.tsx`
  - Frontend (canonical): `frontend/src/components/dashboard/universal/EmptyState.tsx`
  - Extras in frontend:
    - `className` prop
    - `role="status"` + `aria-label` for accessibility
  - Usage:
    - Import from barrel:
      ```ts
      import { EmptyState } from '@/components/dashboard/universal';
      ```

#### Generic UI Primitives

Several universal-dashboard primitives map to richer, production-ready equivalents in `frontend`:

- **Buttons**
  - Universal: `universal-dashboard/components/common/button.tsx`
  - Frontend (canonical): `frontend/src/components/ui/Button/Button.tsx`

- **Inputs / Select / Form helpers**
  - Universal: `universal-dashboard/components/common/input.tsx`, `select.tsx`, `forms/*`
  - Frontend:
    - Currently, forms are built using **page-specific JSX** plus shared field patterns.
    - When we standardise a form field/wrapper, it should live under:
      - `frontend/src/components/ui/` (generic) or
      - `frontend/src/components/dashboard/universal/` (dashboard-only pattern)

- **Stat cards**
  - Universal: `universal-dashboard/components/cards/stat-card.tsx`
  - Frontend (canonical): `frontend/src/components/ui/StatCard/StatCard.tsx`
  - Frontend version is more powerful (variants, progress, badges), and should always be used for production stats.

- **Calendar patterns**
  - Universal:
    - `universal-dashboard/components/calendar/MainCalendar.tsx`
    - `universal-dashboard/components/calendar/MiniCalendar.tsx`
    - `universal-dashboard/components/calendar/HorizontalCalendar.tsx`
  - Frontend (canonical):
    - `frontend/src/components/ui/Calendar/BaseMonthCalendar.tsx`
    - `frontend/src/components/ui/Calendar/BookingCalendar.tsx`
    - `frontend/src/components/ui/Calendar/HorizontalCalendar.tsx`
    - `frontend/src/components/ui/CalendarGrid/CalendarGrid.tsx`
  - The frontend calendar components are tightly integrated with **CAMS booking logic** and the **Parent UX standard**, and must be used in preference to the playground versions.

- **Modals, sheets, popovers, toasts**
  - Universal:
    - `universal-dashboard/components/modals/modal.tsx`
    - `universal-dashboard/components/sheet/Sheet.tsx`
    - `universal-dashboard/components/popovers/Popover.tsx`
    - `universal-dashboard/components/common/toast.tsx`
  - Frontend (canonical):
    - `frontend/src/components/ui/Modal/BaseModal.tsx`
    - `frontend/src/components/ui/SideCanvas.tsx`
    - `frontend/src/components/ui/Toast/Toast.tsx`
    - `frontend/src/components/ui/Toast/ToastContainer.tsx`
    - Multiple domain-specific dashboard modals under:
      - `frontend/src/components/dashboard/modals/*`
  - Guidance:
    - Use `BaseModal`, `SideCanvas` and the toast system in `frontend` for any real flows.
    - Treat the universal-dashboard implementations as **design references only**.

- **Loading skeletons**
  - Universal: `universal-dashboard/components/common/loading-skeleton.tsx`
  - Frontend (canonical):
    - `frontend/src/components/ui/Skeleton/*`
    - Controlled via `frontend/src/utils/skeletonConstants.ts`
  - Per the global skeleton policy, all new skeletons must:
    - Live under `components/ui/Skeleton/`
    - Be re-exported via the `index.ts` in that folder
    - Use named counts from `SKELETON_COUNTS`

### Summary of Changes

- The **canonical, production-ready versions** of universal dashboard primitives now live in:
  - `frontend/src/components/dashboard/universal/` (dashboard-specific building blocks)
  - `frontend/src/components/dashboard/layout/` (dashboard shell)
  - `frontend/src/components/ui/` (generic UI primitives such as buttons, modals, calendars, skeletons, stat cards, toasts)
- The `universal-dashboard/` app is officially treated as a **UX playground and design reference**, not as a dependency for the production frontend.
- Engineers building any page under `/dashboard/*` should:
  - Import from `@/components/dashboard/layout` and `@/components/dashboard/universal` for layout/table/empty-state/breadcrumbs.
  - Import from `@/components/ui/*` for generic UI primitives.

### Clean Architecture Compliance

- **Dependencies flow one way**:
  - Domain / application logic lives under `frontend/src/core` and `frontend/src/interfaces`.
  - Presentation components (`app/`, `components/dashboard/*`, `components/ui/*`) depend on these, not the other way round.
- **Universal dashboard components are presentation-only**:
  - No domain logic is hidden inside the universal components; they are purely structural and visual.
  - This keeps them easy to reuse across parent, trainer and admin dashboards.
- **No cross-app coupling**:
  - The production `frontend` app does **not** import anything from `universal-dashboard/`.
  - Any future reuse is done by explicitly porting/adapting a pattern into `frontend`.

### Next Steps

- When you design a new dashboard pattern in `universal-dashboard/` and want it in production:
  1. **Copy and adapt** the component into `frontend/src/components/dashboard/universal` or `frontend/src/components/ui`.
  2. Ensure it follows:
     - TypeScript strictness
     - Accessibility rules (WCAG 2.1 AA)
     - Existing skeleton/loading patterns
  3. Add a short note here if the mapping changes.
- Over time, we can:
  - Replace placeholder dashboard pages (e.g. some admin/trainer routes) with real tables/cards based on these shared components.
  - Extend `dashboard/universal` with any additional cross-role patterns we standardise (e.g. shared filters toolbar, inline-edit controls).

