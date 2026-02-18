<?php

namespace App\Domain\Payment\ValueObjects;

/**
 * Payment Status Value Object
 * 
 * Clean Architecture: Domain Layer (Value Object)
 * Purpose: Immutable payment status value object
 * Location: backend/app/Domain/Payment/ValueObjects/PaymentStatus.php
 * 
 * This value object:
 * - Validates payment status values
 * - Provides status constants
 * - Ensures immutability
 */
final readonly class PaymentStatus
{
    public const PENDING = 'pending';
    public const PROCESSING = 'processing';
    public const COMPLETED = 'completed';
    public const FAILED = 'failed';
    public const CANCELLED = 'cancelled';
    public const REFUNDED = 'refunded';

    private const VALID_STATUSES = [
        self::PENDING,
        self::PROCESSING,
        self::COMPLETED,
        self::FAILED,
        self::CANCELLED,
        self::REFUNDED,
    ];

    private function __construct(
        private string $value
    ) {
        $this->validate();
    }

    /**
     * Create a payment status from a string.
     */
    public static function fromString(string $value): self
    {
        return new self($value);
    }

    public static function pending(): self
    {
        return new self(self::PENDING);
    }

    public static function processing(): self
    {
        return new self(self::PROCESSING);
    }

    public static function completed(): self
    {
        return new self(self::COMPLETED);
    }

    public static function failed(): self
    {
        return new self(self::FAILED);
    }

    public static function cancelled(): self
    {
        return new self(self::CANCELLED);
    }

    public static function refunded(): self
    {
        return new self(self::REFUNDED);
    }

    public function value(): string
    {
        return $this->value;
    }

    public function toString(): string
    {
        return $this->value;
    }

    public function isPending(): bool
    {
        return $this->value === self::PENDING;
    }

    public function isProcessing(): bool
    {
        return $this->value === self::PROCESSING;
    }

    public function isCompleted(): bool
    {
        return $this->value === self::COMPLETED;
    }

    public function isFailed(): bool
    {
        return $this->value === self::FAILED;
    }

    public function isCancelled(): bool
    {
        return $this->value === self::CANCELLED;
    }

    public function isRefunded(): bool
    {
        return $this->value === self::REFUNDED;
    }

    public static function all(): array
    {
        return self::VALID_STATUSES;
    }

    private function validate(): void
    {
        if (!in_array($this->value, self::VALID_STATUSES, true)) {
            throw new \InvalidArgumentException(
                "Invalid payment status: {$this->value}. Valid statuses: " . implode(', ', self::VALID_STATUSES)
            );
        }
    }

    public function equals(self $other): bool
    {
        return $this->value === $other->value;
    }

    public function __toString(): string
    {
        return $this->value;
    }
}

