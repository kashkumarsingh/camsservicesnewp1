# Public Pages: CMS-Driven Content (Admin Only, No Seeders)

## Summary

Public pages (home, about, policies) are **driven only by the admin**. There is **no seeder data** for pages. All content is created and edited in **Dashboard → Admin → Public Pages**. The public site reads from the API; whatever you add or change in that admin section is what appears on the live site.

- **Source of truth**: **Admin → Public Pages** (create and edit pages there).
- **Public site**: Uses `GET /api/v1/pages/{slug}` when `NEXT_PUBLIC_PAGE_REPOSITORY=api` (default). If no page exists for a slug, the API returns 404 and the frontend may show a fallback or 404.

## How to Manage Public Content

1. **Create pages in the admin**  
   **Dashboard** → **Admin** → **Public Pages** → **Create page**. Add pages for:
   - **Home**: type `home`, slug `home` (content can be empty; home uses optional `sections`).
   - **About**: type `about`, slug `about` (use the About fields: mission, core values, safeguarding).
   - **Policies**: type and slug e.g. `privacy-policy`, `terms-of-service`, `cancellation-policy`, `cookie-policy`, `payment-refund-policy`, `safeguarding-policy`.

2. **Edit content**  
   Open any page in **Public Pages** and change title, summary, content, and for About: mission, core values, safeguarding. For Home, the backend supports `sections` (hero, CTA, etc.) for when the admin UI supports editing them.

3. **Revalidation**  
   When a page is saved or deleted, the backend flushes cache and can trigger Next.js revalidation (when `NEXT_REVALIDATE_URL` and `NEXT_REVALIDATE_SECRET` are set).

## Flow

```
Admin (Dashboard → Public Pages)  →  Backend API (store/update)  →  pages table
                                                                         ↓
Public site (/, /about, /policies/…)  ←  GET /api/v1/pages/{slug}  ←  PageController
```

**No seeders.** All public page content comes from what you create and edit in the admin Public Pages section.
