<?php

namespace App\Domain\Payment\ValueObjects;

/**
 * Payment Method Value Object
 * 
 * Clean Architecture: Domain Layer (Value Object)
 * Purpose: Immutable payment method value object
 * Location: backend/app/Domain/Payment/ValueObjects/PaymentMethod.php
 * 
 * This value object:
 * - Validates payment method values
 * - Provides method constants
 * - Ensures immutability
 */
final readonly class PaymentMethod
{
    public const STRIPE = 'stripe';
    public const PAYPAL = 'paypal';
    public const BANK_TRANSFER = 'bank_transfer';
    public const CASH = 'cash';
    public const OTHER = 'other';

    private const VALID_METHODS = [
        self::STRIPE,
        self::PAYPAL,
        self::BANK_TRANSFER,
        self::CASH,
        self::OTHER,
    ];

    private function __construct(
        private string $value
    ) {
        $this->validate();
    }

    /**
     * Create a payment method from a string.
     */
    public static function fromString(string $value): self
    {
        return new self($value);
    }

    public static function stripe(): self
    {
        return new self(self::STRIPE);
    }

    public static function paypal(): self
    {
        return new self(self::PAYPAL);
    }

    public static function bankTransfer(): self
    {
        return new self(self::BANK_TRANSFER);
    }

    public static function cash(): self
    {
        return new self(self::CASH);
    }

    public static function other(): self
    {
        return new self(self::OTHER);
    }

    public function value(): string
    {
        return $this->value;
    }

    public function toString(): string
    {
        return $this->value;
    }

    public function isStripe(): bool
    {
        return $this->value === self::STRIPE;
    }

    public function isPaypal(): bool
    {
        return $this->value === self::PAYPAL;
    }

    public function isBankTransfer(): bool
    {
        return $this->value === self::BANK_TRANSFER;
    }

    public function isCash(): bool
    {
        return $this->value === self::CASH;
    }

    public static function all(): array
    {
        return self::VALID_METHODS;
    }

    private function validate(): void
    {
        if (!in_array($this->value, self::VALID_METHODS, true)) {
            throw new \InvalidArgumentException(
                "Invalid payment method: {$this->value}. Valid methods: " . implode(', ', self::VALID_METHODS)
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

