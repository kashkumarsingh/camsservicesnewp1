<?php

namespace App\Domain\Payment\Entities;

use App\Domain\Payment\ValueObjects\PaymentMethod;
use App\Domain\Payment\ValueObjects\PaymentStatus;

/**
 * Payment Entity
 * 
 * Clean Architecture: Domain Layer (Entity)
 * Purpose: Represents a payment transaction in the system
 * Location: backend/app/Domain/Payment/Entities/Payment.php
 * 
 * This entity:
 * - Is independent of Booking domain
 * - Can be used for any payable entity (Booking, Subscription, etc.)
 * - Contains payment business logic
 * - Is immutable (value objects for status/method)
 */
final class Payment
{
    private function __construct(
        private readonly string $id,
        private readonly float $amount,
        private readonly string $currency,
        private readonly PaymentMethod $method,
        private readonly PaymentStatus $status,
        private readonly ?string $paymentProvider,
        private readonly ?string $transactionId,
        private readonly ?string $payableType,  // e.g., 'App\Models\Booking'
        private readonly ?string $payableId,    // e.g., booking ID
        private readonly ?string $metadata,
        private readonly ?string $failureReason,
        private readonly ?string $processedAt,
        private readonly ?string $failedAt,
        private readonly ?string $refundedAt,
        private readonly int $retryCount,
        private readonly ?string $lastRetryAt,
        private readonly string $createdAt,
        private readonly string $updatedAt,
    ) {
    }

    public static function create(
        string $id,
        float $amount,
        string $currency,
        PaymentMethod $method,
        PaymentStatus $status,
        ?string $paymentProvider = null,
        ?string $transactionId = null,
        ?string $payableType = null,
        ?string $payableId = null,
        ?string $metadata = null,
        ?string $failureReason = null,
        ?string $processedAt = null,
        ?string $failedAt = null,
        ?string $refundedAt = null,
        int $retryCount = 0,
        ?string $lastRetryAt = null,
        string $createdAt = null,
        string $updatedAt = null,
    ): self {
        return new self(
            $id,
            $amount,
            $currency,
            $method,
            $status,
            $paymentProvider,
            $transactionId,
            $payableType,
            $payableId,
            $metadata,
            $failureReason,
            $processedAt,
            $failedAt,
            $refundedAt,
            $retryCount,
            $lastRetryAt,
            $createdAt ?? now()->toIso8601String(),
            $updatedAt ?? now()->toIso8601String(),
        );
    }

    public function id(): string
    {
        return $this->id;
    }

    public function amount(): float
    {
        return $this->amount;
    }

    public function currency(): string
    {
        return $this->currency;
    }

    public function method(): PaymentMethod
    {
        return $this->method;
    }

    public function status(): PaymentStatus
    {
        return $this->status;
    }

    public function paymentProvider(): ?string
    {
        return $this->paymentProvider;
    }

    public function transactionId(): ?string
    {
        return $this->transactionId;
    }

    public function payableType(): ?string
    {
        return $this->payableType;
    }

    public function payableId(): ?string
    {
        return $this->payableId;
    }

    public function metadata(): ?string
    {
        return $this->metadata;
    }

    public function failureReason(): ?string
    {
        return $this->failureReason;
    }

    public function processedAt(): ?string
    {
        return $this->processedAt;
    }

    public function failedAt(): ?string
    {
        return $this->failedAt;
    }

    public function refundedAt(): ?string
    {
        return $this->refundedAt;
    }

    public function retryCount(): int
    {
        return $this->retryCount;
    }

    public function lastRetryAt(): ?string
    {
        return $this->lastRetryAt;
    }

    public function createdAt(): string
    {
        return $this->createdAt;
    }

    public function updatedAt(): string
    {
        return $this->updatedAt;
    }

    /**
     * Check if payment is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status->isCompleted();
    }

    /**
     * Check if payment is pending.
     */
    public function isPending(): bool
    {
        return $this->status->isPending();
    }

    /**
     * Check if payment is failed.
     */
    public function isFailed(): bool
    {
        return $this->status->isFailed();
    }

    /**
     * Check if payment is refunded.
     */
    public function isRefunded(): bool
    {
        return $this->status->isRefunded();
    }

    /**
     * Check if payment can be retried.
     */
    public function canBeRetried(int $maxRetries = 3): bool
    {
        return $this->isFailed() && $this->retryCount < $maxRetries;
    }

    /**
     * Check if payment is a refund (negative amount).
     */
    public function isRefund(): bool
    {
        return $this->amount < 0;
    }

    /**
     * Check if payment is for a booking.
     */
    public function isForBooking(): bool
    {
        return $this->payableType === 'App\Models\Booking';
    }
}

