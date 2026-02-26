# Page Builder for Public Pages — Phase Plan

**Purpose:** Allow public pages to be composed from reusable, CMS-managed blocks (Hero, Features, Testimonials, FAQ, CTA, Rich Text, etc.) with configurable order and visibility, instead of fixed per-page schemas.

**Alignment:** Builds on existing public CMS pages flow (`.cursor/rules/public-cms-pages.mdc`), ISR, `buildPublicMetadata()`, cache tags, and shared section components. Section order becomes CMS-driven as that rule already requires.

---

## Phase 1 — Foundation (Block Model & API)

**Goal:** Define the block taxonomy, storage shape, and a single API contract so the frontend can render an ordered list of blocks.

### 1.1 Domain & Backend

| Step | Deliverable | Notes |
|------|-------------|--------|
| 1 | **Block type registry (constants)** | Backend and frontend share the same block type slugs: `hero`, `features`, `testimonials`, `faq`, `cta`, `rich_text`, `stats`, `team`, etc. No magic strings. |
| 2 | **Migration: page structure** | Either (A) add `blocks` JSON column to existing `pages` table (array of `{ type, payload }`) or (B) new `page_blocks` table: `page_id`, `sort_order`, `type`, `payload` (JSON). Prefer (B) if you need per-block versioning or future reuse. |
| 3 | **Model & API** | Page model with blocks relationship or accessor; API returns `page: { slug, title, metaDescription, ... }, blocks: [{ type, payload }, ...]` in **camelCase**. |
| 4 | **Observer & cache tags** | Saving a page (or any block) dispatches existing page cache tags (e.g. `pages`, `page:{slug}`). No new tags required if pages already revalidate. |
| 5 | **Single endpoint** | e.g. `GET /api/pages/by-slug/{slug}` returns page + ordered blocks. Frontend continues to use `IPageRepository` / `GetPageContent` pattern. |

### 1.2 Frontend

| Step | Deliverable | Notes |
|------|-------------|--------|
| 1 | **Block type constants** | Mirror backend block types in `frontend/src/utils/` or `core/domain/pages` (single source; no hardcoded type strings in components). |
| 2 | **DTOs** | `PageWithBlocksDTO` or extend existing Page DTO with `blocks: Array<{ type: string; payload: Record<string, unknown> }>`. Typed payloads per block type can follow in Phase 2. |
| 3 | **Repository** | `IPageRepository.findBySlug` (or dedicated use case) returns page + blocks. Use `extractList` only if a list endpoint is added; single-resource response stays as-is. |
| 4 | **Revalidation** | Same `revalidate` + `tags` as current public page fetch; no change if endpoint is the same. |

### 1.3 Exit criteria (Phase 1)

- [x] Backend returns ordered blocks for a page by slug.
- [x] Frontend can fetch and type the response (blocks array).
- [ ] No UI changes yet; optional: single test page (e.g. `/page-builder-demo`) that renders raw block list for validation.

**Phase 1 implementation (done):** Backend: `config/page_blocks.php`, `PageBlock` model, `page_blocks` migration (see `MIGRATION_create_page_blocks.php`), `Page::blocks()`, `PageBlockObserver`, `GetPageAction` eager-loads blocks, `PageController::formatPageResponse` includes `blocks`. Frontend: `pageBuilderConstants.ts`, `PageBlockDTO` + `PageDTO.blocks`, `Page` entity `blocks` getter, `ApiPageRepository` and `RemotePageResponse` include blocks. **Run migration (Docker):** copy `MIGRATION_create_page_blocks.php` to `backend/database/migrations/` as `2026_02_26_071736_create_page_blocks_table.php`, then `docker compose exec backend php artisan migrate`.

---

## Phase 2 — Block Renderer (Frontend)

**Goal:** Map each block type to a React section component and render the page from the blocks array.

### 2.1 Block → Component mapping

