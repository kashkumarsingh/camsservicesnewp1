## Admin Public Pages Bridge - Implementation Summary

### Files Modified/Created (In Order)
1. **File:** `frontend/src/components/dashboard/layout/DashboardShell.tsx`
 - Layer: Presentation (Dashboard Shell)
 - Order: 1
 - Purpose: Adds a new `Public pages` navigation item under the admin sidebar pointing to `/dashboard/admin/public-pages`.

2. **File:** `frontend/src/app/dashboard/admin/public-pages/AdminPublicPagesPageClient.tsx`
 - Layer: Presentation (Next.js Client Component)
 - Order: 2
 - Purpose: Renders the admin-facing bridge screen that explains how public pages are managed and provides a clearly-labelled button to open the page editor (or backend URL) in a new tab.

3. **File:** `frontend/src/app/dashboard/admin/public-pages/page.tsx`
 - Layer: Presentation (Next.js Server Component)
 - Order: 3
 - Purpose: Provides route metadata and delegates page rendering to `AdminPublicPagesPageClient`, matching the existing admin dashboard pattern.

### Plain English Explanation
Admins now see a dedicated **Public pages** item in the left-hand admin sidebar.  
When they click it, they land on a focused screen inside the Next.js admin dashboard that:
- Explains that all public-facing content (home, about, policies, etc.) is managed via the CMS (admin API / future Next.js editor).
- Offers a primary action button that opens the page editor or backend admin URL in a new tab, using the configured backend base URL.
This keeps the role-based admin dashboard as the operational hub and gives content editors a clear route to manage public pages.

### Summary of Changes
- **Frontend (Dashboard Shell):**
  - Extended the admin role section in `DashboardShell` so the sidebar includes a **Public pages** item (`/dashboard/admin/public-pages`) alongside Bookings, Users, Trainers, Reports and Settings.
- **Frontend (Admin Public Pages Screen):**
  - Added `AdminPublicPagesPageClient` which:
    - Resolves the backend base URL from `NEXT_PUBLIC_API_URL` (stripping `/api/v1`) with environment-aware fallbacks (localhost and Render).
    - Constructs the page editor URL from the backend base URL (e.g. for a future or external page editor).
    - Presents clear copy about what content lives in the CMS and when to use it.
    - Provides a prominent “Open public pages editor” button that opens the editor in a new tab to avoid losing dashboard context.
    - Includes a compact “How this works” explainer to reinforce that the CMS owns public content, while the dashboard remains independent.
- **Frontend (Routing):**
  - Added `app/dashboard/admin/public-pages/page.tsx` as a small server component that sets page metadata and renders the client component, mirroring other admin pages for consistency.

### Clean Architecture Compliance
- **Dependency Direction:**
  - The new admin screen lives purely in the Presentation layer and does not introduce any new data dependencies on the backend; it only constructs a URL for the page editor.
  - The dashboard shell remains an app-owned layout under `/dashboard/*`; the new link routes to this bridge page which can open the editor in a separate tab.
- **Separation of Concerns:**
  - Operational admin features (bookings, users, trainers, reports) remain within the Next.js dashboard UI.
  - CMS responsibilities (editing static and marketing content) are handled via the admin API or a dedicated Next.js editor; this screen acts as a shallow adapter/entry point.
  - No API endpoints, domain entities or repositories were changed; this is strictly navigation and UX glue.

### Next Steps
- Consider a shortcut for **Site settings** if admins frequently need to adjust header/footer, contact and branding (via admin API or future UI).
- If/when an admin-native CMS UI is built in Next.js, this bridge page can host those screens or link to them.
- Optionally surface a read-only list of key pages (e.g. home, about, policies) with last-updated timestamps via the read-only admin public-pages API.

