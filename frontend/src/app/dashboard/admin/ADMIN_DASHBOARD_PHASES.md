# Admin Dashboard – Implementation Phases

**Purpose:** Track remaining work for the admin dashboard (Overview page) and implement one phase at a time.

**Current date context:** February 2025. Today: Saturday 14 February 2025.

---

## Already in place

- Top alert bar – 4 clickable cards (Unassigned, Pending payments, Children 0 hours, Today’s sessions); modals/links; urgency styling.
- Tabs – Schedule (default), Trainers, Families, Stats.
- Schedule tab – Trainer × week grid, cells with time/child/ref/package, “View booking”, “Assign” for unassigned, week nav, “This week”.
- Trainers tab – Minimal: active/total summary + “View trainers →”.
- Families tab – Minimal: active families, 0-hours warning, links to Parents/Children.
- Stats tab – Full: action required, KPI cards, today’s sessions, 4 widgets, quick actions, week calendar.
- Right sidebar – Today’s activity, Needs attention, Quick stats.
- Left sidebar – Overview, Bookings, Users, Parents, Children, Trainers, Activities, Services, Packages, Public pages, Reports, Settings.
- Modals – Unassigned (quick assign), Pending payments, Zero hours.

---

## Phase list (suggested order)

| # | Phase | Spec summary | Status |
|---|--------|---------------|--------|
| 1 | **Trainers tab (full)** | Overview stats; trainer cards with status, specialties, locations, rating; View Schedule / Assign / Profile. | Done |
| 2 | Families tab (full) | Overview stats; nested Parent → Children; filters; alerts; actions. | Done |
| 3 | Schedule tab – views & status | Status icons; view switcher (By Trainer / By Day / List); Add Trainer row; row Actions. | Done |
| 4 | Quick Nav bar | [Bookings] [Parents] [Children] [Trainers] [More ▼] under header. | Removed (redundant with left sidebar) |
| 5 | Quick Actions bar | [New Booking] [Add Parent] [Add Child] [Add Trainer] [More ▼]. | Done |
| 6 | Stats tab – polish | Sessions breakdown; revenue chart; Top performers; View Full Reports. | Done |
| 7 | **Tab redesign (Overview first)** | Tabs: Overview (default), Schedule, Timesheets, Trainers, Families. Stats merged into Overview. Right sidebar only on Overview. | Done |
| 8 | Global Quick Search | Search parents, children, trainers, bookings; grouped results. | Done |
| 9 | Responsive + modals + polish | Tabs dropdown; list view; collapsible sidebars; mobile nav; modal/sidebar actions. | Done |

---

## Implementation log

- **Phase 1 (Trainers tab):** `AdminDashboardTrainersTab` – overview stats (active/total), trainer cards (status, specialties, service areas, rating), quick actions: View Schedule, Assign, Profile.
- **Phase 2 (Families tab):** `AdminDashboardFamiliesTab` – overview stats (active, 0h, pending payments, new); nested Parent → Children cards with 0h badge and payment-issue highlight; filters All / Low hours / Payment issues; actions Contact (mailto), View profile (parents), Add hours (bookings).
- **Phase 3 (Schedule tab):** `AdminScheduleWeekGrid` – status icons per session (✓ completed, ⚠️ no_show/rescheduled, 🔴 cancelled, ? unassigned, scheduled); view switcher By Trainer | By Day | List; "+ Add Trainer" row (link to trainers); row action "View schedule" per trainer; By Day shows sessions grouped by day; List shows flat table (Date, Time, Trainer, Child/Ref, Status, Actions).
- **Phase 4 (Quick Nav bar):** Removed. The horizontal nav duplicated the left sidebar (Overview, Bookings, Parents, Children, Trainers, etc.); `AdminQuickNavBar` was deleted and no longer rendered in `dashboard/admin/layout.tsx`.
- **Phase 5 (Quick Actions bar):** `AdminQuickActionsBar` – top bar [New Booking] [Add Parent] [Add Child] [Add Trainer] [More ▼]; primary actions link to bookings, parents, children, trainers; More dropdown: View reports, Trainer applications, Settings. Rendered in admin layout (if still in use; otherwise left sidebar is the single nav).
- **Phase 6 (Stats tab polish):** View Full Reports CTA at top of Stats tab; Sessions breakdown (Completed today, In progress, Upcoming today, Cancelled bookings); Revenue trend chart (last month vs this month bars in Revenue widget); Top performers (top 5 trainers by rating, link to trainers).
- **Phase 7 (Tab redesign):** Tab order is now **Overview** (default), Schedule, Timesheets, Trainers, Families. Stats tab removed; its content is shown inside the Overview tab below the greeting, needs-attention strip, and four KPI cards. The right sidebar (Today's activity, Needs attention, Quick stats) is shown **only when the Overview tab is active**; Schedule, Timesheets, Trainers, and Families tabs use full width without the sidebar.
- **Phase 8 (Global Quick Search):** Admin dashboard shell shows a global search input (admin only). Typing queries the backend `GET /api/v1/admin/search?q=...`; results are grouped (Parents, Children, Trainers, Bookings), each limited to 5. Clicking a result navigates to the corresponding list page. Implemented: `AdminSearchController`, `AdminGlobalSearch` component, `useAdminGlobalSearch` hook, `ADMIN_SEARCH` endpoint, `ADMIN_GLOBAL_SEARCH` constants.
- **Phase 9 (Responsive + modals + polish):** (1) Admin overview tabs show as a dropdown on small screens, horizontal tabs on md+. (2) Quick Nav in admin layout; on small screens single Quick links dropdown; on md+ horizontal bar + More. (3) Right sidebar on overview collapsible via `isCollapsed` / `onToggleCollapse`. (4) List view in Schedule tab; SideCanvas mobile behaviour unchanged.
- **Reports page:** `AdminReportsPageClient` – Summary KPIs (bookings, revenue, trainers, families), Sessions last 7 days bar chart (`sparklineCounts`), Export bookings/trainers CSV. Constants in `reportsConstants.ts`.
