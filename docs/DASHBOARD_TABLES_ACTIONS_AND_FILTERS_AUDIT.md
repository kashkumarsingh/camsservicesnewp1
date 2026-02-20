# Dashboard Tables — Actions & Filters Audit

**Purpose:** Single reference for which dashboard tables have which row actions, how those actions look (UI), and how filters are implemented so we can align them.

---

## 1. Dashboard-wise: Tables, Actions, and UI

### Admin dashboard

| Page | Table component | Row actions | Action UI (how it looks) |
|------|-----------------|-------------|---------------------------|
| **Bookings** | Custom `<table>` | View (Eye) | Raw `<button>`: `border-slate-300`, `text-slate-600`, icon only. Slate/grey. |
| **Children** | DataTable | Complete checklist (ClipboardCheck), Approve (CheckCircle), Reject (XCircle), View (Eye), Edit (Edit), Link parent (Users), View Parent, Delete (Trash2) | Shared `Button`: `variant="bordered"` (primary blue) for most; one custom blue class for checklist; `variant="destructive"` for Delete (Button has no destructive → renders as primary). Mix of icon + text. |
| **Trainers** | DataTable | Availability (text), View (Eye), Edit (Pencil), Activate/Deactivate, Delete (Trash2) | Shared `Button`: `variant="bordered"`; custom emerald for Availability; `variant="destructive"` for Delete (→ primary). |
| **Packages** | DataTable | Edit, Delete | Raw `<button>`: Edit = slate border/text; Delete = rose border/text. Text labels "Edit" / "Delete". |
| **Services** | DataTable | Edit, Delete | Raw `<button>`: same as Packages — slate Edit, rose Delete, text labels. |
| **Public Pages** | DataTable | Publish/Unpublish (text), View (Eye), Edit (Edit), Delete (Trash2) | Shared `Button`: `variant="bordered"` for Publish/View/Edit, `variant="destructive"` for Delete (→ primary). |
| **Parents** | Custom `<table>` | Approve, Reject (if pending), Edit, View children, Delete | Raw `<button>`: emerald Approve, rose Reject, slate Edit / View children, rose Delete. Text labels, `text-[11px]`. |
| **Users** | Custom `<table>` | Approve, Reject (if pending), Edit, Delete | Raw `<button>`: emerald Approve, rose Reject, slate Edit, rose Delete. Text labels, `text-2xs`. |
| **Activities** | Custom `<table>` | Edit, Delete | Raw `<button>`: slate Edit (`border-slate-200`), rose Delete. Text "Edit" / "Delete". |
| **Trainer applications** | Custom `<table>` | Approve, Reject (if submitted/under_review) | Raw `<button>`: emerald Approve, rose Reject. No View/Edit in row; row click → detail page. |

### Parent dashboard

| Page | Table component | Row actions | Action UI |
|------|-----------------|-------------|-----------|
| **Bookings** | DataTable | View sessions (Eye) | Raw `<button>`: `border-slate-200`, `text-slate-700`, icon only. Single slate button. |
| **Children** | — | — | No table; card/list layout with modals. |

### Trainer dashboard

| Page | Table component | Row actions | Action UI |
|------|-----------------|-------------|-----------|
| **Main (schedule)** | — | — | Schedule/timesheet UI; no list table. |
| **Bookings list** | — | — | Uses schedule/calendar context; no DataTable list. |

---

## 2. Actions column — UI summary

- **Shared `Button` (bordered/destructive):** Admin Children, Trainers, Public Pages. Bordered = primary (blue); "destructive" is not implemented on `Button`, so Delete looks primary too → "all same colour" on those tables.
- **Raw `<button>` with slate + rose:** Admin Packages, Services, Parents, Users, Activities, Parent Bookings, Admin Bookings. Consistent idea: neutral (slate) for View/Edit, red (rose) for Delete, emerald for Approve where applicable.
- **Inconsistencies:** Icon-only vs text vs mixed; some use `Button`, some raw buttons; Delete is red only where raw rose classes are used; font size varies (`text-[11px]`, `text-2xs`, `text-xs`).

---

## 3. Filter style and behaviour — per table

### 3.1 DataTable with `renderFilters` (filters inside table toolbar, same row as search)

| Page | When filters show | Filter controls | Clear action | Notes |
|------|-------------------|-----------------|-------------|--------|
| **Packages** | Always (inline) | Age group, Difficulty, Status (selects). Labels: `text-2xs font-medium text-slate-600`. | "Clear filters" link, `text-indigo-600 hover:underline` | Selects: `h-7`, `rounded-md`, `border-slate-200`. |
| **Services** | Always (inline) | Category, Status (selects). Same label/style as Packages. | "Clear filters" link, indigo | Same pattern as Packages. |
| **Public Pages** | Only when `showFilters` | Page type, Status (selects). Labels: `text-2xs font-medium text-slate-600`. | None in renderFilters | Toggle lives in page header ("Show/Hide Filters"); DataTable also has searchable. |

