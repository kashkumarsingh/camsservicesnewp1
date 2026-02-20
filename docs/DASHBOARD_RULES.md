# Dashboard — Hardcoding, Duplication, Consistency & Functionality

**Purpose:** Single source of truth for all dashboard layout, components, patterns, and Cursor checks. Never build ad hoc dashboard UI; use shared components and constants.

**Reference:** `.cursor/rules/dashboard-standards.mdc` applies when editing dashboard files.

---

## Dashboard Layout

- All dashboard pages use the shared **DashboardLayout** wrapper — never build page chrome (sidebar, topbar, breadcrumbs) inline.
- Page padding, max-width, and grid columns are never hardcoded per page — always from layout component or Tailwind config.
- Dashboard section headers (title + subtitle + optional action button) use a shared **PageHeader** component — never write ad hoc h1/p/button per page.
- Sidebar nav items, labels, icons, and routes are defined in a **single nav config file** — never hardcoded in the sidebar component itself.

---

## Dashboard Tables — Complete Rules

### Table Structure
- Every DataTable has exactly these states, all required, none optional:
  * **Loading** → TableRowsSkeleton with count from SKELETON_COUNTS
  * **Error** → inline error message with a retry button
  * **Empty** → EmptyState component with copy from constants + primary action where applicable
  * **Data** → rendered rows
- Column definitions are always defined **outside the component**, never inline in JSX or inside render.
- Column widths use **Tailwind scale classes** — never arbitrary `w-[230px]` or inline styles.
- Action column is always the **last/rightmost** column, never inline with data columns.
- Tables **never fetch their own data** — always receive data via props from a page-level hook.

### Sorting
- Sortable columns are declared in the column definition — never add sort logic inline in the page.
- Sort state lives in the **URL (query params)** for full-page tables — never local state only.
- Sort indicator uses a consistent icon (e.g. ChevronUp/ChevronDown from lucide-react) — never custom arrows per table.
- Default sort column and direction are defined in a **table config constant** — never hardcoded in JSX.
- Multi-column sort is handled consistently if supported — never different behaviour per table.
- Clicking an already-sorted column cycles: **asc → desc → unsorted** — never just toggles asc/desc.

### Filtering
- Filter state lives in the **URL** for full-page tables — never local state that gets lost on navigation.
- All filters use shared **FilterBar** component with consistent layout — never ad hoc filter UI per page.
- Search input is always the same **SearchInput** component with a clear button when value is present.
- Date range filters always validate **end ≥ start** — never allow impossible ranges.
- Status filters use **STATUS constants** for values — never hardcoded strings like `'pending'`.
- "Clear all filters" always resets to default state including URL params — never partial reset.
- Active filter count badge shows on filter button when filters are applied — never hidden.
- Filters and sort are applied **server-side** for paginated tables — never filter a partial dataset client-side.

### Pagination
- Pagination uses a single shared **Pagination** component — never build ad hoc prev/next buttons.
- Page size options come from **PAGINATION_OPTIONS** constant — never hardcoded `[10, 25, 50]`.
- Current page, page size, and total count are always shown — never hide total.
- Pagination state lives in **URL query params** — never local state.
- Changing page size **resets to page 1** — never stays on a page that no longer exists.
- Keyboard navigation works on pagination controls — never mouse-only.

### Row Actions (Edit, Delete, View)
- Row actions use consistent **icon buttons with tooltip and aria-label** — never text links.
- Action icons are consistent across all tables:
  * View/Details → **Eye** icon
  * Edit → **Pencil** icon
  * Delete → **Trash** icon
  * Duplicate → **Copy** icon
  * Approve → **Check** icon
  * Reject → **X** icon
- Never mix text buttons and icon buttons for row actions across different tables.
- Delete row action always opens **ConfirmDeleteModal** — never deletes on single click.
- ConfirmDeleteModal always **names the specific item** — never "Delete this item?"
- Edit row action opens the same EditModal used elsewhere — never a separate inline form just for tables.
- All row action buttons are **disabled while any action for that row is in flight**.
- Action buttons that are not permitted for the current user role are **hidden** — never just disabled without explanation.

### Create Action
- Primary create action is always **top-right of the PageHeader** — never inside the table.
- Create button label is always **imperative verb + noun**: "Add Trainer", "Create Booking" — never just "New" or "Add".
- Create opens a modal for simple forms — navigates to a dedicated page for complex multi-step forms.
- After successful create: **close modal, show success toast, invalidate table data, table reflects new row** — all four, every time.
- Create form in modal uses the same form components as the standalone create page — never two versions.

