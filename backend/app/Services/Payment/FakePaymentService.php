<?php

namespace App\Services\Payment;

use App\Contracts\Payment\IPaymentService;

/**
 * Fake Payment Service (Testing Only)
 *
 * Clean Architecture: Infrastructure Layer (Test Adapter)
 * Purpose: Provide a deterministic, Stripe-free implementation of IPaymentService
 *          for the testing environment so feature tests don't depend on
 *          external Stripe connectivity.
 */
class FakePaymentService implements IPaymentService
{
    /**
     * Create a fake payment intent.
     */
    public function createPaymentIntent(
        float $amount,
        string $currency,
        string $paymentMethod,
        array $metadata = []
    ): array {
        return [
            'success' => true,
            'payment_intent_id' => 'pi_fake_' . uniqid(),
            'client_secret' => 'cs_fake_' . uniqid(),
        ];
    }

    /**
     * Confirm a fake payment.
     */
    public function confirmPayment(string $paymentIntentId): array
    {
        return [
            'success' => true,
            'transaction_id' => $paymentIntentId,
            'status' => 'completed',
        ];
    }

    /**
     * Get fake payment status.
     */
    public function getPaymentStatus(string $paymentIntentId): array
    {
        return [
            'success' => true,
            'status' => 'completed',
            'transaction_id' => $paymentIntentId,
        ];
    }

    /**
     * Refund a fake payment.
     */
    public function refundPayment(string $transactionId, ?float $amount = null): array
    {
        return [
            'success' => true,
            'refund_id' => 're_fake_' . uniqid(),
        ];
    }
}


