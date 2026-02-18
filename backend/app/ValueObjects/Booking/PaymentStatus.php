<?php

namespace App\ValueObjects\Booking;

/**
 * Payment Status Value Object
 * 
 * Clean Architecture: Domain Layer (Value Object)
 * Purpose: Immutable payment status value object
 * Location: backend/app/ValueObjects/Booking/PaymentStatus.php
 * 
 * This value object:
 * - Validates payment status values
 * - Provides status constants
 * - Ensures immutability
 */
final readonly class PaymentStatus
{
    public const PENDING = 'pending';
    public const PARTIAL = 'partial';
    public const PAID = 'paid';
    public const REFUNDED = 'refunded';
    public const FAILED = 'failed';

    private const VALID_STATUSES = [
        self::PENDING,
        self::PARTIAL,
        self::PAID,
        self::REFUNDED,
        self::FAILED,
    ];

    private function __construct(
        private string $value
    ) {
        $this->validate();
    }

    /**
     * Create a payment status from a string.
     *
     * @param string $value
     * @return self
     * @throws \InvalidArgumentException
     */
    public static function fromString(string $value): self
    {
        return new self($value);
    }

    /**
     * Create a pending status.
     *
     * @return self
     */
    public static function pending(): self
    {
        return new self(self::PENDING);
    }

    /**
     * Create a partial status.
     *
     * @return self
     */
    public static function partial(): self
    {
        return new self(self::PARTIAL);
    }

    /**
     * Create a paid status.
     *
     * @return self
     */
    public static function paid(): self
    {
        return new self(self::PAID);
    }

    /**
     * Create a refunded status.
     *
     * @return self
     */
    public static function refunded(): self
    {
        return new self(self::REFUNDED);
    }

    /**
     * Create a failed status.
     *
     * @return self
     */
    public static function failed(): self
    {
        return new self(self::FAILED);
    }

    /**
     * Get the status value.
     *
     * @return string
     */
    public function value(): string
    {
        return $this->value;
    }

    /**
     * Get the status as a string.
     *
     * @return string
     */
    public function toString(): string
    {
        return $this->value;
    }

    /**
     * Check if the status is pending.
     *
     * @return bool
     */
    public function isPending(): bool
    {
        return $this->value === self::PENDING;
    }

    /**
     * Check if the status is partial.
     *
     * @return bool
     */
    public function isPartial(): bool
    {
        return $this->value === self::PARTIAL;
    }

    /**
     * Check if the status is paid.
     *
     * @return bool
     */
    public function isPaid(): bool
    {
        return $this->value === self::PAID;
    }

    /**
     * Check if the status is refunded.
     *
     * @return bool
     */
    public function isRefunded(): bool
    {
        return $this->value === self::REFUNDED;
    }

    /**
     * Check if the status is failed.
     *
     * @return bool
     */
    public function isFailed(): bool
    {
        return $this->value === self::FAILED;
    }

    /**
     * Check if payment is complete (paid or refunded).
     *
     * @return bool
     */
    public function isComplete(): bool
    {
        return $this->isPaid() || $this->isRefunded();
    }

    /**
     * Get all valid statuses.
     *
     * @return array<string>
     */
    public static function all(): array
    {
        return self::VALID_STATUSES;
    }

    /**
     * Validate the payment status value.
     *
     * @return void
     * @throws \InvalidArgumentException
     */
    private function validate(): void
    {
        if (!in_array($this->value, self::VALID_STATUSES, true)) {
            throw new \InvalidArgumentException(
                "Invalid payment status: {$this->value}. Valid statuses: " . implode(', ', self::VALID_STATUSES)
            );
        }
    }

    /**
     * Check if two statuses are equal.
     *
     * @param self $other
     * @return bool
     */
    public function equals(self $other): bool
    {
        return $this->value === $other->value;
    }

    /**
     * Convert to string.
     *
     * @return string
     */
    public function __toString(): string
    {
        return $this->value;
    }
}