| Step | Deliverable | Notes |
|------|-------------|--------|
| 1 | **Block registry (frontend)** | One module (e.g. `frontend/src/components/public-page-blocks/blockRegistry.ts`) that maps `blockType → Component`. Use existing shared components where they exist (`PageHero`, `RichTextBlock`, etc.). |
| 2 | **Section components** | Each section accepts `payload` (typed per block type). Ensure they already follow “data as props, no self-fetch” and handle null/empty (see public-cms-pages.mdc). |
| 3 | **PageBlocksRenderer** | Single component: `blocks: BlockDTO[]` → map over blocks, look up component by `block.type`, render `<BlockComponent payload={block.payload} />`. Unknown types: log and skip or render a small “Unsupported block” placeholder. |
| 4 | **Integration** | One dynamic route (e.g. `(public)/page/[slug]/page.tsx`) that fetches page + blocks, uses `buildPublicMetadata()`, and renders `<PageBlocksRenderer blocks={page.blocks} />` plus optional layout (header/footer). |

### 2.2 Typing & safety

| Step | Deliverable | Notes |
|------|-------------|--------|
| 1 | **Payload types** | Define interfaces per block type (e.g. `HeroBlockPayload`, `FaqBlockPayload`) and use a discriminated union or `BlockMap[type]` so `payload` is typed in the registry. |
| 2 | **Validation** | Optional: runtime check (e.g. Zod) for payload shape in dev; production can assume backend sends valid payloads if dashboard is the only writer. |

### 2.3 Exit criteria (Phase 2)

- [ ] Slug-based public route renders full page from blocks.
- [ ] All current block types have a corresponding component and handle empty/null.
- [ ] `generateMetadata` uses `buildPublicMetadata()`; fetch uses `revalidate` + cache tags; images use Next.js `Image` and allowed `remotePatterns`.

---

## Phase 3 — Dashboard: Edit Blocks (CMS Admin)

**Goal:** Admins can edit which blocks a page has and the content of each block, with preview.

### 3.1 Backend (Dashboard)

| Step | Deliverable | Notes |
|------|-------------|--------|
| 1 | **CRUD for blocks** | If using `page_blocks` table: API or Filament/Nova resources to create/update/delete/reorder blocks. Reorder = update `sort_order` for affected rows. |
| 2 | **Validation** | Validate `type` against allowed list; validate `payload` per type (e.g. Filament form schema or Laravel request rules) so invalid payloads are rejected. |
| 3 | **Draft vs published** | If you need draft mode, add `published_at` or `is_published` and ensure public API only returns published blocks; dashboard shows draft. |

### 3.2 Dashboard UI

| Step | Deliverable | Notes |
|------|-------------|--------|
| 1 | **Page edit screen** | List of blocks for the page with drag-and-drop reorder (or up/down). Add block = choose type from allowed list, then open block editor. |
| 2 | **Block editor** | Form per block type (Hero: title, subtitle, image, CTA; FAQ: items array; etc.). Use shared rich text and image upload components. Modal or inline expand. |
| 3 | **Preview** | “Preview” opens public page URL (e.g. with `?preview=1` and auth) or opens in new tab; same section components as frontend (no duplicate “preview” components). |
| 4 | **Save & revalidate** | On save, existing Observer dispatches revalidation; no extra frontend call from dashboard. |

### 3.3 Exit criteria (Phase 3)

- [ ] Admin can add, remove, reorder, and edit block content for a page.
- [ ] Saving triggers revalidation; public page updates after revalidate.
- [ ] No temporary workarounds; production-ready validation and error handling.

---

## Phase 4 — Migration of Existing Pages (Optional / Incremental)

**Goal:** Move existing fixed-schema pages (Home, About, etc.) to the block model without breaking the live site.

### 4.1 Strategy

