# Payment Gateway Manager – Implementation Summary

## Purpose

Single entry point for payment gateway operations (Stripe today; extensible). Centralises Stripe loading, payment intent creation, and payment error reporting so UI components do not patch global `console` or duplicate logic.

## Location

- **Infrastructure:** `frontend/src/infrastructure/services/payment/PaymentGatewayManager.ts`
- **Usage:** `StripePaymentForm`, any future payment UI or hooks.

## Public API

| Export | Purpose |
|--------|--------|
| `getStripeInstance()` | Load Stripe with retry; returns `Promise<Stripe \| null>`. Use instead of loading Stripe in components. |
| `createPaymentIntent(bookingId, amount, currency?, paymentMethod?)` | Create payment intent via backend; delegates to `ApiPaymentService`. |
| `reportPaymentError(error, context?)` | Log payment-related errors; suppresses known Stripe analytics noise only (e.g. `r.stripe.com/b`, `ERR_BLOCKED_BY_CLIENT`). |
| `PaymentGatewayManager` | Facade object: `{ getStripe, createPaymentIntent, reportError }`. |

## Design

- **No global console patching.** Only code that explicitly calls `reportPaymentError()` gets Stripe noise filtered. Other app errors (e.g. API network failures) are not routed through the payment layer.
- **Stripe load:** Retry with backoff; safe when Stripe.js is blocked by ad blockers.
- **Payment intents:** Backend remains the source of truth; manager delegates to `ApiPaymentService`.

## Extensibility

To add another provider (e.g. PayPal):

1. Add adapter in `frontend/src/infrastructure/services/payment/` (e.g. `PayPalPaymentService.ts`).
2. In `PaymentGatewayManager`, add `createPayPalOrder` (or similar) and expose via the facade.
3. Use the same `reportPaymentError()` for provider-specific noise if needed.

## Files Modified/Created

1. **Created:** `frontend/src/infrastructure/services/payment/PaymentGatewayManager.ts` – manager and helpers.
2. **Modified:** `frontend/src/infrastructure/services/payment/index.ts` – export `PaymentGatewayManager`.
3. **Modified:** `frontend/src/components/booking/payment/StripePaymentForm.tsx` – removed global `console.error` override; uses manager for Stripe load, createPaymentIntent, and payment error reporting.

## Clean Architecture Compliance

- **Infrastructure only.** Manager depends on `ApiPaymentService` and Stripe SDK; no domain/application imports.
- **UI depends on manager.** `StripePaymentForm` and future payment UI call `PaymentGatewayManager`; no direct Stripe load or global console patching in components.

---

## If "Server unavailable" or GET /bookings fails

The parent dashboard calls `GET /api/v1/bookings`. If the backend is not reachable (e.g. not running), the app shows *"Server unavailable. Ensure the backend is running (e.g. docker compose up -d backend)."* and logs once at debug level. Ensure:

1. Backend is running: `docker compose ps` shows `backend` (or `camsservice-backend`) **Up**.
2. Port **9080** is mapped: `0.0.0.0:9080->80/tcp`.
3. From the same machine: `curl -s -o /dev/null -w "%{http_code}" http://localhost:9080/api/v1/bookings` returns a status (401 or 200), not connection refused.

See `docs/cleanarchitecture/docker/DOCKER_AND_BACKEND.md` for running the backend in Docker.
