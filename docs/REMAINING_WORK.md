# Remaining Work — Prioritised Roadmap

Enforcement is already multi-layer: ESLint, TypeScript, prebuild (segment config), and Cursor rules. This document is the single checklist for what's left, in priority order.

---

## Priority 1 — Functional

- **Done: URL-based filter/sort for admin bookings table**  
  Filters, sort, and search are in the URL (query params). Backend supports `sort_by` (created_at, reference, updated_at) and `order` (asc, desc). Shareable/bookmarkable; back/forward sync.

- **Done: Slug pages ISR (blog, services, packages, trainers, faq)**  
  List and `[slug]` pages use literal `revalidate = 1800`; `generateMetadata` uses env base URL (no `headers()`) so ISR applies. Blog repository already had cache tags.

---

## Priority 2 — Cleanup

- **Done (partial): ROUTES adoption**  
  Added `ROUTES.ABOUT`, `ROUTES.SERVICES`, `ROUTES.BLOG`, `ROUTES.CONTACT_THANK_YOU`, `ROUTES.BOOK_RETRIEVE`, `ROUTES.DASHBOARD_PARENT_SCHEDULE`, `ROUTES.DASHBOARD_ADMIN_SETTINGS`. Applied in `getSiteSettings` fallback nav/footer and `DashboardShell` (sidebar, account, settings links). Remaining hardcoded hrefs in other components can be migrated incrementally.

- **Done: appConstants.ts for date formats, currency, pagination**  
  Created `frontend/src/utils/appConstants.ts` with `DATE_LOCALE`, `DATE_FORMAT_SHORT`, `DATE_FORMAT_DATETIME`, `DATE_FORMAT_LONG`, `CURRENCY_CODE`, `CURRENCY_SYMBOL`, `DEFAULT_PAGE_SIZE`, `MAX_PAGE_SIZE`. Components can import and use instead of inline magic numbers.

- **globals.css hex cleanup**  
  Remove remaining hex colours in `frontend/src/app/globals.css` in favour of Tailwind/theme tokens. See `.cursor/rules/hex-cleanup.mdc`.

- **About page CMS migration**  
  Next step in the public CMS sequence (per `public-cms-pages.mdc`). The About page already uses the API + static fallback and `buildPublicMetadata()`. The **full** migration (schema, seeder, observer, dashboard admin, etc.) is a separate, page-by-page workflow: read page → map sections to fields → backend (migration, model, seeder, observer, API) → frontend (cache tags, repository, page, metadata) → dashboard editor. Seed before removing hardcoded content.

---

## Priority 3 — Nice to have

- **Shared FilterBar, Pagination, SearchInput components**  
  Reusable dashboard components used across admin (and optionally other) tables. Single implementation; no per-page duplicates.

- **Bulk actions pattern**  
  Consistent pattern for "select N items → apply action" (e.g. bulk status change, export). Define in one place and reuse.

- **Inline editing pattern**  
  Consistent pattern for editing a row or field in place (e.g. in tables) with save/cancel and validation. Document and reuse.

---

## How to use this doc

- **Cursor:** When starting a task, check this list for scope and priority; prefer P1 → P2 → P3.
- **PRs / planning:** Use as the canonical "what's left" checklist; tick off items as they land.
- **Cross-links:** Segment config → `.cursor/rules/nextjs-segment-config.mdc`. CMS migration → `.cursor/rules/public-cms-pages.mdc`. Dashboard tables → `DASHBOARD_RULES.md`, `.cursor/rules/dashboard-standards.mdc`. Hex → `.cursor/rules/hex-cleanup.mdc`. Constants → `.cursor/rules/constants-ownership.mdc`.