| Step | Deliverable | Notes |
|------|-------------|--------|
| 1 | **One page at a time** | Same as public-cms-pages workflow: read page → map sections to blocks → seed blocks with current content → switch route to block renderer → remove old hardcoded page. |
| 2 | **Seeder** | For each migrated page, seed `page_blocks` (or `pages.blocks` JSON) from current CMS or hardcoded content so the first deploy shows correct content. |
| 3 | **Route strategy** | Either (A) all “flexible” pages go through `(public)/page/[slug]` and existing routes redirect, or (B) keep existing routes but have them fetch page + blocks and use `PageBlocksRenderer`. Prefer (B) for minimal URL churn. |

### 4.2 Exit criteria (Phase 4)

- [ ] At least one existing public page (e.g. Home or About) is driven by the page builder.
- [ ] SEO and metadata unchanged; all five public-page checklist items still met.

---

## Phase 5 — Extensibility & Polish (Optional)

**Goal:** Add new block types without touching core renderer; optional UX improvements.

| Step | Deliverable | Notes |
|------|-------------|--------|
| 1 | **New block types** | Register new type in backend allowlist and frontend block registry; add section component and payload type. No change to `PageBlocksRenderer` logic. |
| 2 | **Visibility / scheduling** | Optional: per-block “visible from/until” or “hide on mobile” stored in payload or block meta; renderer filters before render. |
| 3 | **Analytics placeholders** | Optional: block-level data attributes or IDs for tracking (e.g. `data-block-type`, `data-block-id`) without changing block API. |

---

## Dependencies Between Phases

```
Phase 1 (Foundation)  →  Phase 2 (Renderer)  →  Phase 3 (Dashboard)  →  Phase 4 (Migration)  →  Phase 5 (Polish)
```

- Phase 2 depends on Phase 1 (API contract and blocks in response).
- Phase 3 depends on Phase 2 (so preview matches public renderer).
- Phase 4 can start after Phase 3 for at least one page.
- Phase 5 can run in parallel once the registry pattern is stable.

---

## Rules to Respect (from .cursorrules & public-cms-pages)

- **API response:** camelCase only; no snake_case on frontend.
- **No hardcoded values:** Block types and route paths in constants/config.
- **No temporary workarounds:** Every step production-ready.
- **Single source of truth:** Block type list and payload shapes defined once; backend and frontend stay in sync (e.g. shared docs or codegen later).
- **Public page checklist:** For any page using the builder: `buildPublicMetadata()`, `revalidate` + tags, Observer, Observer registered, `remotePatterns` for images.
- **One page at a time** when migrating; seeder before removing hardcoded content.

---

## Suggested File Locations (High Level)

| Layer | Location |
|-------|----------|
| Block type constants (backend) | `backend/app/Enums/PageBlockType.php` or config |
| Block type constants (frontend) | `frontend/src/utils/pageBuilderConstants.ts` or `core/domain/pages` |
| Block registry (frontend) | `frontend/src/components/public-page-blocks/blockRegistry.ts` |
| PageBlocksRenderer | `frontend/src/components/public-page-blocks/PageBlocksRenderer.tsx` |
| Block section components | `frontend/src/components/public-page-blocks/sections/` or reuse `shared/public-page` |
| Dynamic page route | `frontend/src/app/(public)/page/[slug]/page.tsx` (or under existing structure) |
| API endpoint | Centralised in `apiEndpoints.ts`; e.g. `API_ENDPOINTS.PAGE_BY_SLUG(slug)` |

---

## Summary

| Phase | Focus | Outcome |
|-------|--------|--------|
| 1 | Foundation | Backend stores and returns ordered blocks; frontend has DTOs and repo contract. |
| 2 | Renderer | Frontend maps block types to components; one slug route renders full page from blocks. |
| 3 | Dashboard | Admin can add/edit/reorder blocks and preview; save revalidates. |
| 4 | Migration | Existing pages moved to block model one-by-one with seeders. |
| 5 | Polish | New block types and optional visibility/analytics. |

This plan keeps the existing public CMS flow (ISR, cache tags, shared components, buildPublicMetadata) and adds a block-based composition layer so section order and content are fully CMS-driven without hardcoded page layouts.
