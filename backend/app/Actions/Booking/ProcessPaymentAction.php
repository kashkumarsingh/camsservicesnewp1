<?php

namespace App\Actions\Booking;

use App\Contracts\Booking\IBookingRepository;
use App\Contracts\Payment\IPaymentService;
use App\Domain\Payment\Repositories\IPaymentRepository;
use App\Domain\Payment\ValueObjects\PaymentMethod;
use App\Domain\Payment\ValueObjects\PaymentStatus as PaymentStatusVO;
use App\Events\PaymentCompleted;
use App\Models\Booking;
use App\ValueObjects\Booking\PaymentStatus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Process Payment Action (Application Layer)
 * 
 * Clean Architecture: Application Layer (Use Cases)
 * Purpose: Orchestrates payment processing for bookings
 * Location: backend/app/Actions/Booking/ProcessPaymentAction.php
 * 
 * This action handles:
 * - Creating payment intents with Stripe
 * - Recording payment attempts
 * - Updating booking payment status
 * - Handling payment confirmations
 */
class ProcessPaymentAction
{
    public function __construct(
        private readonly IBookingRepository $bookingRepository,
        private readonly IPaymentService $paymentService,
        private readonly IPaymentRepository $paymentRepository
    ) {
    }

    /**
     * Create a payment intent for a booking.
     *
     * @param int $bookingId
     * @param float $amount
     * @param string $currency
     * @param string $paymentMethod
     * @return array{success: bool, payment_intent_id?: string, client_secret?: string, checkout_url?: string, error?: string}
     */
    public function createPaymentIntent(
        int $bookingId,
        float $amount,
        string $currency = 'GBP',
        string $paymentMethod = 'stripe'
    ): array {
        return DB::transaction(function () use ($bookingId, $amount, $currency, $paymentMethod) {
            // Get booking (eager load user relationship for email access)
            $booking = $this->bookingRepository->findById($bookingId);
            
            if (!$booking) {
                return [
                    'success' => false,
                    'error' => 'Booking not found.',
                ];
            }

            // Ensure user relationship is loaded (for email access)
            if ($booking->user_id && !$booking->relationLoaded('user')) {
                $booking->load('user');
            }

            // Validate amount
            $outstandingAmount = $booking->total_price - $booking->paid_amount - $booking->discount_amount;
            
            if ($amount <= 0) {
                return [
                    'success' => false,
                    'error' => 'Payment amount must be greater than zero.',
                ];
            }

            if ($amount > $outstandingAmount) {
                return [
                    'success' => false,
                    'error' => "Payment amount (£{$amount}) exceeds outstanding balance (£{$outstandingAmount}).",
                ];
            }

            // Create payment record using Payment domain (independent domain)
            $payment = $this->paymentRepository->create([
                'payable_type' => Booking::class,
                'payable_id' => (string) $bookingId,
                'amount' => $amount,
                'currency' => $currency,
                'payment_method' => $paymentMethod,
                'payment_provider' => 'Stripe',
                'status' => PaymentStatusVO::PENDING,
            ]);

            // Create checkout session with Stripe
            // Stripe Checkout automatically creates a payment intent when the customer starts checkout
            // We'll retrieve the payment intent ID later when confirming payment
            $metadata = [
                'booking_id' => (string) $bookingId,
                'booking_reference' => $booking->reference,
                'payment_id' => $payment->id(),
            ];

            // Get parent email from booking (for pre-filling Stripe checkout)
            $parentEmail = null;
            if ($booking->user && $booking->user->email) {
                // Use logged-in user's email
                $parentEmail = $booking->user->email;
            } elseif ($booking->parent_email) {
                // Fallback to stored parent_email field
                $parentEmail = $booking->parent_email;
            } elseif ($booking->guest_email) {
                // Fallback to guest_email for guest bookings
                $parentEmail = $booking->guest_email;
            }

            // Create checkout session (Stripe creates the payment intent automatically)
            // This is simpler and more reliable than creating separate payment intents
            $frontendUrl = config('services.frontend.url');
            
            Log::info('Creating checkout session for booking payment', [
                'booking_id' => $bookingId,
                'booking_reference' => $booking->reference,
                'amount' => $amount,
                'currency' => $currency,
                'payment_id' => $payment->id(),
                'parent_email' => $parentEmail,
            ]);
            
            $checkoutResult = $this->paymentService->createCheckoutSession(
                $amount,
                $currency,
                $metadata,
                // ✅ Preferred flow: return parents to the new dashboard shell
                // We still include the session ID so the dashboard can optionally
                // confirm/refresh payment if needed, but primary consistency comes
                // from Stripe webhooks.
                $frontendUrl . '/dashboard/parent?purchase=success&session_id={CHECKOUT_SESSION_ID}',
                $frontendUrl . '/dashboard/parent?purchase=canceled',
                $parentEmail // Pre-fill parent email in Stripe checkout
            );

            if (!$checkoutResult['success']) {
                $errorMessage = $checkoutResult['error'] ?? 'Checkout session creation failed';
                
                Log::error('Checkout session creation failed in ProcessPaymentAction', [
                    'booking_id' => $bookingId,
                    'booking_reference' => $booking->reference,
                    'payment_id' => $payment->id(),
                    'amount' => $amount,
                    'error' => $errorMessage,
                    'checkout_result' => $checkoutResult,
                ]);
                
                $this->paymentRepository->markAsFailed(
                    $payment->id(),
                    $errorMessage
                );
                
                return $checkoutResult;
            }

            // Update payment record with checkout session ID
            // Note: Payment intent ID will be retrieved from the checkout session when confirming payment
            $this->paymentRepository->updateTransactionAndStatus(
                $payment->id(),
                $checkoutResult['payment_intent_id'] ?? null, // May be null if not created yet
                PaymentStatusVO::PROCESSING,
                [
                    'checkout_session_id' => $checkoutResult['session_id'] ?? null,
                    'payment_intent_id' => $checkoutResult['payment_intent_id'] ?? null, // From Stripe Checkout
                ]
            );

            Log::info('Checkout session created (Stripe will create payment intent automatically)', [
                'booking_id' => $bookingId,
                'payment_id' => $payment->id(),
                'checkout_session_id' => $checkoutResult['session_id'] ?? null,
                'payment_intent_id' => $checkoutResult['payment_intent_id'] ?? null,
                'amount' => $amount,
            ]);

            return [
                'success' => true,
                'payment_intent_id' => $checkoutResult['payment_intent_id'] ?? null, // May be null initially
                'checkout_url' => $checkoutResult['checkout_url'] ?? null,
                'payment_id' => $payment->id(),
            ];
        });
    }

