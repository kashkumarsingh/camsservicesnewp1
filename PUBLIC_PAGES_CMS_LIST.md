# Public Pages — CMS-Managed List and Seeder

## Summary

All public-facing content editable from **Admin → Public Pages** is stored in the `pages` table. A **static seeder** (`PublicPagesSeeder`) fills these with CAMS-relevant content so the site is usable before admins edit content. Later, data is managed via the admin public pages dashboard.

---

## Public pages list (CMS data source)

| # | Route | Slug | Type | Seeder content |
|---|--------|------|------|----------------|
| 1 | `/` (home) | `home` | `home` | Hero, How it works, Services/Packages highlights, Impact stats, Testimonials, Blog, CTA |
| 2 | `/about` | `about` | `about` | Title, summary, content, mission, core values, safeguarding |
| 3 | `/policies` | — | — | List only (no single page) |
| 4 | `/policies/privacy-policy` | `privacy-policy` | `privacy-policy` | CAMS privacy policy |
| 5 | `/policies/terms-of-service` | `terms-of-service` | `terms-of-service` | CAMS terms of service |
| 6 | `/policies/cancellation-policy` | `cancellation-policy` | `cancellation-policy` | CAMS cancellation policy |
| 7 | `/policies/cookie-policy` | `cookie-policy` | `cookie-policy` | CAMS cookie policy |
| 8 | `/policies/payment-refund-policy` | `payment-refund-policy` | `payment-refund-policy` | CAMS payment & refund policy |
| 9 | `/policies/safeguarding-policy` | `safeguarding-policy` | `safeguarding-policy` | CAMS safeguarding policy |
| 10 | `/page/[slug]` | (any) | `other` | Optional; generic page builder (blocks) |

**Policy page types** (must match `ListPoliciesUseCase`):  
`privacy-policy`, `terms-of-service`, `cancellation-policy`, `cookie-policy`, `payment-refund-policy`, `safeguarding-policy`.

---

## Static seeder

- **Class:** `Database\Seeders\PublicPagesSeeder`
- **File:** `backend/database/seeders/PublicPagesSeeder.php`
- **Run:** `cd backend && php artisan db:seed --class=PublicPagesSeeder`
- **Idempotent:** Uses `Page::updateOrCreate(['slug' => $slug], $attrs)` so re-running is safe.

### Seeder contents (CAMS-relevant)

1. **Home** — Sections: hero, how_it_works, services_highlight, packages_highlight, impact_stats, testimonials, blog, cta. All copy references CAMS, SEN, trauma-informed care, DBS-checked staff.
2. **About** — Title, summary, rich-text content; mission (title, description); core_values (section title/subtitle + 3 values); safeguarding (title, subtitle, description, badges).
3. **Policy pages (6)** — Each: title, slug, type, summary, content (Markdown), published, effective_date, version. Content aligned with `frontend/src/data/pagesData.ts`.

---

## Data flow

- **Read:** Public pages fetch via `GetPageUseCase(pageRepository)` → API `GET /api/v1/pages/{slug}`.
- **Write (later):** Admin dashboard → `AdminPublicPagesController` → `Page` model; observers trigger revalidation.

---

## Related files

- Backend: `app/Models/Page.php`, `app/Http/Controllers/Api/PageController.php`, `app/Actions/Pages/GetPageAction.php`
- Frontend: `frontend/src/data/pagesData.ts` (static fallback), `frontend/src/app/(public)/constants/aboutPageConstants.ts`
- Stub (reference): `scripts/home-page-seeder.stub.php`
