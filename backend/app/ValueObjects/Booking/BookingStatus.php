<?php

namespace App\ValueObjects\Booking;

/**
 * Booking Status Value Object
 * 
 * Clean Architecture: Domain Layer (Value Object)
 * Purpose: Immutable booking status value object
 * Location: backend/app/ValueObjects/Booking/BookingStatus.php
 * 
 * This value object:
 * - Validates booking status values
 * - Provides status constants
 * - Ensures immutability
 */
final readonly class BookingStatus
{
    public const DRAFT = 'draft';
    public const PENDING = 'pending';
    public const CONFIRMED = 'confirmed';
    public const CANCELLED = 'cancelled';
    public const COMPLETED = 'completed';

    private const VALID_STATUSES = [
        self::DRAFT,
        self::PENDING,
        self::CONFIRMED,
        self::CANCELLED,
        self::COMPLETED,
    ];

    private function __construct(
        private string $value
    ) {
        $this->validate();
    }

    /**
     * Create a booking status from a string.
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
     * Create a draft status.
     *
     * @return self
     */
    public static function draft(): self
    {
        return new self(self::DRAFT);
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
     * Create a confirmed status.
     *
     * @return self
     */
    public static function confirmed(): self
    {
        return new self(self::CONFIRMED);
    }

    /**
     * Create a cancelled status.
     *
     * @return self
     */
    public static function cancelled(): self
    {
        return new self(self::CANCELLED);
    }

    /**
     * Create a completed status.
     *
     * @return self
     */
    public static function completed(): self
    {
        return new self(self::COMPLETED);
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
     * Check if the status is draft.
     *
     * @return bool
     */
    public function isDraft(): bool
    {
        return $this->value === self::DRAFT;
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
     * Check if the status is confirmed.
     *
     * @return bool
     */
    public function isConfirmed(): bool
    {
        return $this->value === self::CONFIRMED;
    }

    /**
     * Check if the status is cancelled.
     *
     * @return bool
     */
    public function isCancelled(): bool
    {
        return $this->value === self::CANCELLED;
    }

    /**
     * Check if the status is completed.
     *
     * @return bool
     */
    public function isCompleted(): bool
    {
        return $this->value === self::COMPLETED;
    }

    /**
     * Check if the status can be cancelled.
     *
     * @return bool
     */
    public function canBeCancelled(): bool
    {
        return in_array($this->value, [self::DRAFT, self::PENDING, self::CONFIRMED]);
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
     * Validate the booking status value.
     *
     * @return void
     * @throws \InvalidArgumentException
     */
    private function validate(): void
    {
        if (!in_array($this->value, self::VALID_STATUSES, true)) {
            throw new \InvalidArgumentException(
                "Invalid booking status: {$this->value}. Valid statuses: " . implode(', ', self::VALID_STATUSES)
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

