## Editor Role & Content Management - Implementation Summary

### Files Modified/Created (In Order)

1. **File:** `backend/database/migrations/2026_02_11_150000_add_editor_role_to_users.php`
   - Layer: Database
   - Order: 1
   - Purpose: Extend `users.role` to support a new `editor` role for both MySQL and PostgreSQL (CHECK constraint update).

2. **File:** `backend/app/Http/Middleware/EnsureUserCanManageContent.php`
   - Layer: Interface (HTTP Middleware)
   - Order: 2
   - Purpose: Allow `admin`, `super_admin` and `editor` to access content-management APIs (public pages, later blog/SEO).

3. **File:** `backend/bootstrap/app.php`
   - Layer: Infrastructure (Bootstrap)
   - Order: 3
   - Purpose: Register new `content-admin` middleware alias.

4. **File:** `backend/routes/api.php`
   - Layer: Interface (Routing)
   - Order: 4
   - Purpose: Move `admin/public-pages` endpoints under `content-admin` middleware so editors can manage content without full admin rights.

5. **File:** `backend/app/Http/Controllers/Api/AdminUserController.php`
   - Layer: Interface (API Adapter)
   - Order: 5
   - Purpose: Extend validation rules to accept `editor` as a valid user role.

6. **File:** `frontend/src/core/application/admin/dto/AdminUserDTO.ts`
   - Layer: Application
   - Order: 8
   - Purpose: Extend admin DTO role union to include `editor`.

9. **File:** `frontend/src/core/application/auth/types.ts`
   - Layer: Application
   - Order: 9
   - Purpose: Extend global `User.role` union to include `editor`.

10. **File:** `frontend/src/utils/navigation.ts`
    - Layer: Infrastructure/Utils
    - Order: 10
    - Purpose: Route `editor` users to `/dashboard/editor`, define role hierarchy, and allow editors to access `/dashboard/admin/public-pages`.

11. **File:** `frontend/src/components/dashboard/layout/DashboardShell.tsx`
    - Layer: Presentation (Layout)
    - Order: 11
    - Purpose: Add an Editor sidebar section and correctly map the `editor` role to that section.

12. **File:** `frontend/src/app/dashboard/editor/page.tsx`
    - Layer: Presentation (Route)
    - Order: 12
    - Purpose: Editor dashboard route entry point.

13. **File:** `frontend/src/app/dashboard/editor/EditorDashboardPageClient.tsx`
    - Layer: Presentation (Client Page)
    - Order: 13
    - Purpose: Provide an editor-focused overview with a primary CTA into the public pages editor.

14. **File:** `frontend/src/app/dashboard/admin/users/AdminUsersPageClient.tsx`
    - Layer: Presentation (Admin Screen)
    - Order: 14
    - Purpose: Expose `Editor` as a selectable role and filter option in the admin Users feature.

### Plain English Explanation

We have introduced a new **`editor`** user role that can manage website content (public pages today, blog/SEO later) without gaining full admin access to operational data such as bookings, children or trainers.

On the **backend**, the `users.role` column is now allowed to store `editor` alongside the existing roles. A new middleware, `EnsureUserCanManageContent`, checks that the authenticated user is an `admin`, `super_admin` or `editor` before allowing access to content-management endpoints. The public pages admin endpoints (`/api/v1/admin/public-pages*`) are now protected by this new middleware instead of the generic `admin` middleware, so content editors can work safely without touching other admin APIs. Validation has been updated so that the API and admin dashboard can create and manage editor accounts cleanly.

On the **frontend**, the global `User` type and `AdminUserDTO` have been extended to include the `editor` role. Navigation utilities now route editors to a new `/dashboard/editor` area and treat them as a distinct role in the hierarchy, while still allowing admins and super_admins to access editor-only screens. The universal `DashboardShell` renders a dedicated Editor section in the sidebar, and a new `EditorDashboardPageClient` provides a focused landing page with a primary CTA into the **Public pages** editor. The Admin Users screen has been updated so that admins can assign and filter by the `Editor` role directly in the UI.

### Summary of Changes

- **Database**
  - Added migration to extend `users.role` to include `editor` (MySQL enum + PostgreSQL CHECK constraint).

- **Backend**
  - New `content-admin` middleware that recognises `admin`, `super_admin` and `editor`.
  - Public pages admin endpoints moved to this middleware, preserving paths while widening access safely.
  - Admin user controller validation updated to accept `editor` as a role.
  - Admin Users screen (Next.js) exposes the editor role for assignment and filtering.

- **Frontend**
  - `User` and `AdminUserDTO` role unions extended with `editor`.
  - Navigation logic updated:
    - Editors default to `/dashboard/editor`.
    - Editors (and above) can access `/dashboard/admin/public-pages`.
  - Sidebar layout updated to include an Editor section.
  - New editor dashboard route + client component created with a clear path into the public pages editor.
  - Admin Users page now supports `Editor` in both filters and role selection.

### Clean Architecture Compliance

- **Separation of concerns**
  - The new editor capability is expressed as:
    - A domain concept (`role = 'editor'` on `User`).
    - Interface-layer policies (`EnsureUserCanManageContent` middleware).
    - Presentation changes (editor dashboard, navigation).
  - No business rules are duplicated in the frontend; role-based access remains centralised in navigation utilities and backend middleware.

- **Dependency direction**
  - Application and domain types (`User`, `AdminUserDTO`) are extended, and the presentation layer depends on these types for branching, not the other way round.
  - Middleware and routing changes sit strictly in the interface layer and call into existing controllers.

- **Extensibility**
  - Additional content features (blog CMS, SEO metadata, FAQs) can be wired into the same `content-admin` middleware and Editor dashboard without touching core booking or user flows.

### Next Steps

1. **Content Scope Expansion**
   - Add blog and SEO management endpoints under the `content-admin` middleware and surface them from the Editor dashboard.

2. **Fine-grained Permissions**
   - If needed, refine content permissions further (e.g. page-type-specific capabilities) using policies or Spatie roles/permissions.

3. **QA & UAT**
   - Test that:
     - Editors can log in, land on `/dashboard/editor`, and fully manage public pages.
     - Editors cannot access `/dashboard/admin` booking/users/children/trainers screens.
     - Existing admins and super_admins continue to have full access, including content management.

