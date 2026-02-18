<?php

namespace App\Domain\Payment\Repositories;

use App\Domain\Payment\Entities\Payment;

/**
 * Payment Repository Interface
 * 
 * Clean Architecture: Domain Layer (Repository Interface)
 * Purpose: Defines contract for payment data access
 * Location: backend/app/Domain/Payment/Repositories/IPaymentRepository.php
 * 
 * This interface:
 * - Defines payment data access methods
 * - Is independent of infrastructure
 * - Allows different implementations (Eloquent, API, etc.)
 */
interface IPaymentRepository
{
    /**
     * Find payment by ID.
     */
    public function findById(string $id): ?Payment;

    /**
     * Find payment by transaction ID.
     */
    public function findByTransactionId(string $transactionId): ?Payment;

    /**
     * Find payments for a payable entity (e.g., Booking).
     * 
     * @param string $payableType e.g., 'App\Models\Booking'
     * @param string $payableId e.g., booking ID
     * @return Payment[]
     */
    public function findByPayable(string $payableType, string $payableId): array;

    /**
     * Save payment (create or update).
     */
    public function save(Payment $payment): Payment;

    /**
     * Create a new payment.
     */
    public function create(array $data): Payment;

    /**
     * Update payment status.
     */
    public function updateStatus(string $id, string $status, ?string $processedAt = null): bool;

    /**
     * Update payment transaction ID and status.
     */
    public function updateTransactionAndStatus(string $id, ?string $transactionId, string $status, ?array $metadata = null): bool;

    /**
     * Mark payment as failed.
     */
    public function markAsFailed(string $id, string $reason): bool;

    /**
     * Mark payment as refunded.
     */
    public function markAsRefunded(string $id, ?string $refundedAt = null): bool;
}

