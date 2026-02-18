## Admin Trainer Media Uploads - Implementation Summary

### Files Modified/Created (In Order)
1. **File:** `backend/app/Http/Controllers/Api/AdminTrainerController.php`
 - Layer: Interface (API Adapter)
 - Order: 1
 - Purpose: Add admin endpoints for trainer image upload, qualification upload, and deletion; include `fullDescription` in list responses.

2. **File:** `backend/routes/api.php`
 - Layer: Interface (Routing)
 - Order: 2
 - Purpose: Wire new admin trainer media routes under the authenticated admin group.

3. **File:** `frontend/src/infrastructure/http/apiEndpoints.ts`
 - Layer: Infrastructure (HTTP)
 - Order: 3
 - Purpose: Expose strongly-typed admin trainer media endpoints for the frontend.

4. **File:** `frontend/src/core/application/admin/dto/AdminTrainerDTO.ts`
 - Layer: Application (DTOs)
 - Order: 4
 - Purpose: Normalise admin trainer certifications to the shared `TrainerCertification` shape and handle legacy string arrays.

5. **File:** `frontend/src/interfaces/web/hooks/admin/useAdminTrainers.ts`
 - Layer: Interface (Web Hooks)
 - Order: 5
 - Purpose: Provide admin helpers to upload trainer images, upload qualifications, and delete qualifications with optimistic state updates.

6. **File:** `frontend/src/app/dashboard/admin/trainers/TrainerForm.tsx`
 - Layer: Presentation (Admin Dashboard)
 - Order: 6
 - Purpose: Add UI for uploading trainer photos and certification documents, and surface existing uploaded certifications.

7. **File:** `frontend/src/app/dashboard/admin/trainers/AdminTrainersPageClient.tsx`
 - Layer: Presentation (Admin Dashboard)
 - Order: 7
 - Purpose: Wire the trainer form to new media upload hooks and improve certification rendering and view/edit flows.

### Plain English Explanation
Admin users can now manage trainer photos and certification documents directly from the admin dashboard, without asking trainers to paste image URLs or type free‑text certificates.

On the backend, new admin endpoints allow an authenticated admin to upload a trainer’s profile image and upload/delete qualification documents (PDF or image). These endpoints store files on the public disk, update the trainer record, and return a normalised certification structure consistent with the trainer self‑service profile API.

On the frontend, the admin trainer management hook exposes simple methods for uploading images and qualifications. The admin trainer form now shows an optional “upload photo” control (in Edit mode) and a dedicated “Certification documents (upload)” section where admins can attach documents with name/year/issuer metadata and see a list of existing certificates with links to view and actions to remove. Certifications are now treated as structured objects everywhere in the admin layer, with legacy string arrays mapped into this new format.

### Summary of Changes
**Backend**
- Extended `AdminTrainerController@index` to include `fullDescription` in list payloads.
- Added `uploadImage`, `uploadQualification`, and `deleteQualification` methods on `AdminTrainerController`, mirroring validation and storage rules from `TrainerProfileController` but driven by trainer ID instead of the authenticated trainer.
- Registered new routes under the admin middleware group:
  - `POST /admin/trainers/{id}/image`
  - `POST /admin/trainers/{id}/qualifications`
  - `DELETE /admin/trainers/{id}/qualifications/{certificationId}`.

**Frontend**
- Added admin trainer media endpoints to `API_ENDPOINTS` for images and qualifications.
- Updated admin trainer DTOs so `certifications` are normalised to the shared `TrainerCertification` shape, with mapper logic to handle legacy string arrays returned from the backend.
- Extended `useAdminTrainers` with:
  - `uploadTrainerImage(trainerId, file)`
  - `uploadTrainerQualification(trainerId, payload)`
  - `deleteTrainerQualification(trainerId, certificationId)`
  All three update in‑memory trainer state to keep the admin UI in sync.
- Enhanced `TrainerForm`:
  - Kept an optional image URL field but added an “upload profile photo” control (Edit mode) that posts a file to the new admin endpoint.
  - Kept a simple comma‑separated text field for quick certification labels, but added a new “Certification documents (upload)” section to handle real files with metadata.
  - Displayed existing certifications with name, year, issuer and, where present, a link to the stored document and an admin‑only Remove action.
- Updated `AdminTrainersPageClient`:
  - Table now shows up to two certification names plus a “+N” summary using `TrainerCertification.name`.
  - Detail view renders certifications with metadata and “View document” links.
  - Edit flow now passes image/qualification upload handlers into the trainer form, enabling admins to upload/delete documents directly from the Edit trainer side canvas.

### Clean Architecture Compliance
- **Dependency direction:** 
  - DTOs and hooks (Application/Interface) depend only on Infrastructure (`ApiClient`, `API_ENDPOINTS`) and shared Application types (`TrainerCertification`), not directly on framework concerns.
  - Controllers remain in the Interface layer and delegate persistence to Eloquent models, consistent with existing patterns.
- **Cross‑feature reuse:**
  - Certification structure (`TrainerCertification`) is shared between trainer self‑service and admin flows, avoiding divergent representations of the same domain concept.
  - File storage and validation are aligned with existing trainer profile upload behaviour to keep a single mental model for media handling.
- **Open/closed principle:**
  - New endpoints and hook methods are additive; existing admin trainer CRUD and public trainer APIs continue to work unchanged.
  - Mapper logic in `AdminTrainerDTO` handles both legacy string arrays and new structured certifications without breaking callers.

### Next Steps
- **Validation UX:** Add inline error toasts/snackbar messaging in the admin dashboard for upload failures instead of browser `alert` calls.
- **Preview & removal for images:** Surface a small thumbnail and explicit “Remove photo” action in the admin form, wired to clear or replace the stored image.
- **Role‑based permissions:** If required, restrict media upload/delete actions to specific roles (e.g. super_admin) via backend policy/middleware.
- **E2E tests:** Add Cypress or Playwright flows to cover “Admin uploads trainer photo”, “Admin uploads qualification”, and “Admin deletes qualification” to prevent regressions.

