<?php

namespace App\ValueObjects\Booking;

/**
 * Session Status Value Object
 * 
 * Clean Architecture: Domain Layer (Value Object)
 * Purpose: Immutable session status value object
 * Location: backend/app/ValueObjects/Booking/SessionStatus.php
 * 
 * This value object:
 * - Validates session status values
 * - Provides status constants
 * - Ensures immutability
 */
final readonly class SessionStatus
{
    public const SCHEDULED = 'scheduled';
    public const COMPLETED = 'completed';
    public const CANCELLED = 'cancelled';
    public const NO_SHOW = 'no_show';
    public const RESCHEDULED = 'rescheduled';

    private const VALID_STATUSES = [
        self::SCHEDULED,
        self::COMPLETED,
        self::CANCELLED,
        self::NO_SHOW,
        self::RESCHEDULED,
    ];

    private function __construct(
        private string $value
    ) {
        $this->validate();
    }

    /**
     * Create a session status from a string.
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
     * Create a scheduled status.
     *
     * @return self
     */
    public static function scheduled(): self
    {
        return new self(self::SCHEDULED);
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
     * Create a cancelled status.
     *
     * @return self
     */
    public static function cancelled(): self
    {
        return new self(self::CANCELLED);
    }

    /**
     * Create a no-show status.
     *
     * @return self
     */
    public static function noShow(): self
    {
        return new self(self::NO_SHOW);
    }

    /**
     * Create a rescheduled status.
     *
     * @return self
     */
    public static function rescheduled(): self
    {
        return new self(self::RESCHEDULED);
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
     * Check if the status is scheduled.
     *
     * @return bool
     */
    public function isScheduled(): bool
    {
        return $this->value === self::SCHEDULED;
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
     * Check if the status is cancelled.
     *
     * @return bool
     */
    public function isCancelled(): bool
    {
        return $this->value === self::CANCELLED;
    }

    /**
     * Check if the status is no-show.
     *
     * @return bool
     */
    public function isNoShow(): bool
    {
        return $this->value === self::NO_SHOW;
    }

    /**
     * Check if the status is rescheduled.
     *
     * @return bool
     */
    public function isRescheduled(): bool
    {
        return $this->value === self::RESCHEDULED;
    }

    /**
     * Check if the session is active (scheduled or rescheduled).
     *
     * @return bool
     */
    public function isActive(): bool
    {
        return $this->isScheduled() || $this->isRescheduled();
    }

    /**
     * Check if the session is finished (completed, cancelled, or no-show).
     *
     * @return bool
     */
    public function isFinished(): bool
    {
        return $this->isCompleted() || $this->isCancelled() || $this->isNoShow();
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
     * Validate the session status value.
     *
     * @return void
     * @throws \InvalidArgumentException
     */
    private function validate(): void
    {
        if (!in_array($this->value, self::VALID_STATUSES, true)) {
            throw new \InvalidArgumentException(
                "Invalid session status: {$this->value}. Valid statuses: " . implode(', ', self::VALID_STATUSES)
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

