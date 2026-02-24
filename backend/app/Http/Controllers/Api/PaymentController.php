<?php

namespace App\Http\Controllers\Api;

use App\Actions\Booking\ProcessPaymentAction;
use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Stripe\StripeClient;

/**
 * Payment Controller (Interface Layer - API)
 * 
 * Clean Architecture: Interface Layer (API Adapter)
 * Purpose: Handles HTTP requests for payment processing
 * Location: backend/app/Http/Controllers/Api/PaymentController.php
 */
class PaymentController extends Controller
{
    use BaseApiController;

    public function __construct(
        private ProcessPaymentAction $processPaymentAction
    ) {
    }

    /**
     * Create a payment intent for a booking.
     *
     * POST /api/v1/bookings/{bookingId}/payments/create-intent
     *
     * @param string $bookingId Booking ID (can be integer ID or UUID string)
     * @param Request $request
     * @return JsonResponse
     */
    public function createIntent(string $bookingId, Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'amount' => ['required', 'numeric', 'min:0.01'],
            'currency' => ['nullable', 'string', 'size:3'],
            'payment_method' => ['nullable', 'string', 'in:stripe,paypal'],
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors()->toArray());
        }

        try {
            $amount = (float) $request->input('amount');
            $currency = $request->input('currency', 'GBP');
            $paymentMethod = $request->input('payment_method', 'stripe');

            // Find booking by ID (supports both integer and UUID string)
            // Try as integer first, then as reference (bookings use integer IDs, not UUIDs)
            $booking = null;
            if (is_numeric($bookingId)) {
                // Try as integer ID
                $booking = \App\Models\Booking::find((int) $bookingId);
            }
            
            // If not found by ID, try by reference (bookings have unique reference codes)
            if (!$booking) {
                $booking = \App\Models\Booking::where('reference', $bookingId)->first();
            }
            
            // Log for debugging if still not found
            if (!$booking) {
                Log::warning('Booking not found for payment intent', [
                    'booking_id_param' => $bookingId,
                    'is_numeric' => is_numeric($bookingId),
                    'type' => gettype($bookingId),
                ]);
            }
            
            if (!$booking) {
                return $this->notFoundResponse('Booking');
            }

            // Log payment intent creation request
            Log::info('Payment intent creation request received', [
                'booking_id_param' => $bookingId,
                'booking_id' => $booking->id,
                'booking_reference' => $booking->reference,
                'amount' => $amount,
                'currency' => $currency,
                'payment_method' => $paymentMethod,
            ]);

            // Use the actual booking ID (integer) for the action
            $result = $this->processPaymentAction->createPaymentIntent(
                (int) $booking->id,
                $amount,
                $currency,
                $paymentMethod
            );

            if (!$result['success']) {
                // Log the failure with full context
                Log::error('Payment intent creation failed in controller', [
                    'booking_id' => $booking->id,
                    'booking_reference' => $booking->reference,
                    'amount' => $amount,
                    'currency' => $currency,
                    'error' => $result['error'] ?? 'Unknown error',
                    'result' => $result,
                ]);
                
                return $this->errorResponse(
                    $result['error'] ?? 'Failed to create payment intent.',
                    \App\Http\Controllers\Api\ErrorCodes::PAYMENT_ERROR,
                    [],
                    400
                );
            }
            
            // Log successful creation
            Log::info('Payment intent created successfully', [
                'booking_id' => $booking->id,
                'booking_reference' => $booking->reference,
                'has_payment_intent_id' => !empty($result['payment_intent_id']),
                'has_checkout_url' => !empty($result['checkout_url']),
                'has_client_secret' => !empty($result['client_secret']),
            ]);

            return $this->successResponse([
                'payment_intent_id' => $result['payment_intent_id'],
                'client_secret' => $result['client_secret'] ?? null,
                'checkout_url' => $result['checkout_url'] ?? null,
                'payment_id' => $result['payment_id'] ?? null,
            ], null, [], 201);
        } catch (\Exception $e) {
            Log::error('Error creating payment intent', [
                'booking_id' => $bookingId,
                'booking_found' => isset($booking) && $booking ? true : false,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to create payment intent.');
        }
    }

    /**
     * Get payment intent from checkout session.
     *
     * POST /api/v1/payments/get-intent-from-session
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getIntentFromSession(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'session_id' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors()->toArray());
        }

        try {
            $sessionId = $request->input('session_id');
            $paymentService = app(\App\Contracts\Payment\IPaymentService::class);
            
            $result = $paymentService->getPaymentIntentFromSession($sessionId);

            if (!$result['success']) {
                return $this->errorResponse(
                    $result['error'] ?? 'Failed to retrieve payment intent from session.',
                    \App\Http\Controllers\Api\ErrorCodes::PAYMENT_ERROR,
                    [],
                    400
                );
            }

            return $this->successResponse([
                'payment_intent_id' => $result['payment_intent_id'],
            ]);
        } catch (\Exception $e) {
            Log::error('Error retrieving payment intent from session', [
                'session_id' => $request->input('session_id'),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to retrieve payment intent from session.');
        }
    }

    /**
     * Confirm payment from Stripe Checkout session (redirect flow).
     * Use this when the user returns from Stripe with session_id so the booking updates
     * immediately without relying on the webhook (works on localhost and production).
     *
     * POST /api/v1/payments/confirm-from-session
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function confirmFromSession(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'session_id' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors()->toArray());
        }

        try {
            $sessionId = $request->input('session_id');
            $paymentService = app(\App\Contracts\Payment\IPaymentService::class);
            $intentResult = $paymentService->getPaymentIntentFromSession($sessionId);

            if (!$intentResult['success'] || empty($intentResult['payment_intent_id'])) {
                return $this->errorResponse(
                    $intentResult['error'] ?? 'Could not get payment from session.',
                    \App\Http\Controllers\Api\ErrorCodes::PAYMENT_ERROR,
                    [],
                    400
                );
            }

            $paymentIntentId = $intentResult['payment_intent_id'];
            $result = $this->processPaymentAction->confirmPayment($paymentIntentId);

            if (!$result['success']) {
                return $this->errorResponse(
                    $result['error'] ?? 'Failed to confirm payment.',
                    \App\Http\Controllers\Api\ErrorCodes::PAYMENT_ERROR,
                    [],
                    400
                );
            }

            if (!isset($result['booking']) || !isset($result['payment'])) {
                Log::error('Payment confirmation from session succeeded but missing booking or payment data', [
                    'session_id' => $sessionId,
                ]);
                return $this->errorResponse(
                    'Payment confirmed but booking data is missing.',
                    \App\Http\Controllers\Api\ErrorCodes::PAYMENT_ERROR,
                    [],
                    500
                );
            }

            Log::info('Payment confirmed from session (redirect flow)', [
                'session_id' => $sessionId,
                'booking_id' => $result['booking']->id,
            ]);

            $schedulesCount = 0;
            if (isset($result['booking']->schedules)) {
                $schedulesCount = $result['booking']->schedules->count();
            } elseif (method_exists($result['booking'], 'schedules')) {
                $schedulesCount = $result['booking']->schedules()->count();
            }

            return $this->successResponse([
                'booking' => [
                    'id' => $result['booking']->id,
                    'reference' => $result['booking']->reference,
                    'status' => $result['booking']->status,
                    'payment_status' => $result['booking']->payment_status,
                    'paid_amount' => $result['booking']->paid_amount,
                    'total_price' => $result['booking']->total_price,
                    'has_sessions' => $schedulesCount > 0,
                    'schedules_count' => $schedulesCount,
                ],
                'payment' => [
                    'id' => $result['payment']->id(),
                    'amount' => $result['payment']->amount(),
                    'status' => $result['payment']->status()->toString(),
                    'transaction_id' => $result['payment']->transactionId(),
                ],
            ], 'Payment confirmed successfully.');
        } catch (\Exception $e) {
            Log::error('Error confirming payment from session', [
                'session_id' => $request->input('session_id'),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to confirm payment.');
        }
    }

    /**
     * Confirm a payment.
     *
     * POST /api/v1/payments/confirm
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function confirm(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'payment_intent_id' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors()->toArray());
        }

        try {
            $paymentIntentId = $request->input('payment_intent_id');

            $result = $this->processPaymentAction->confirmPayment($paymentIntentId);

            if (!$result['success']) {
                return $this->errorResponse(
                    $result['error'] ?? 'Failed to confirm payment.',
                    \App\Http\Controllers\Api\ErrorCodes::PAYMENT_ERROR,
                    [],
                    400
                );
            }

            // Validate that we have booking and payment data
            if (!isset($result['booking']) || !isset($result['payment'])) {
                Log::error('Payment confirmation succeeded but missing booking or payment data', [
                    'payment_intent_id' => $request->input('payment_intent_id'),
                    'has_booking' => isset($result['booking']),
                    'has_payment' => isset($result['payment']),
                ]);
                return $this->errorResponse(
                    'Payment confirmed but booking data is missing.',
                    \App\Http\Controllers\Api\ErrorCodes::PAYMENT_ERROR,
                    [],
                    500
                );
            }

            // Check if booking has schedules
            $schedulesCount = 0;
            if (isset($result['booking']->schedules)) {
                $schedulesCount = $result['booking']->schedules->count();
            } elseif (method_exists($result['booking'], 'schedules')) {
                $schedulesCount = $result['booking']->schedules()->count();
            }

            return $this->successResponse([
                'booking' => [
                    'id' => $result['booking']->id,
                    'reference' => $result['booking']->reference,
                    'status' => $result['booking']->status,
                    'payment_status' => $result['booking']->payment_status,
                    'paid_amount' => $result['booking']->paid_amount,
                    'total_price' => $result['booking']->total_price,
                    'has_sessions' => $schedulesCount > 0,
                    'schedules_count' => $schedulesCount,
                ],
                'payment' => [
                    'id' => $result['payment']->id(),
                    'amount' => $result['payment']->amount(),
                    'status' => $result['payment']->status()->toString(),
                    'transaction_id' => $result['payment']->transactionId(),
                ],
            ], 'Payment confirmed successfully.');
        } catch (\Exception $e) {
            Log::error('Error confirming payment', [
                'payment_intent_id' => $request->input('payment_intent_id'),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to confirm payment.');
        }
    }

    /**
     * Refresh payment status for a booking by checking all its payments.
     *
     * POST /api/v1/bookings/{bookingId}/payments/refresh
     *
     * @param string $bookingId
     * @return JsonResponse
     */
    public function refreshBookingPaymentStatus(string $bookingId): JsonResponse
    {
        try {
            // Find booking by ID or reference
            $booking = null;
            if (is_numeric($bookingId)) {
                $booking = \App\Models\Booking::find((int) $bookingId);
            }
            
            if (!$booking) {
                $booking = \App\Models\Booking::where('reference', $bookingId)->first();
            }
            
            if (!$booking) {
                return $this->notFoundResponse('Booking');
            }

            // Get all payments for this booking that have a transaction ID
            $payments = \App\Models\Payment::where('payable_type', \App\Models\Booking::class)
                ->where('payable_id', $booking->id)
                ->whereNotNull('transaction_id')
                ->get();

            $updated = false;
            $errors = [];
            $statusMessages = [];

            foreach ($payments as $payment) {
                $paymentIntentId = $payment->transaction_id;
                
                // Skip if not a Stripe payment intent ID
                if (!str_starts_with($paymentIntentId, 'pi_')) {
                    continue;
                }

                // Check payment status with Stripe first
                $paymentService = app(\App\Contracts\Payment\IPaymentService::class);
                $statusResult = $paymentService->getPaymentStatus($paymentIntentId);

                if (!$statusResult['success']) {
                    $errors[] = "Payment {$paymentIntentId}: " . ($statusResult['error'] ?? 'Failed to check status');
                    continue;
                }

                $stripeStatus = $statusResult['status'];
                $statusMessages[] = "Payment {$paymentIntentId}: Stripe status is '{$stripeStatus}'";

                // Only try to confirm if payment is completed in Stripe but not in our database
                if ($stripeStatus === 'completed' && in_array($payment->status, ['pending', 'processing'])) {
                    // Try to confirm the payment (this will update our database)
                    $result = $this->processPaymentAction->confirmPayment($paymentIntentId);
                    
                    if ($result['success']) {
                        $updated = true;
                        $statusMessages[] = "Payment {$paymentIntentId}: Successfully updated to completed";
                    } else {
                        $errors[] = "Payment {$paymentIntentId}: " . ($result['error'] ?? 'Failed to confirm payment');
                    }
                } elseif ($stripeStatus === 'processing') {
                    // Update our database to reflect processing status
                    $payment->status = 'processing';
                    $payment->save();
                    $statusMessages[] = "Payment {$paymentIntentId}: Still processing in Stripe (this may take a few moments)";
                } elseif ($stripeStatus === 'pending') {
                    $statusMessages[] = "Payment {$paymentIntentId}: Still pending in Stripe";
                } elseif ($stripeStatus === 'completed' && $payment->status === 'completed') {
                    $statusMessages[] = "Payment {$paymentIntentId}: Already completed in our system";
                } elseif ($stripeStatus === 'failed') {
                    $statusMessages[] = "Payment {$paymentIntentId}: Failed in Stripe";
                } else {
                    $statusMessages[] = "Payment {$paymentIntentId}: Stripe status '{$stripeStatus}' (our status: '{$payment->status}')";
                }
            }

            // Reload booking to get updated status
            $booking->refresh();

            if ($updated) {
                return $this->successResponse([
                    'booking' => [
                        'id' => $booking->id,
                        'reference' => $booking->reference,
                        'status' => $booking->status,
                        'payment_status' => $booking->payment_status,
                        'paid_amount' => $booking->paid_amount,
                        'total_price' => $booking->total_price,
                    ],
                    'messages' => $statusMessages,
                ], 'Payment status refreshed successfully.');
            }

            // If no payments were updated, provide informative message
            if (!$updated && count($errors) > 0) {
                // Include status messages to help debug
                $allMessages = array_merge($statusMessages, $errors);
                return $this->errorResponse(
                    'No payments were updated. ' . implode('; ', $allMessages),
                    \App\Http\Controllers\Api\ErrorCodes::PAYMENT_ERROR,
                    [],
                    400
                );
            }

            // If no payments were found to check, try searching Stripe for payment intents with this booking's metadata
            if (count($statusMessages) === 0 && count($errors) === 0) {
                try {
                    // Search Stripe for payment intents with booking_id in metadata
                    $paymentService = app(\App\Contracts\Payment\IPaymentService::class);
                    
                    // Try to search Stripe for payment intents with this booking's metadata
                    if (method_exists($paymentService, 'searchPaymentIntentsByMetadata')) {
                        $searchResult = $paymentService->searchPaymentIntentsByMetadata([
                            'booking_id' => (string) $booking->id,
                            'booking_reference' => $booking->reference,
                        ]);
                        
                        if ($searchResult['success'] && !empty($searchResult['payment_intents'])) {
                            // Found payment intents in Stripe - try to confirm them
                            foreach ($searchResult['payment_intents'] as $paymentIntentId) {
                                $statusMessages[] = "Found payment intent in Stripe: {$paymentIntentId}";
                                
                                // Try to confirm the payment (this will create payment record if needed)
                                $result = $this->processPaymentAction->confirmPayment($paymentIntentId);
                                
                                if ($result['success']) {
                                    $updated = true;
                                    $statusMessages[] = "Payment {$paymentIntentId}: Successfully confirmed and linked to booking";
                                } else {
                                    $errors[] = "Payment {$paymentIntentId}: " . ($result['error'] ?? 'Failed to confirm payment');
                                }
                            }
                            
                            // Reload booking after updates
                            if ($updated) {
                                $booking->refresh();
                                return $this->successResponse([
                                    'booking' => [
                                        'id' => $booking->id,
                                        'reference' => $booking->reference,
                                        'status' => $booking->status,
                                        'payment_status' => $booking->payment_status,
                                        'paid_amount' => $booking->paid_amount,
                                        'total_price' => $booking->total_price,
                                    ],
                                    'messages' => $statusMessages,
                                ], 'Payment status refreshed successfully. Found and confirmed payment from Stripe.');
                            }
                        }
                    } else {
                        // Fallback: Direct Stripe API search if method doesn't exist
                        // Note: Stripe doesn't support filtering payment intents by metadata directly
                        // So we search checkout sessions (which do support metadata) and get payment intents from them
                        try {
                            $stripe = new StripeClient(config('services.stripe.secret_key'));
                            
                            // Search for checkout sessions with booking_id in metadata
                            // Checkout sessions support metadata filtering
                            $checkoutSessions = $stripe->checkout->sessions->all([
                                'limit' => 10,
                                'metadata' => [
                                    'booking_id' => (string) $booking->id,
                                ],
                            ]);
                            
                            if (count($checkoutSessions->data) > 0) {
                                foreach ($checkoutSessions->data as $checkoutSession) {
                                    // Get payment intent ID from checkout session
                                    $paymentIntentId = $checkoutSession->payment_intent;
                                    
                                    // Handle both string ID and expanded object
                                    if (is_object($paymentIntentId) && isset($paymentIntentId->id)) {
                                        $paymentIntentId = $paymentIntentId->id;
                                    } elseif (!is_string($paymentIntentId)) {
                                        continue; // Skip if no payment intent
                                    }
                                    
                                    if (!$paymentIntentId || !str_starts_with($paymentIntentId, 'pi_')) {
                                        continue; // Skip if not a valid payment intent ID
                                    }
                                    
                                    $statusMessages[] = "Found checkout session with payment intent: {$paymentIntentId}";
                                    
                                    // Check if payment is completed in Stripe
                                    $statusResult = $paymentService->getPaymentStatus($paymentIntentId);
                                    
                                    if ($statusResult['success'] && $statusResult['status'] === 'completed') {
                                        // Try to confirm the payment (this will create payment record if needed)
                                        $result = $this->processPaymentAction->confirmPayment($paymentIntentId);
                                        
                                        if ($result['success']) {
                                            $updated = true;
                                            $statusMessages[] = "Payment {$paymentIntentId}: Successfully confirmed and linked to booking";
                                        } else {
                                            $errors[] = "Payment {$paymentIntentId}: " . ($result['error'] ?? 'Failed to confirm payment');
                                        }
                                    } else {
                                        $statusMessages[] = "Payment {$paymentIntentId}: Status in Stripe is '{$statusResult['status']}' (not completed yet)";
                                    }
                                }
                                
                                // Reload booking after updates
                                if ($updated) {
                                    $booking->refresh();
                                    return $this->successResponse([
                                        'booking' => [
                                            'id' => $booking->id,
                                            'reference' => $booking->reference,
                                            'status' => $booking->status,
                                            'payment_status' => $booking->payment_status,
                                            'paid_amount' => $booking->paid_amount,
                                            'total_price' => $booking->total_price,
                                        ],
                                        'messages' => $statusMessages,
                                    ], 'Payment status refreshed successfully. Found and confirmed payment from Stripe.');
                                }
                            }
                        } catch (\Exception $stripeError) {
                            \Log::warning('Failed to search Stripe for checkout sessions', [
                                'booking_id' => $booking->id,
                                'error' => $stripeError->getMessage(),
                            ]);
                        }
                    }
                } catch (\Exception $searchError) {
                    \Log::warning('Error searching Stripe for payment intents', [
                        'booking_id' => $booking->id,
                        'error' => $searchError->getMessage(),
                    ]);
                }
                
                // If still no payments found after Stripe search
                if (count($statusMessages) === 0 && count($errors) === 0) {
                    return $this->errorResponse(
                        'No payments found for this booking to refresh. If you completed payment in Stripe, please wait a few moments for the webhook to process, or contact support.',
                        \App\Http\Controllers\Api\ErrorCodes::PAYMENT_ERROR,
                        [],
                        400
                    );
                }
            }

            // No errors, but also no updates (all payments already in correct state or still processing)
            return $this->successResponse([
                'booking' => [
                    'id' => $booking->id,
                    'reference' => $booking->reference,
                    'status' => $booking->status,
                    'payment_status' => $booking->payment_status,
                    'paid_amount' => $booking->paid_amount,
                    'total_price' => $booking->total_price,
                ],
                'messages' => $statusMessages,
            ], count($statusMessages) > 0 
                ? 'Payment status checked. ' . implode('; ', $statusMessages)
                : 'No pending payments found to refresh.');
        } catch (\Exception $e) {
            Log::error('Error refreshing booking payment status', [
                'booking_id' => $bookingId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to refresh payment status.');
        }
    }
}

