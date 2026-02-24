<?php

namespace App\Http\Controllers\Api;

use App\Actions\Booking\ProcessPaymentAction;
use App\Domain\Payment\Repositories\IPaymentRepository;
use App\Domain\Payment\ValueObjects\PaymentStatus;
use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;

/**
 * Stripe Webhook Controller
 *
 * Clean Architecture: Interface Layer (Webhook Handler)
 * Purpose: Handles Stripe webhook events
 * Location: backend/app/Http/Controllers/Api/StripeWebhookController.php
 *
 * This controller:
 * - Verifies webhook signatures
 * - Processes payment events (payment_intent.succeeded, etc.)
 * - Updates booking payment status
 *
 * TODO (when Reverb 403 is fixed): After marking booking paid in handlePaymentIntentSucceeded,
 * broadcast live-refresh so the parent dashboard refetches once instead of frontend polling.
 * Call: LiveRefreshBroadcastService::notify([LiveRefreshController::CONTEXT_BOOKINGS], [$booking->user_id], false);
 * Frontend already subscribes to live-refresh.{userId} and will refetch; remove the 2s/5s timers in
 * ParentDashboardPageClient handlePaymentComplete and Stripe return-url effect. See
 * backend/PAYMENT_LIVE_REFRESH_TODO.md.
 */
class StripeWebhookController extends Controller
{
    use BaseApiController;

    public function __construct(
        private ProcessPaymentAction $processPaymentAction,
        private IPaymentRepository $paymentRepository
    ) {
    }

    /**
     * Handle Stripe webhook events.
     *
     * POST /api/v1/webhooks/stripe
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $signature = $request->header('Stripe-Signature');
        $webhookSecret = config('services.stripe.webhook_secret');

        // If no signature provided, return 400
        if (!$signature) {
            Log::warning('Stripe webhook called without signature');
            return $this->errorResponse('Missing signature', \App\Http\Controllers\Api\ErrorCodes::BAD_REQUEST, [], 400);
        }

        if (!$webhookSecret) {
            Log::warning('Stripe webhook secret not configured');
            return $this->serverErrorResponse('Webhook secret not configured');
        }

        try {
            $event = Webhook::constructEvent(
                $payload,
                $signature,
                $webhookSecret
            );
        } catch (\UnexpectedValueException $e) {
            Log::error('Invalid Stripe webhook payload', ['error' => $e->getMessage()]);
            return $this->errorResponse('Invalid payload', \App\Http\Controllers\Api\ErrorCodes::BAD_REQUEST, [], 400);
        } catch (SignatureVerificationException $e) {
            Log::error('Invalid Stripe webhook signature', ['error' => $e->getMessage()]);
            return $this->errorResponse('Invalid signature', \App\Http\Controllers\Api\ErrorCodes::BAD_REQUEST, [], 400);
        }

        // Handle the event
        try {
            switch ($event->type) {
                case 'payment_intent.succeeded':
                    $this->handlePaymentIntentSucceeded($event->data->object);
                    break;

                case 'payment_intent.payment_failed':
                    $this->handlePaymentIntentFailed($event->data->object);
                    break;

                case 'payment_intent.canceled':
                    $this->handlePaymentIntentCanceled($event->data->object);
                    break;

                default:
                    Log::info('Unhandled Stripe webhook event', ['type' => $event->type]);
            }

            return $this->successResponse(['received' => true]);
        } catch (\Exception $e) {
            Log::error('Error processing Stripe webhook', [
                'event_type' => $event->type,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Webhook processing failed');
        }
    }

    /**
     * Handle payment_intent.succeeded event.
     */
    private function handlePaymentIntentSucceeded($paymentIntent): void
    {
        $paymentIntentId = $paymentIntent->id;

        Log::info('Stripe payment succeeded', [
            'payment_intent_id' => $paymentIntentId,
            'amount' => $paymentIntent->amount / 100,
        ]);

        // Confirm payment (updates booking and payment records).
        // When Reverb is stable: after success, broadcast LiveRefreshContextsUpdated for this user's
        // bookings context so frontend refetches once; then remove frontend 2s/5s refetch timers.
        $result = $this->processPaymentAction->confirmPayment($paymentIntentId);

        if (!$result['success']) {
            Log::warning('Failed to confirm payment after webhook', [
                'payment_intent_id' => $paymentIntentId,
                'error' => $result['error'] ?? 'Unknown error',
            ]);
        }
    }

    /**
     * Handle payment_intent.payment_failed event.
     */
    private function handlePaymentIntentFailed($paymentIntent): void
    {
        $paymentIntentId = $paymentIntent->id;

        Log::info('Stripe payment failed', [
            'payment_intent_id' => $paymentIntentId,
            'amount' => $paymentIntent->amount / 100,
            'failure_message' => $paymentIntent->last_payment_error->message ?? 'Unknown error',
        ]);

        // Try to find booking associated with this payment intent
        try {
            $payment = \App\Models\Payment::where('transaction_id', $paymentIntentId)->first();
            
            if ($payment && $payment->payable_type === \App\Models\Booking::class) {
                $booking = \App\Models\Booking::find($payment->payable_id);
                
                if ($booking) {
                    $errorMessage = $paymentIntent->last_payment_error->message ?? 'Payment failed. Please try again.';
                    
                    // Dispatch PaymentFailed event (triggers notification)
                    event(new \App\Events\PaymentFailed($booking, $errorMessage));
                }
            }
        } catch (\Exception $e) {
            Log::error('Error handling payment failed webhook', [
                'payment_intent_id' => $paymentIntentId,
                'error' => $e->getMessage(),
            ]);
        }
        $failureMessage = $paymentIntent->last_payment_error->message ?? 'Payment failed';

        Log::info('Stripe payment failed', [
            'payment_intent_id' => $paymentIntentId,
            'failure_message' => $failureMessage,
        ]);

        // Find and update payment record using Payment repository
        $payment = $this->paymentRepository->findByTransactionId($paymentIntentId);

        if ($payment) {
            $this->paymentRepository->markAsFailed($payment->id(), $failureMessage);
        }
    }

    /**
     * Handle payment_intent.canceled event.
     */
    private function handlePaymentIntentCanceled($paymentIntent): void
    {
        $paymentIntentId = $paymentIntent->id;

        Log::info('Stripe payment canceled', [
            'payment_intent_id' => $paymentIntentId,
        ]);

        // Find and update payment record using Payment repository
        $payment = $this->paymentRepository->findByTransactionId($paymentIntentId);

        if ($payment) {
            $this->paymentRepository->updateStatus($payment->id(), PaymentStatus::CANCELLED);
        }
    }
}

