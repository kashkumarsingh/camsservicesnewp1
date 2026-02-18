<?php

namespace App\Contracts\Payment;

/**
 * Payment Service Interface
 * 
 * Clean Architecture: Domain Layer (Contract)
 * Purpose: Defines the contract for payment processing
 * Location: backend/app/Contracts/Payment/IPaymentService.php
 * 
 * This interface:
 * - Defines payment processing methods
 * - Is independent of payment provider (Stripe, PayPal, etc.)
 * - Allows switching payment providers without changing business logic
 */
interface IPaymentService
{
    /**
     * Create a payment intent/checkout session.
     *
     * @param float $amount Payment amount
     * @param string $currency Currency code (e.g., 'GBP')
     * @param string $paymentMethod Payment method ('stripe', 'paypal', etc.)
     * @param array $metadata Additional metadata (booking_id, booking_reference, etc.)
     * @return array{success: bool, payment_intent_id?: string, client_secret?: string, checkout_url?: string, error?: string}
     */
    public function createPaymentIntent(
        float $amount,
        string $currency,
        string $paymentMethod,
        array $metadata = []
    ): array;

    /**
     * Create a Stripe Checkout Session.
     *
     * @param float $amount Payment amount
     * @param string $currency Currency code (e.g., 'GBP')
     * @param array $metadata Additional metadata (booking_id, booking_reference, etc.)
     * @param string|null $successUrl Success redirect URL
     * @param string|null $cancelUrl Cancel redirect URL
     * @param string|null $customerEmail Customer email to pre-fill in checkout
     * @return array{success: bool, checkout_url?: string, session_id?: string, payment_intent_id?: string, error?: string}
     */
    public function createCheckoutSession(
        float $amount,
        string $currency,
        array $metadata = [],
        ?string $successUrl = null,
        ?string $cancelUrl = null,
        ?string $customerEmail = null
    ): array;

    /**
     * Confirm a payment (after client-side confirmation).
     *
     * @param string $paymentIntentId Payment intent ID
     * @return array{success: bool, transaction_id?: string, status?: string, error?: string}
     */
    public function confirmPayment(string $paymentIntentId): array;

    /**
     * Get payment status.
     *
     * @param string $paymentIntentId Payment intent ID
     * @return array{success: bool, status?: string, transaction_id?: string, error?: string}
     */
    public function getPaymentStatus(string $paymentIntentId): array;

    /**
     * Get payment intent ID from checkout session ID.
     *
     * @param string $sessionId Stripe checkout session ID
     * @return array{success: bool, payment_intent_id?: string, error?: string}
     */
    public function getPaymentIntentFromSession(string $sessionId): array;

    /**
     * Refund a payment.
     *
     * @param string $transactionId Transaction ID
     * @param float|null $amount Refund amount (null = full refund)
     * @return array{success: bool, refund_id?: string, error?: string}
     */
    public function refundPayment(string $transactionId, ?float $amount = null): array;
}