### Edit Action
- Inline editing is only used for **single-field quick edits** (e.g. toggling status, updating a name in place).
- Full record editing always uses a **modal or dedicated page** — never expand a table row into a form.
- Edit modal **pre-fills all fields** from the current row data — never opens blank.
- Edit modal loads **fresh data from API on open** if the row data could be stale — never relies on table cache alone.
- After successful edit: **close modal, show success toast, invalidate table data** — always all three.
- If edit fails: **keep modal open, show error toast, preserve user input** — never close on failure.

### Delete Action
- Delete always requires **confirmation** — never single-click delete.
- **ConfirmDeleteModal** is the single shared component for all delete confirmations.
- Confirmation copy always includes: **item name, consequence, "cannot be undone"** — never vague.
- After successful delete: **close modal, show success toast, invalidate table data, remove row** — always all four.
- If deleting the **last item on a page**, navigate to previous page — never show empty paginated page.
- Bulk delete follows the same confirmation pattern with **item count**: "Delete 5 bookings? This cannot be undone."

### Update / Status Toggle
- Status toggles (active/inactive, approve/reject) use consistent toggle or select components — never ad hoc per table.
- Status change always shows **loading state on the specific row** — never full table reload.
- Status change always shows **success/error toast** — never silent.
- Optimistic update is allowed for status toggles but **must roll back on failure** — never leave wrong status showing.
- After any status change, affected rows reflect new state immediately — never require manual refresh.

### Clickable Rows
- If a row is clickable (navigates to detail), the **entire row** is the click target — never just a "View" link.
- Clickable rows have a **visible hover state** (background change) — never no visual feedback.
- Clickable rows use **cursor-pointer** — never default cursor.
- Row click navigates using **route constants** — never hardcoded paths.
- If a row has both clickable navigation AND action buttons, **clicking action buttons does not trigger row navigation** — always stopPropagation on action buttons.
- Keyboard users can activate a clickable row with **Enter** — never mouse-only.
- Rows that open a modal on click use the same pattern as rows that navigate — never inconsistent.

### Inline Editing
- Inline editing is only for **single-field edits** — never multi-field inline forms.
- Inline edit activates on **click of the field or a dedicated edit icon** — never double-click (inconsistent on touch).
- Inline edit always shows **save and cancel controls** — never auto-save without confirmation for destructive changes.
- **Pressing Enter saves, pressing Escape cancels** — always, for every inline edit field.
- Inline edit field is **pre-filled with current value** — never blank.
- While saving inline edit: **field shows loading state, save/cancel disabled** — never allow double submit.
- After successful inline save: **show success toast, update row in place** — never full table reload.
- After failed inline save: **show error toast, restore original value, keep field active for correction**.

### Bulk Actions
- Bulk actions toolbar appears **above the table only when rows are selected** — never always visible.
- Selected row count is shown in the bulk toolbar: **"3 rows selected"** — never just a checkbox count.
- Bulk actions available depend on selected rows (e.g. can only approve rows that are pending) — never enable invalid bulk actions.
- Select all checkbox selects **all rows on the current page** — never all pages (clarify this to user if needed).
- After bulk action completes: **deselect all, show success toast with count, invalidate table data**.
- Bulk delete uses the same **ConfirmDeleteModal** with count in copy.

### Table Persistence
- Column sort and filter preferences can be persisted per table per user if the table is frequently used.
- Persistence uses a consistent storage key pattern: **table-prefs-[tableName]** — never arbitrary keys.
- Persisted preferences are **versioned** — never break silently when table structure changes.

### Cursor Checks Before Generating Any Table Code
1. Are column definitions outside the component? → Move them out.
2. Does the table handle all four states: loading, error, empty, data? → All required.
3. Is filter and sort state in the URL? → It must be for full-page tables.
4. Does delete use ConfirmDeleteModal with item name? → Always.
5. Does row click stopPropagation on action buttons? → Always.
6. Does inline edit respond to Enter/Escape? → Always.
7. After create/edit/delete: toast + invalidate + UI update? → All three, every time.
8. Are status strings using STATUS constants? → Always.
9. Is the create button in the PageHeader, not inside the table? → Always.
10. Does the last-item delete handle pagination correctly? → Check it.
11. Are action icons consistent with the global icon mapping? → Check before adding.
12. Does bulk select clarify it's current-page only? → Always.

