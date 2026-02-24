# Payment complete → live-refresh (Reverb) — proper solution

## Current state (beta)

- After a parent pays (in-dashboard or Stripe redirect), the frontend refetches bookings at **0s, 2s, and 5s** so the "Pay now" alert clears once the backend/webhook has updated the booking.
- This is a **polling hack**: we don't know when the webhook has finished. If the server is slow, 5s may not be enough; if it's fast, we do unnecessary requests. Fine for beta; not for production at scale.

## Proper solution (when Reverb is stable, 403 fixed)

Use the existing **live-refresh** flow: one broadcast when the booking is marked paid, one refetch on the frontend.

### Backend

1. **StripeWebhookController::handlePaymentIntentSucceeded**
   - After `$result = $this->processPaymentAction->confirmPayment($paymentIntentId);`
   - If `$result['success']` and `isset($result['booking'])`:
     - `$booking = $result['booking'];` (Eloquent model)
     - `$userId = $booking->user_id;`
     - `LiveRefreshBroadcastService::notify([LiveRefreshController::CONTEXT_BOOKINGS], [$userId], false);`
   - This broadcasts `LiveRefreshContextsUpdated` on the private channel `live-refresh.{userId}` with `contexts: ['bookings']`.

2. **Imports** (add at top of StripeWebhookController):
   - `use App\Http\Controllers\Api\LiveRefreshController;`
   - `use App\Services\LiveRefreshBroadcastService;`

### Frontend

1. **ParentDashboardPageClient.tsx**
   - The dashboard already has `useLiveRefresh('bookings', parentRefetch, …)`. When the backend broadcasts with context `bookings`, `parentRefetch` runs (one refetch).
   - **Remove** the two `setTimeout` refetches (2s and 5s) in:
     - `handlePaymentComplete`
     - The Stripe return-url `useEffect` (the one that runs when `purchaseStatus === 'success'`).
   - Keep the **immediate** `refetchBookings(true)` (and optional single delayed refetch if you want a small safety net; one is enough if Reverb is reliable).

### Result

| | Current (timers) | Proper (Reverb) |
|---|------------------|-----------------|
| Reliability | ~90% (fails if webhook > 5s) | ~100% (event when done) |
| Extra requests per payment | 3 | 1 |
| Correct tool | No | Yes |

## When to implement

- **Now:** Keep the timer-based refetches; they unblock users and the flow works.
- **Then:** When Reverb is fully stable (403 fixed), add the broadcast in the webhook and remove the 2s/5s timers as above.
