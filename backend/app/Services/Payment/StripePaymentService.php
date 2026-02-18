<?php

namespace App\Services\Payment;

use App\Contracts\Payment\IPaymentService;
use Stripe\StripeClient;
use Stripe\Exception\ApiErrorException;
use Illuminate\Support\Facades\Log;

/**
 * Stripe Payment Service
 * 
 * Clean Architecture: Infrastructure Layer (Payment Gateway Adapter)
 * Purpose: Implements IPaymentService using Stripe API
 * Location: backend/app/Services/Payment/StripePaymentService.php
 * 
 * This service:
 * - Handles Stripe API communication
 * - Creates payment intents and checkout sessions
 * - Processes webhooks
 * - Handles refunds
 */
class StripePaymentService implements IPaymentService
{
    /** Message shown to parents when Stripe is not configured (no technical jargon). */
    private const STRIPE_NOT_CONFIGURED_MESSAGE = 'Payment is temporarily unavailable. Please try again later or contact us.';

    private ?StripeClient $stripe = null;

    public function __construct()
    {
        $apiKey = config('services.stripe.secret_key');
        $apiKey = is_string($apiKey) ? trim($apiKey) : $apiKey;

        if ($apiKey === '' || $apiKey === null) {
            // In testing or when keys are not configured, allow service to be instantiated
            // but methods will fail gracefully - this allows validation tests to run
            Log::warning('Stripe secret key not configured', [
                'config_key' => 'services.stripe.secret_key',
                'env_key' => 'STRIPE_SECRET_KEY',
                'has_value' => !empty(env('STRIPE_SECRET_KEY')),
            ]);
            $this->stripe = null;
            return;
        }

        try {
            $this->stripe = new StripeClient($apiKey);
            Log::debug('Stripe client initialized successfully', [
                'key_prefix' => substr($apiKey, 0, 7) . '...' . substr($apiKey, -4),
            ]);
        } catch (\Exception $e) {
            // If Stripe client creation fails, set to null (methods will handle gracefully)
            Log::error('Failed to initialize Stripe client', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            $this->stripe = null;
        }
    }

    /**
     * Create a payment intent for Stripe.
     */
    public function createPaymentIntent(
        float $amount,
        string $currency,
        string $paymentMethod,
        array $metadata = []
    ): array {
        if (!$this->stripe) {
            return [
                'success' => false,
                'error' => self::STRIPE_NOT_CONFIGURED_MESSAGE,
            ];
        }
        
        try {
            // Convert amount to cents (Stripe uses smallest currency unit)
            $amountInCents = (int) round($amount * 100);

            // Create Payment Intent
            // Note: Cannot use both 'payment_method_types' and 'automatic_payment_methods'
            // Using 'automatic_payment_methods' for flexibility (Stripe will enable available methods)
            $paymentIntent = $this->stripe->paymentIntents->create([
                'amount' => $amountInCents,
                'currency' => strtolower($currency),
                'metadata' => $metadata,
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
            ]);

            return [
                'success' => true,
                'payment_intent_id' => $paymentIntent->id,
                'client_secret' => $paymentIntent->client_secret,
            ];
        } catch (ApiErrorException $e) {
            Log::error('Stripe payment intent creation failed', [
                'error' => $e->getMessage(),
                'amount' => $amount,
                'currency' => $currency,
            ]);

            return [
                'success' => false,
                'error' => 'Failed to create payment intent: ' . $e->getMessage(),
            ];
        } catch (\Exception $e) {
            Log::error('Unexpected error creating Stripe payment intent', [
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'An unexpected error occurred. Please try again.',
            ];
        }
    }

    /**
     * Create a Stripe Checkout Session.
     * 
     * Note: Stripe Checkout automatically creates a payment intent when the session is created.
     * We retrieve and return the payment intent ID so it can be stored in our database.
     * 
     * @param float $amount Payment amount
     * @param string $currency Currency code (e.g., 'GBP')
     * @param array $metadata Additional metadata (booking_id, booking_reference, etc.)
     * @param string|null $successUrl Success redirect URL
     * @param string|null $cancelUrl Cancel redirect URL
     * @param string|null $customerEmail Customer email to pre-fill in checkout (improves UX)
     */
    public function createCheckoutSession(
        float $amount,
        string $currency,
        array $metadata = [],
        ?string $successUrl = null,
        ?string $cancelUrl = null,
        ?string $customerEmail = null
    ): array {
        if (!$this->stripe) {
            return [
                'success' => false,
                'error' => self::STRIPE_NOT_CONFIGURED_MESSAGE,
            ];
        }
        
        try {
            $amountInCents = (int) round($amount * 100);

            // Log payment intent creation parameters for debugging
            Log::info('Creating Stripe checkout session', [
                'amount' => $amount,
                'amount_in_cents' => $amountInCents,
                'currency' => $currency,
                'metadata' => $metadata,
                'has_customer_email' => !empty($customerEmail),
            ]);

            $sessionParams = [
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => strtolower($currency),
                        'product_data' => [
                            'name' => $metadata['booking_reference'] ?? 'Booking Payment',
                            'description' => 'Booking payment for ' . ($metadata['booking_reference'] ?? 'booking'),
                        ],
                        'unit_amount' => $amountInCents,
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'success_url' => $successUrl ?? config('app.url') . '/thank-you?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => $cancelUrl ?? config('app.url') . '/bookings?canceled=true',
                'metadata' => $metadata,
            ];

            // Pre-fill customer email if provided (improves UX - parent doesn't need to type email again)
            if ($customerEmail && filter_var($customerEmail, FILTER_VALIDATE_EMAIL)) {
                $sessionParams['customer_email'] = $customerEmail;
            }

            $session = $this->stripe->checkout->sessions->create($sessionParams);
            
            Log::info('Stripe checkout session created successfully', [
                'session_id' => $session->id,
                'payment_intent_id' => $session->payment_intent ?? null,
                'checkout_url' => $session->url ?? null,
            ]);

            // Retrieve the payment intent ID from the checkout session
            // Note: Stripe creates the payment intent automatically when the session is created
            $paymentIntentId = $session->payment_intent;
            
            // If payment_intent is a string ID, we're good. If it's an object, extract the ID.
            if (is_string($paymentIntentId)) {
                // Already have the ID
            } elseif (is_object($paymentIntentId) && isset($paymentIntentId->id)) {
                $paymentIntentId = $paymentIntentId->id;
            } else {
                // Payment intent might not be created yet (it's created when customer starts checkout)
                // We'll retrieve it later when confirming payment
                $paymentIntentId = null;
            }

            return [
                'success' => true,
                'checkout_url' => $session->url,
                'session_id' => $session->id,
                'payment_intent_id' => $paymentIntentId, // Payment intent created by Stripe Checkout
            ];
        } catch (ApiErrorException $e) {
            // Log detailed Stripe error information
            Log::error('Stripe checkout session creation failed', [
                'error' => $e->getMessage(),
                'error_type' => get_class($e),
                'stripe_error_type' => $e->getStripeCode() ?? null,
                'stripe_error_code' => $e->getStripeErrorCode() ?? null,
                'http_status' => $e->getHttpStatus() ?? null,
                'amount' => $amount,
                'amount_in_cents' => $amountInCents ?? null,
                'currency' => $currency,
                'metadata' => $metadata,
                'trace' => $e->getTraceAsString(),
            ]);

            // Return detailed error message for debugging
            $errorMessage = 'Failed to create checkout session';
            if ($e->getStripeErrorCode()) {
                $errorMessage .= ': ' . $e->getStripeErrorCode() . ' - ' . $e->getMessage();
            } else {
                $errorMessage .= ': ' . $e->getMessage();
            }

            return [
                'success' => false,
                'error' => $errorMessage,
            ];
        } catch (\Exception $e) {
            Log::error('Unexpected error creating Stripe checkout session', [
                'error' => $e->getMessage(),
                'error_type' => get_class($e),
                'amount' => $amount,
                'currency' => $currency,
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'error' => 'An unexpected error occurred while creating checkout session: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Confirm a payment intent.
     */
    public function confirmPayment(string $paymentIntentId): array
    {
        if (!$this->stripe) {
            return [
                'success' => false,
                'error' => self::STRIPE_NOT_CONFIGURED_MESSAGE,
            ];
        }
        
        try {
            $paymentIntent = $this->stripe->paymentIntents->retrieve($paymentIntentId);

            if ($paymentIntent->status === 'succeeded') {
                return [
                    'success' => true,
                    'transaction_id' => $paymentIntent->id,
                    'status' => 'completed',
                ];
            }

            if ($paymentIntent->status === 'requires_payment_method') {
                return [
                    'success' => false,
                    'error' => 'Payment method is required.',
                ];
            }

            return [
                'success' => false,
                'error' => 'Payment is not yet confirmed. Status: ' . $paymentIntent->status,
            ];
        } catch (ApiErrorException $e) {
            Log::error('Stripe payment confirmation failed', [
                'payment_intent_id' => $paymentIntentId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'Failed to confirm payment: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Get payment status.
     */
    public function getPaymentStatus(string $paymentIntentId): array
    {
        if (!$this->stripe) {
            return [
                'success' => false,
                'error' => self::STRIPE_NOT_CONFIGURED_MESSAGE,
            ];
        }
        
        try {
            $paymentIntent = $this->stripe->paymentIntents->retrieve($paymentIntentId);

            $status = match ($paymentIntent->status) {
                'succeeded' => 'completed',
                'processing' => 'processing',
                'requires_payment_method', 'requires_confirmation', 'requires_action' => 'pending',
                'canceled' => 'cancelled',
                default => 'failed',
            };

            return [
                'success' => true,
                'status' => $status,
                'transaction_id' => $paymentIntent->id,
            ];
        } catch (ApiErrorException $e) {
            Log::error('Stripe payment status retrieval failed', [
                'payment_intent_id' => $paymentIntentId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'Failed to retrieve payment status: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Get payment intent ID from checkout session ID.
     * 
     * @param string $sessionId
     * @return array{success: bool, payment_intent_id?: string, error?: string}
     */
    public function getPaymentIntentFromSession(string $sessionId): array
    {
        if (!$this->stripe) {
            return [
                'success' => false,
                'error' => self::STRIPE_NOT_CONFIGURED_MESSAGE,
            ];
        }
        
        try {
            $session = $this->stripe->checkout->sessions->retrieve($sessionId);
            
            // Checkout sessions in 'payment' mode have a payment_intent
            if ($session->payment_intent) {
                return [
                    'success' => true,
                    'payment_intent_id' => is_string($session->payment_intent) 
                        ? $session->payment_intent 
                        : $session->payment_intent->id,
                ];
            }
            
            return [
                'success' => false,
                'error' => 'No payment intent found in checkout session.',
            ];
        } catch (ApiErrorException $e) {
            Log::error('Failed to retrieve payment intent from session', [
                'session_id' => $sessionId,
                'error' => $e->getMessage(),
            ]);
            
            return [
                'success' => false,
                'error' => 'Failed to retrieve payment intent: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Get the Stripe receipt URL for a payment intent (for parent invoice link).
     * Returns the charge receipt_url if the payment has succeeded.
     *
     * @param string $paymentIntentId Stripe PaymentIntent id (e.g. pi_xxx)
     * @return string|null Receipt URL or null if not available
     */
    public function getReceiptUrl(string $paymentIntentId): ?string
    {
        if (!$this->stripe) {
            return null;
        }

        try {
            $paymentIntent = $this->stripe->paymentIntents->retrieve($paymentIntentId);
            $chargeId = $paymentIntent->latest_charge ?? null;
            if (!$chargeId) {
                return null;
            }
            $chargeId = is_string($chargeId) ? $chargeId : $chargeId->id;
            $charge = $this->stripe->charges->retrieve($chargeId);
            $url = $charge->receipt_url ?? null;
            return is_string($url) && $url !== '' ? $url : null;
        } catch (ApiErrorException $e) {
            Log::warning('Stripe receipt URL retrieval failed', [
                'payment_intent_id' => $paymentIntentId,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Refund a payment.
     */
    public function refundPayment(string $transactionId, ?float $amount = null): array
    {
        if (!$this->stripe) {
            return [
                'success' => false,
                'error' => self::STRIPE_NOT_CONFIGURED_MESSAGE,
            ];
        }
        
        try {
            $params = [
                'payment_intent' => $transactionId,
            ];

            if ($amount !== null) {
                $params['amount'] = (int) round($amount * 100);
            }

            $refund = $this->stripe->refunds->create($params);

            return [
                'success' => true,
                'refund_id' => $refund->id,
            ];
        } catch (ApiErrorException $e) {
            Log::error('Stripe refund failed', [
                'transaction_id' => $transactionId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'Failed to process refund: ' . $e->getMessage(),
            ];
        }
    }
}