---

## Status Badges

- All status badges use **getStatusBadgeClasses()** or **getPaymentStatusBadgeClasses()** — never write inline badge classes.
- Badge colour mapping is defined once:
  - **active / confirmed / paid / approved** → green
  - **pending / awaiting** → yellow
  - **inactive / cancelled / failed / rejected** → red
  - **draft / neutral / unknown** → grey
  - **completed** → blue
- Never use a different colour for the same status in different parts of the dashboard.
- Badge font size is part of the badge helper — never add `text-[11px]` or `text-xs` alongside a badge call.
- Badge component accepts a `status` string and maps internally — never map status → colour inline in a page.

---

## Status Constants — Single Source

- **BOOKING_STATUS** and **PAYMENT_STATUS** live **only** in `frontend/src/utils/dashboardConstants.ts`.
- Do **not** import `BookingStatus` or `PaymentStatus` from `@/core/domain/booking` for dashboard UI conditionals, filters, or display.
- `@/core/domain/booking` types are for **domain/API layer only** (entities, value objects, mappers, use cases).
- Dashboard UI **always** uses `BOOKING_STATUS` and `PAYMENT_STATUS` from `dashboardConstants.ts` for status checks, filter values, and badge display.

---

## Tables — Outstanding Work

### Apply to ALL remaining admin tables (Children, Packages, Services, Public Pages, Trainers)

- **Error + onRetry** — same pattern as AdminBookingsPageClient (inline error message with retry button).
- **EmptyState** — use EmptyState component with EMPTY_STATE constants; no ad hoc "no data" messages.
- **Row actions** — Eye / Pencil / Trash icon buttons with `aria-label` and `title`; no text labels, no emoji.
- **Status strings** — from BOOKING_STATUS / PAYMENT_STATUS / dashboardConstants only; no hardcoded status strings.
- **Typography** — `text-2xs` for small labels; no `text-[11px]` or `text-[10px]`.

### Not yet done — treat as follow-up tickets

- **Sort and filter state in URL** — do admin bookings first as the pattern, then apply to other tables.
- **Shared FilterBar** — each table currently builds its own filter UI; extract to shared component.
- **Shared Pagination** — DataTable uses its own prev/next; extract to shared Pagination component.
- **Shared SearchInput** — extract from DataTable into standalone component with clear button.
- **Clickable row + stopPropagation** — audit all tables; only parent bookings confirmed done.
- **Bulk actions** — no table currently has this; implement as shared pattern when needed.
- **ConfirmDeleteModal audit** — verify all delete actions use it; none are single-click delete.
- **Inline editing** — pattern not defined or implemented anywhere yet.

---

## Dashboard Cards / Stat Cards

- All metric/stat cards (e.g. total bookings, revenue) use a shared **StatCard** component — never build ad hoc stat blocks.
- StatCard props: **title, value, delta?, icon?, isLoading?** — consistent across all dashboards.
- Card padding, shadow, border radius come from **Tailwind config tokens** — never hardcoded.

---

## Filters & Search

- All dashboard filter bars use a shared **FilterBar** or consistent pattern — never build ad hoc filter UI per page.
- Search input is always the same shared **SearchInput** component.
- Filter state is always in the **URL (query params)** for pages, or in **local state** for modals — never mixed.
- "Clear filters" always resets to the **default state** — never leaves partial filters applied.
- **Active filter count** is shown consistently when filters are applied.

---

## Modals in Dashboard Context

- All dashboard modals follow: **header (title + close X) → scrollable body → sticky footer (Cancel left, Primary right)**.
- Modals that load data on open show a **skeleton inside the modal** — never a blank modal while loading.
- Modals that perform an action **disable all action buttons while in flight** — never allow double submission.
- Confirmation modals for destructive actions always use the **destructive button variant** and include: what will be deleted, that it cannot be undone.
- Modal width follows a consistent scale: **sm** (400px token), **md** (600px token), **lg** (800px token) — never arbitrary widths.

---

## Forms in Dashboard

- All dashboard forms use **react-hook-form** — never mix with controlled state forms.
- All form fields use shared **Input, Select, Textarea, Checkbox** components — never raw HTML inputs.
- Required field indicators are **consistent** across all dashboard forms (always * or always "(required)").
- Form sections use a shared **FormSection** component with title + optional description — never ad hoc section headers.
- Date/time pickers are always the **same component** — never mix native `<input type="date">` with a custom picker.

---

## Action Buttons & Toolbar