**Children:** Uses DataTable but **no** `renderFilters` — search only.

**Trainers:** Uses DataTable but **no** `renderFilters` — filters are in a separate block above the table.

### 3.2 Collapsible filter panel above the table (custom layout)

| Page | Toggle button | Panel style | Filter controls | Clear action |
|------|---------------|------------|-----------------|--------------|
| **Bookings** | "⚙ Filters" / "✕ Hide Filters" (raw button, border-slate) | `rounded-lg border border-slate-200 bg-slate-50 p-4`. Heading: "Advanced Filters", `text-xs font-semibold uppercase`. | Grid `sm:grid-cols-3 lg:grid-cols-4`: Booking status, Payment status. Labels: `text-xs font-medium`. Selects: `h-9 w-full`. | "Clear Filters" bordered button, full width in flex. |
| **Trainers** | "✕ Hide Filters" / "⚙ Filters" + Export + Create Trainer | Same panel style and "Advanced Filters" heading. Grid: `sm:grid-cols-2 lg:grid-cols-4`. | Active Status, Certifications. Same label/select style as Bookings. | "Clear Filters" bordered button, `col-span-1 ... sm:col-span-2 lg:col-span-1`. |
| **Parents** | Button with `<Filter size={14} />` + "Filters" | Collapsible block; structure similar. | Approval status (select). | "Clear filters" (lowercase) link/button. |
| **Users** | Same as Parents (Filter icon + "Filters") | Same pattern. | Role, Approval status (selects). | "Clear filters" (lowercase). |
| **Activities** | "Show" / "Hide" filters (with Filter icon) | Same collapsible idea. | Category, Status (selects). | "Clear filters" (lowercase). |
| **Public Pages** | "Show" / "Hide" Filters in header (Filter icon) | Panel: `rounded-lg border border-slate-200 bg-slate-50 p-3`, grid `sm:grid-cols-3`. | Search (input), Page type, Status. | None in panel. |

### 3.3 Search placement and style

| Page | Where search lives | Style |
|------|--------------------|--------|
| **DataTable (Packages, Services, Children, Trainers, Public Pages)** | Inside DataTable: left of renderFilters, same row. | Shared: Search icon, `border-slate-200 bg-slate-50`, `h-6` input, clear (X) when non-empty. |
| **Bookings** | In custom header/toolbar (URL-driven). | Not in same component as DataTable; part of custom layout. |
| **Trainers** | Custom input **above** DataTable (not inside DataTable). | `type="search"`, `h-9`, `max-w-md`, `rounded-md border border-slate-200`. |
| **Parents, Users, Activities** | Custom input in header row. | `type="search"`, similar border/rounded. |
| **Public Pages** | (1) In collapsible header panel when showFilters; (2) DataTable searchable. | Two search surfaces when filters shown. |

### 3.4 Filter behaviour differences

- **State:** Bookings (and some others) sync filters to URL; Packages, Services, Children, Trainers use local state (no URL).
- **Toggle label:** "Filters" vs "Show filters" / "Hide filters" vs "⚙ Filters" / "✕ Hide Filters" vs "Show/Hide Filters".
- **Panel heading:** "Advanced Filters" (Bookings, Trainers) vs no heading (Parents, Users, Activities) vs none in DataTable bar.
- **Clear copy:** "Clear filters" vs "Clear Filters" (capital F).
- **Clear control:** Link (`text-indigo-600`) vs bordered button.
- **Select height:** `h-7` (DataTable bar) vs `h-9` (collapsible panels).
- **FilterBar:** No shared `FilterBar` component; each page builds its own filter UI.

---

## 4. Summary: Why actions and filters look different

- **Actions:** Mix of shared `Button` (with no real destructive variant) and raw `<button>` with ad hoc slate/rose/emerald classes; icon-only vs text vs mixed; different font sizes.
- **Filters:** Mix of (1) DataTable `renderFilters` (inline, always or when toggle), (2) custom collapsible panels above the table, and (3) Public Pages having both header filters and DataTable search/filters. No shared FilterBar; toggle labels, panel title, clear button style, and search placement differ.

To make everything consistent:

1. **Actions:** Use one pattern (e.g. shared Button with a real `destructive` variant) and icon-only row actions per DASHBOARD_RULES; remove raw button duplication.
2. **Filters:** Introduce a shared FilterBar (or standardise on DataTable `renderFilters` vs one collapsible pattern), same toggle label, same clear button style, same search placement (e.g. always in DataTable or always in one panel), and optionally URL-backed filter state where needed.

---

## 5. Search placement rule (enforced)

- **Search lives only in the DataTable toolbar.** Never put a search input in the FilterBar or in a collapsible filter panel.
- **One search per page.** Never have two search surfaces (e.g. Admin Public Pages had search in both the filter panel and DataTable — fixed by removing search from the filter panel).
- DataTable props `searchable`, `searchQuery`, `onSearchQueryChange`, `searchPlaceholder` are the single source for table search.
