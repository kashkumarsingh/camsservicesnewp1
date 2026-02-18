<?php

namespace App\ValueObjects\Booking;

/**
 * Booking Reference Value Object
 * 
 * Clean Architecture: Domain Layer (Value Object)
 * Purpose: Immutable booking reference value object
 * Location: backend/app/ValueObjects/Booking/BookingReference.php
 * 
 * This value object:
 * - Validates booking reference format
 * - Generates unique booking references
 * - Ensures immutability
 * 
 * Format: CAMS-{POSTCODE}-{TYPE}-{NUMBER}
 * Example: CAMS-IG95BT-GEN-1234
 */
final readonly class BookingReference
{
    private function __construct(
        private string $value
    ) {
        $this->validate();
    }

    /**
     * Create a booking reference from a string.
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
     * Generate a new booking reference.
     *
     * @param string $postcode Postcode (e.g., "IG95BT")
     * @param string $type Type code (e.g., "GEN" for general)
     * @param int $number Sequential number
     * @return self
     */
    public static function generate(string $postcode, string $type = 'GEN', int $number = 0): self
    {
        // Clean postcode (remove spaces, uppercase)
        $cleanPostcode = strtoupper(preg_replace('/\s+/', '', $postcode));
        
        // If number is 0, generate random 4-digit number
        if ($number === 0) {
            $number = random_int(1000, 9999);
        }

        $value = sprintf('CAMS-%s-%s-%d', $cleanPostcode, strtoupper($type), $number);
        
        return new self($value);
    }

    /**
     * Get the reference value.
     *
     * @return string
     */
    public function value(): string
    {
        return $this->value;
    }

    /**
     * Get the reference as a string.
     *
     * @return string
     */
    public function toString(): string
    {
        return $this->value;
    }

    /**
     * Validate the booking reference format.
     *
     * @return void
     * @throws \InvalidArgumentException
     */
    private function validate(): void
    {
        // Format: CAMS-{POSTCODE}-{TYPE}-{NUMBER}
        // Example: CAMS-IG95BT-GEN-1234
        $pattern = '/^CAMS-[A-Z0-9]{4,10}-[A-Z]{2,5}-\d{4,6}$/';
        
        if (!preg_match($pattern, $this->value)) {
            throw new \InvalidArgumentException(
                "Invalid booking reference format. Expected: CAMS-{POSTCODE}-{TYPE}-{NUMBER}"
            );
        }
    }

    /**
     * Check if two references are equal.
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