- **Primary page action** (e.g. "Add Trainer", "Create Booking") is always **top-right** of the page header.
- **Bulk actions** appear in a consistent toolbar **above the table** when rows are selected — never inline per row.
- **Danger/destructive** actions (delete, deactivate) always use the **destructive button variant** — never default or secondary.
- Icon buttons always have **aria-label and tooltip** — never icon-only with no accessible label.

---

## Dashboard-Specific Hardcoding to Never Do

- Never hardcode a **user role** string inline (e.g. `'admin'`, `'trainer'`, `'parent'`) — use **role constants**.
- Never hardcode a **route** string in a dashboard component — use a **routes constants file**.
- Never hardcode a **currency symbol** — use a shared **formatCurrency()** utility.
- Never hardcode a **date format** string — use a shared **formatDate()** utility with a **named format constant**.
- Never hardcode a **pagination page size** — use a shared **PAGINATION** constant.
- Never hardcode **dashboard section titles** as plain strings — use a **constants file**.
- Never hardcode a **timezone** — use a shared **getUserTimezone()** or app-level timezone constant.
- Never hardcode a **phone number format** — use a shared **formatPhone()** utility.
- Never hardcode a **file size limit** (e.g. `5 * 1024 * 1024`) — use a **FILE_SIZE_LIMITS** constant.
- Never hardcode an **API polling interval** — use a **POLLING_INTERVALS** constant.
- Never hardcode **colour values** in chart configs (recharts, chart.js etc.) — use **CHART_COLORS** from a constants file that pulls from the Tailwind theme.
- Never hardcode a **"max items" / "max children" / "max sessions"** business rule inline — use a **BUSINESS_RULES** or **LIMITS** constants file.
- Never hardcode a **status string** like `'pending'` or `'confirmed'` inline in conditionals — use a **STATUS** constants object.
  - Bad: `if (booking.status === 'confirmed')`
  - Good: `if (booking.status === BOOKING_STATUS.CONFIRMED)`

---

## Redundant / Duplicate Patterns to Avoid