    /**
     * Confirm a payment (after client-side confirmation).
     *
     * @param string $paymentIntentId
     * @return array{success: bool, booking?: Booking, payment?: \App\Domain\Payment\Entities\Payment, error?: string}
     */
    public function confirmPayment(string $paymentIntentId): array
    {
        return DB::transaction(function () use ($paymentIntentId) {
            // Find payment by transaction ID using Payment repository
            $payment = $this->paymentRepository->findByTransactionId($paymentIntentId);

            // If not found, try to find by checkout session ID from metadata
            // (Stripe Checkout creates its own payment intent, so we need to find the payment by session ID)
            if (!$payment) {
                // First, try to get the checkout session from Stripe to find the session ID
                try {
                    $stripe = new \Stripe\StripeClient(config('services.stripe.secret_key'));
                    $checkoutSessions = $stripe->checkout->sessions->all([
                        'limit' => 100,
                        'payment_intent' => $paymentIntentId,
                    ]);
                    
                        if (count($checkoutSessions->data) > 0) {
                            $checkoutSession = $checkoutSessions->data[0];
                            $checkoutSessionId = $checkoutSession->id;
                            
                            // Convert metadata to array if it's a StripeObject
                            $metadata = $checkoutSession->metadata;
                            if (is_object($metadata) && method_exists($metadata, 'toArray')) {
                                $metadata = $metadata->toArray();
                            } elseif (is_object($metadata)) {
                                $metadata = (array) $metadata;
                            }
                            
                            Log::info('Found checkout session for payment intent', [
                                'payment_intent_id' => $paymentIntentId,
                                'checkout_session_id' => $checkoutSessionId,
                                'metadata' => $metadata,
                            ]);
                            
                            // Try to find payment by checkout session ID in metadata
                            // Payment entity metadata() returns JSON string; decode before use
                            if (isset($metadata['booking_id'])) {
                                $bookingId = (int) $metadata['booking_id'];
                                $payments = $this->paymentRepository->findByPayable(\App\Models\Booking::class, (string) $bookingId);

                                foreach ($payments as $p) {
                                    $paymentMeta = $p->metadata() ? json_decode($p->metadata(), true) : [];
                                    if (is_array($paymentMeta) && isset($paymentMeta['checkout_session_id']) && $paymentMeta['checkout_session_id'] === $checkoutSessionId) {
                                        Log::info('Found payment by checkout session ID', [
                                            'payment_id' => $p->id(),
                                            'checkout_session_id' => $checkoutSessionId,
                                        ]);

                                        // Update payment with the payment intent ID
                                        $this->paymentRepository->updateTransactionAndStatus(
                                            $p->id(),
                                            $paymentIntentId,
                                            \App\Domain\Payment\ValueObjects\PaymentStatus::PROCESSING,
                                            ['payment_intent_id' => $paymentIntentId]
                                        );
                                        $payment = $this->paymentRepository->findById($p->id());
                                        break;
                                    }
                                }
                            }
                        }
                } catch (\Exception $e) {
                    Log::warning('Failed to find payment by checkout session', [
                        'payment_intent_id' => $paymentIntentId,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            // If still not found, try to find by checkout session (checkout sessions create their own payment intent)
            if (!$payment) {
                Log::info('Payment not found by transaction_id, attempting to find via Stripe payment intent metadata', [
                    'payment_intent_id' => $paymentIntentId,
                ]);

                try {
                    // Get payment intent details from Stripe to access metadata
                    $stripe = new \Stripe\StripeClient(config('services.stripe.secret_key'));
                    $stripePaymentIntent = $stripe->paymentIntents->retrieve($paymentIntentId);
                    
                    // Convert metadata to array if it's a StripeObject
                    $paymentIntentMetadata = $stripePaymentIntent->metadata;
                    if (is_object($paymentIntentMetadata) && method_exists($paymentIntentMetadata, 'toArray')) {
                        $paymentIntentMetadata = $paymentIntentMetadata->toArray();
                    } elseif (is_object($paymentIntentMetadata)) {
                        $paymentIntentMetadata = (array) $paymentIntentMetadata;
                    }
                    
                    Log::info('Retrieved Stripe payment intent', [
                        'payment_intent_id' => $paymentIntentId,
                        'status' => $stripePaymentIntent->status,
                        'metadata' => $paymentIntentMetadata,
                    ]);

                    $bookingId = null;
                    $checkoutSession = null;

                    // Try to get booking_id from payment intent metadata
                    if (isset($paymentIntentMetadata['booking_id'])) {
                        $bookingId = (int) $paymentIntentMetadata['booking_id'];
                        Log::info('Found booking_id in payment intent metadata', ['booking_id' => $bookingId]);
                    }

                    // When PaymentIntent metadata is empty (Stripe Checkout does not copy session metadata to PI),
                    // get booking_id from the Checkout Session: either via payment_details.order_reference or by listing.
                    if (!$bookingId) {
                        Log::info('Payment intent has no metadata, attempting to find checkout session');

                        // Prefer direct retrieve: Stripe sets payment_details.order_reference to the Checkout Session ID (cs_xxx)
                        $sessionId = null;
                        $paymentDetails = $stripePaymentIntent->payment_details ?? null;
                        if ($paymentDetails) {
                            $sessionId = is_object($paymentDetails) && isset($paymentDetails->order_reference)
                                ? $paymentDetails->order_reference
                                : (is_array($paymentDetails) ? ($paymentDetails['order_reference'] ?? null) : null);
                        }
                        Log::info('Payment intent payment_details check', [
                            'has_payment_details' => $paymentDetails !== null,
                            'order_reference' => $sessionId,
                        ]);

                        if ($sessionId && is_string($sessionId) && str_starts_with($sessionId, 'cs_')) {
                            try {
                                $checkoutSession = $stripe->checkout->sessions->retrieve($sessionId);
                                Log::info('Retrieved checkout session via payment_details.order_reference', [
                                    'session_id' => $sessionId,
                                ]);
                            } catch (\Exception $e) {
                                Log::warning('Failed to retrieve checkout session by order_reference', [
                                    'session_id' => $sessionId,
                                    'error' => $e->getMessage(),
                                ]);
                            }
                        }

                        // Fallback: list checkout sessions by payment_intent
                        if (!$checkoutSession) {
                            $checkoutSessions = $stripe->checkout->sessions->all([
                                'limit' => 100,
                                'payment_intent' => $paymentIntentId,
                            ]);
                            if (count($checkoutSessions->data) > 0) {
                                $checkoutSession = $checkoutSessions->data[0];
                            }
                        }

                        if ($checkoutSession) {
                            $sessionMetadata = $checkoutSession->metadata;
                            if (is_object($sessionMetadata) && method_exists($sessionMetadata, 'toArray')) {
                                $sessionMetadata = $sessionMetadata->toArray();
                            } elseif (is_object($sessionMetadata)) {
                                $sessionMetadata = (array) $sessionMetadata;
                            }
                            Log::info('Found checkout session for payment intent', [
                                'session_id' => $checkoutSession->id,
                                'metadata' => $sessionMetadata,
                            ]);
                            if (isset($sessionMetadata['booking_id'])) {
                                $bookingId = (int) $sessionMetadata['booking_id'];
                                Log::info('Found booking_id in checkout session metadata', ['booking_id' => $bookingId]);
                            } else {
                                Log::warning('Checkout session has no booking_id in metadata', [
                                    'session_id' => $checkoutSession->id,
                                    'metadata_keys' => is_array($sessionMetadata) ? array_keys($sessionMetadata) : [],
                                ]);
                            }
                        } else {
                            Log::warning('No checkout session found for payment intent', ['payment_intent_id' => $paymentIntentId]);
                        }
                    }
                    
                    if ($bookingId) {
                        $payments = $this->paymentRepository->findByPayable(\App\Models\Booking::class, (string) $bookingId);
                        
                        Log::info('Found payments for booking', [
                            'booking_id' => $bookingId,
                            'payment_count' => count($payments),
                        ]);
                        
                        // Find the payment that matches this booking and is in pending/processing status
                        foreach ($payments as $p) {
                            if (in_array($p->status()->toString(), ['pending', 'processing'])) {
                                Log::info('Updating payment with checkout session payment intent ID', [
                                    'payment_id' => $p->id(),
                                    'old_transaction_id' => $p->transactionId(),
                                    'new_transaction_id' => $paymentIntentId,
                                ]);
                                
                                // Update this payment with the checkout session's payment intent ID
                                $this->paymentRepository->updateTransactionAndStatus(
                                    $p->id(),
                                    $paymentIntentId,
                                    \App\Domain\Payment\ValueObjects\PaymentStatus::PROCESSING,
                                    [
                                        'payment_intent_id' => $paymentIntentId,
                                        'checkout_payment_intent_id' => $paymentIntentId, // Mark as from checkout
                                    ]
                                );
                                $payment = $this->paymentRepository->findById($p->id());
                                break;
                            }
                        }
                    } else {
                        Log::warning('Could not find booking_id in payment intent or checkout session metadata', [
                            'payment_intent_id' => $paymentIntentId,
                        ]);
                    }
                } catch (\Exception $e) {
                    Log::error('Failed to find payment by metadata or checkout session', [
                        'payment_intent_id' => $paymentIntentId,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString(),
                    ]);
                }
            }

            if (!$payment) {
                return [
                    'success' => false,
                    'error' => 'Payment not found.',
                ];
            }

            // Check if payment is already completed
            if ($payment->status()->isCompleted()) {
                Log::info('Payment is already completed, returning existing data', [
                    'payment_intent_id' => $paymentIntentId,
                    'payment_id' => $payment->id(),
                ]);
                
                $bookingId = (int) $payment->payableId();
                $booking = $this->bookingRepository->findById($bookingId);
                
                if ($booking) {
                    return [
                        'success' => true,
                        'booking' => $booking->load(['package', 'participants', 'schedules.trainer', 'payments']),
                        'payment' => $payment,
                    ];
                } else {
                    Log::warning('Payment is completed but booking not found', [
                        'payment_intent_id' => $paymentIntentId,
                        'payment_id' => $payment->id(),
                        'booking_id' => $bookingId,
                    ]);
                    return [
                        'success' => false,
                        'error' => 'Booking not found for completed payment.',
                    ];
                }
            }

            // Check payment status with Stripe
            Log::info('Checking payment status with Stripe', [
                'payment_intent_id' => $paymentIntentId,
                'payment_id' => $payment->id(),
                'current_status' => $payment->status()->toString(),
            ]);

            $statusResult = $this->paymentService->getPaymentStatus($paymentIntentId);

            Log::info('Payment status check result', [
                'payment_intent_id' => $paymentIntentId,
                'success' => $statusResult['success'] ?? false,
                'status' => $statusResult['status'] ?? 'unknown',
                'error' => $statusResult['error'] ?? null,
            ]);

            if (!$statusResult['success']) {
                Log::error('Failed to get payment status from Stripe', [
                    'payment_intent_id' => $paymentIntentId,
                    'error' => $statusResult['error'] ?? 'Unknown error',
                ]);
                return [
                    'success' => false,
                    'error' => $statusResult['error'] ?? 'Failed to verify payment status.',
                ];
            }

            // If payment is completed, update records
            if ($statusResult['status'] === 'completed') {
                Log::info('Payment is completed, updating records', [
                    'payment_intent_id' => $paymentIntentId,
                    'payment_id' => $payment->id(),
                ]);
                // Update payment status using repository
                $this->paymentRepository->updateStatus(
                    $payment->id(),
                    PaymentStatusVO::COMPLETED,
                    now()->toIso8601String()
                );

                // Reload payment to get updated entity
                $updatedPayment = $this->paymentRepository->findById($payment->id());
                if (!$updatedPayment) {
                    return [
                        'success' => false,
                        'error' => 'Failed to reload payment after update.',
                    ];
                }

                // Update booking payment status
                $bookingId = (int) $updatedPayment->payableId();
                $booking = $this->bookingRepository->findById($bookingId);
                
                if (!$booking) {
                    return [
                        'success' => false,
                        'error' => 'Booking not found for payment.',
                    ];
                }

                $newPaidAmount = $booking->paid_amount + $updatedPayment->amount();
                $booking->paid_amount = $newPaidAmount;

                // Update payment status
                if ($newPaidAmount >= ($booking->total_price - $booking->discount_amount)) {
                    $booking->payment_status = PaymentStatus::PAID;
                } elseif ($newPaidAmount > 0) {
                    $booking->payment_status = PaymentStatus::PARTIAL;
                }

                // Update booking status to CONFIRMED if payment is successful and booking is in DRAFT or PENDING
                if (in_array($booking->status, [Booking::STATUS_DRAFT, Booking::STATUS_PENDING])) {
                    $booking->status = Booking::STATUS_CONFIRMED;
                }

                $booking->save();

                Log::info('Payment confirmed', [
                    'payment_id' => $updatedPayment->id(),
                    'booking_id' => $booking->id,
                    'amount' => $updatedPayment->amount(),
                ]);

                // Notify admin (and parent via SendPaymentConfirmationNotification) for any completed payment, including top-ups
                event(new PaymentCompleted($booking));

                return [
                    'success' => true,
                    'booking' => $booking->load(['package', 'participants', 'schedules.trainer', 'payments']),
                    'payment' => $updatedPayment,
                ];
            }

            // Payment is still pending/processing
            Log::warning('Payment is not completed yet', [
                'payment_intent_id' => $paymentIntentId,
                'payment_id' => $payment->id(),
                'status' => $statusResult['status'],
            ]);

            if ($statusResult['status'] === 'processing') {
                $this->paymentRepository->updateStatus(
                    $payment->id(),
                    PaymentStatusVO::PROCESSING
                );
            }

            return [
                'success' => false,
                'error' => 'Payment is not yet completed. Status: ' . $statusResult['status'],
            ];
        });
    }
}

