## Parent Package Top-Up Flow – Implementation Summary

### Files Modified/Created (In Order)
1. **File:** `backend/app/Actions/Booking/TopUpBookingAction.php`  
   - Layer: Application (Use Case)  
   - Order: 1  
   - Purpose: Orchestrates validation and state changes for topping up an existing booking (hours and price) and delegates payment intent creation to the payment action.

2. **File:** `backend/app/Http/Controllers/Api/BookingController.php`  
   - Layer: Interface (API Adapter)  
   - Order: 2  
   - Purpose: Exposes a new `POST /api/v1/bookings/{id}/top-up` endpoint that validates input and calls `TopUpBookingAction`, returning checkout details to the frontend.

3. **File:** `backend/routes/api.php`  
   - Layer: Interface (Routing)  
   - Order: 3  
   - Purpose: Registers the authenticated, approval-gated `bookings/{id}/top-up` route under the existing bookings group.

4. **File:** `frontend/src/infrastructure/http/apiEndpoints.ts`  
   - Layer: Infrastructure (HTTP Endpoints)  
   - Order: 4  
   - Purpose: Adds `BOOKING_TOP_UP(id)` so frontend repositories/components can call the top-up endpoint without hardcoded paths.

5. **File:** `frontend/src/app/dashboard/parent/ParentDashboardPageClient.tsx`  
   - Layer: Presentation / Orchestration  
   - Order: 5  
   - Purpose: Wires the new `TopUpModal` into the parent dashboard, adds handlers for opening top-ups per child, and starts the payment flow via the new API endpoint.

6. **File:** `frontend/src/components/dashboard/modals/BuyHoursModal.tsx`  
   - Layer: Presentation  
   - Order: 6  
   - Purpose: Updates messaging and passes through a new `onOpenTopUp` callback so parents can switch from “buy new package” to “add hours (top-up)” when a child already has an active package.

### Plain English Explanation
Parents can now **add extra hours to an existing, fully paid package** instead of being forced to buy a brand-new package once hours run low.  

From the dashboard, when a child with an active package has limited hours, parents see “Add hours (top-up)” actions both in the booking modal (when hours are the limiting factor) and in the Buy Hours modal (when the system detects an active package). Clicking this opens a dedicated **Top-Up modal**, where they pick how many hours to add (presets + custom). The system calculates the price based on the **original package rate** and then calls a new backend endpoint to create a Stripe checkout session for exactly that amount.  

On the backend, the top-up use case safely:
- Confirms the booking belongs to the logged-in parent,  
- Ensures it is **confirmed, fully paid, and not expired**,  
- Increases `total_hours`, `remaining_hours`, and `total_price` on the booking, and  
- Uses the existing `ProcessPaymentAction` to create a payment intent / checkout session.  

Payment confirmation continues to flow through the existing payment infrastructure, which updates the booking’s `paid_amount` and `payment_status` accordingly.

### Summary of Changes
**Backend**
- Added `TopUpBookingAction`:
  - Validates authentication and booking ownership.
  - Restricts top-ups to **confirmed**, **fully paid**, **non-expired** bookings.
  - Computes a safe hourly rate from `booking.package.hours/price`, falling back to `booking.total_hours/total_price` for legacy data.
  - Increases `total_hours`, `remaining_hours`, and `total_price` atomically in a DB transaction.
  - Delegates to `ProcessPaymentAction::createPaymentIntent()` to create a Stripe checkout session, rolling back the booking update if payment intent creation fails.
- Updated `BookingController`:
  - Injects `TopUpBookingAction`.
  - Adds `topUp(int $id, Request $request)` with validation of `hours` and optional `currency`.
  - Handles domain/runtime errors with a 400 JSON response using existing `BOOKING_ERROR` codes and logs unexpected exceptions.
- Updated routes:
  - Registered `POST /api/v1/bookings/{id}/top-up` under `auth:sanctum` + `require.approval`, alongside existing booking routes.

**Frontend**
- Added `BOOKING_TOP_UP(id)` to `apiEndpoints.ts` to keep endpoint management centralised.
- Parent dashboard (`ParentDashboardPageClient.tsx`):
  - Imports and uses `TopUpModal`.
  - Introduces top-up state: `showTopUpModal`, `topUpChildId`, `topUpBooking`, `isTopUpSubmitting`.
  - Implements `handleOpenTopUp(childId)`:
    - Looks up the child and its **active confirmed+paid booking** via `getActiveBookingForChild`.
    - Blocks when there is no active package or the booking is not fully paid.
    - Opens `TopUpModal` with the child name and booking DTO.
  - Implements `handleTopUpProceedToPayment(hours, totalPrice)`:
    - Calls `POST BOOKING_TOP_UP(booking.id)` with `{ hours }`.
    - If `checkout_url` is returned, closes the modal and redirects the browser to Stripe Checkout.
    - Surfaces backend error messages in toasts when the request fails.
  - Wires `handleOpenTopUp` into:
    - `BuyHoursModal` via the new `onOpenTopUp` prop.
    - `ParentBookingModal` via `onBuyMoreHours`, so the inline “Add top-up” link uses the same flow.
- `BuyHoursModal.tsx`:
  - Keeps the logic that prevents multiple active packages per child but updates the user-facing copy to point to the new “Add hours (top-up)” action instead of telling parents to contact support.

### Clean Architecture Compliance
- **Application vs Domain vs Interface**
  - `TopUpBookingAction` lives in the **Application layer**, orchestrating domain model changes (`Booking`), while `ProcessPaymentAction` continues to own payment orchestration.
  - Controllers (`BookingController`) stay as thin **Interface layer** adapters: they validate HTTP input, call the use case, and format JSON responses.
  - The new API endpoint is exposed via `routes/api.php` and consumed from the frontend only through `API_ENDPOINTS`, not hardcoded paths.
- **Re-use of existing payment domain**
  - No new payment flows were invented; top-ups are modelled as **additional payments against the existing booking**, reusing `ProcessPaymentAction` and `IPaymentService`.
  - This ensures Stripe behaviour, webhooks, and payment status refreshes behave identically for base bookings and top-ups.
- **Frontend layering**
  - The dashboard page (`ParentDashboardPageClient`) acts as an orchestrator, using `apiClient` + `API_ENDPOINTS`. It does not encapsulate business rules about hour limits beyond what is needed for UX (e.g., blocking non-confirmed or unpaid bookings).
  - `TopUpModal` and `BuyHoursModal` remain pure **Presentation** components; they do not make HTTP calls directly and receive all behaviour via props.

### Next Steps
- **Testing**
  - Add feature tests that:
    - Assert `POST /api/v1/bookings/{id}/top-up` rejects non-confirmed, unpaid, or expired bookings.
    - Verify that the booking’s `total_hours`, `remaining_hours`, and `total_price` are updated correctly for various hour increments.
    - Confirm that `ProcessPaymentAction::createPaymentIntent` is invoked with the correct amount and metadata.
  - Add Cypress/Playwright scenarios for the parent dashboard:
    - “Low hours → Add top-up → Redirect to Stripe → Return with updated hours.”
- **UX refinements**
  - Extend `ParentCleanRightSidebar` to highlight “low hours” children with a direct “Add top-up” button wired to `handleOpenTopUp`.
  - Consider showing recent top-up activity in the parent’s booking summary, so they can see when and how much they added.