- Never create a new hook if **useAdminBookings**, **useMyBookings**, **useTrainerSessions** etc. already exist — check **hooks/** first.
- Never duplicate **permission/role checking** logic — use a shared **usePermissions()** hook or **withRole()** HOC.
- Never write the same **filter logic** (date range, status, search) in multiple pages — extract to a shared **useTableFilters()** hook.
- Never duplicate the **"export to CSV"** button and logic — use a shared **ExportButton** component.
- Never duplicate the **"confirm delete"** modal — use a shared **ConfirmDeleteModal** with dynamic item name.
- Never write the same **"refetch after mutation"** pattern differently per page — use a shared pattern or hook.

---

## Loading & Skeleton Consistency

- **Page-level** loading uses **DashboardSkeleton** — never a full-page spinner.
- **Table** loading uses **TableRowsSkeleton** with **SKELETON_COUNTS** — never arbitrary row counts.
- **Card/stat** loading uses **StatCardSkeleton** — never hide cards while loading.
- **Modal content** loading uses a skeleton matching the modal's content shape — never a spinner centered in the modal.
- Skeleton counts are defined in **SKELETON_COUNTS** constants — never hardcode the number of skeleton rows.

---

## Permissions & Role-Based UI

- All role-based UI decisions go through a single **usePermissions()** hook or equivalent.
- Never check **user.role === 'admin'** inline in JSX — always use a **permission helper**.
- Hidden/disabled UI for insufficient permissions uses a **consistent pattern** — never ad hoc conditional rendering per component.
- Admin-only actions are wrapped consistently — never scattered inline role checks.
- Never **show a route/page** to a user who doesn't have permission — **guard at the layout level**, not inside the page.
- Permission denied state uses a shared **AccessDenied** component — never ad hoc "You don't have access" text.
- Never conditionally render an entire dashboard section based on role inline — use a **withPermission()** wrapper or **PermissionGate** component.

---

## Charts & Data Visualisation

- All charts use the **same library** — never mix recharts with chart.js or any other.
- Chart colours come from **CHART_COLORS** constants (mapped from Tailwind theme) — never inline hex in chart config.
- All charts handle **loading** (skeleton), **empty** (EmptyState or "No data" variant), and **error** states.
- Chart tooltips follow a **consistent format** across all dashboards.
- Chart containers have **consistent aspect ratios** from a shared constant — never arbitrary `h-[320px]` per chart.

---

## Real-time / Live Data

- All live refresh / polling / websocket logic goes through **LiveRefreshContext** — never add independent `setInterval` or Pusher subscriptions in individual components.
- Stale data indicators (e.g. "last updated X ago") use a **single shared utility**.
- Optimistic updates follow a **consistent rollback pattern** — never leave UI in a broken state on failure.

---

## Data Fetching Patterns

- Every data-fetching hook returns the same shape: **{ data, isLoading, error, refetch }** — never inconsistent return shapes.
- **Never fetch data inside a modal component** — fetch in the parent and pass as props, or use a dedicated hook triggered on open.
- Never call refetch in a `useEffect` watching data — use **onSuccess callback** in the mutation.
- Cache invalidation after mutation always uses the **same pattern** (e.g. `queryClient.invalidateQueries`) — never mix with manual refetch calls.
- Never show **stale data** after a successful mutation — always invalidate or update the cache immediately.

---

## Notifications & Alerts (dashboard-specific)

- In-app notifications (bell icon) use a single **NotificationCenter** component — never build per-page notification lists.
- Alert banners (e.g. "Your profile is incomplete") use a shared **AlertBanner** component — never ad hoc coloured divs.
- Badge counts (unread notifications, pending items) are **derived from a single source** — never compute the same count in multiple places.

---

## Dashboard Navigation Edge Cases

- **Active sidebar item** is always derived from the **current route** — never managed with local state.
- **Sidebar collapse state** is persisted (localStorage or user preference) — never resets on every page load.
- **Breadcrumbs** are generated from a **route config** — never hardcoded per page.
- **Back navigation** always goes to the **logical parent route** — never `history.back()`.

---

## Functional Gaps Often Missed

- Every table with more than one page of data has **keyboard-accessible pagination**.
- Every async button shows **what happened** — success toast OR error toast, never silent failure.
- Every form with file upload shows **upload progress** — never just a spinner.
- Every modal with unsaved changes **warns before closing** — never silently discards input.
- Every delete that is irreversible **says so explicitly** — never just "Delete this item?".
- Every "load more" or infinite scroll has a **"no more results" end state** — never just stops loading silently.
- Every search input has a **clear/reset button** when it has a value.
- Every date range filter **validates that end date is after start date** — never allows impossible ranges.
- Session timeout / auth expiry **redirects to login with a "session expired" message** — never a silent 401.

---

## Copy & Content

- All dashboard labels, column headers, action names, and confirmation copy live in a **dashboard constants or i18n file**.
- Error messages shown to users are **human-readable** — never expose raw API error strings or stack traces.
- Loading messages are **consistent** — never mix "Loading...", "Fetching...", "Please wait...".
- Confirmation modal copy always **names the specific item**: "Delete session on 20 Feb?" not "Delete this item?".

---

## Cursor Checks Before Generating Any Code

1. Does a shared **DataTable**, **StatCard**, **FilterBar**, or **PageHeader** already exist? → Use it.
2. Am I defining **columns inline in JSX**? → Move outside the component.
3. Am I writing a **status badge inline**? → Use **getStatusBadgeClasses()**.
4. Am I hardcoding a **role string, route, currency, date format, or page size**? → Use constants.
5. Am I building a **confirm-delete modal** from scratch? → Use **ConfirmDeleteModal**.
6. Am I writing **export CSV** logic in the page? → Use **ExportButton**.
7. Am I checking **user.role** inline? → Use **usePermissions()**.
8. Am I handling loading with a **spinner** instead of a skeleton? → Use the correct skeleton component.
9. Does a **hook** already exist for this data? → Check **hooks/** before creating a new one.
10. Am I writing **filter logic** that already exists elsewhere? → Extract to **useTableFilters()**.

---

## Cursor Checks (Additional)

11. Am I hardcoding a **status string in a conditional**? → Use **STATUS** constants.
12. Am I adding a **Pusher subscription or setInterval** outside LiveRefreshContext? → Don't.
13. Am I building a chart with **inline hex colours**? → Use **CHART_COLORS**.
14. Am I **fetching data inside a modal**? → Fetch in parent or hook triggered on open.
15. Am I showing a **raw API error** to the user? → Map to a human-readable message.
16. Does my **delete confirmation** name the specific item? → It should.
17. Does my **search input** have a clear button? → It should.
18. Does my **date range filter** validate end > start? → It should.
19. Am I **computing a badge count** in more than one place? → Single source.
20. Does my **"load more"** have an end state? → It should.
