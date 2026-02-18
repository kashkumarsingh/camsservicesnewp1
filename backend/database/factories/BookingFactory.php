<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\Package;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Booking Factory
 * 
 * Clean Architecture: Infrastructure Layer (Testing)
 * Purpose: Creates test instances of Booking model
 * Location: backend/database/factories/BookingFactory.php
 */
class BookingFactory extends Factory
{
    protected $model = Booking::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Generate valid postcode (UK format: remove spaces, uppercase, alphanumeric only)
        // Use a simple alphanumeric postcode to ensure it matches the pattern
        $postcode = strtoupper($this->faker->bothify('??##??')); // e.g., AB12CD
        // Ensure postcode is 4-10 alphanumeric characters
        if (strlen($postcode) < 4) {
            $postcode = str_pad($postcode, 4, 'A', STR_PAD_RIGHT);
        }
        if (strlen($postcode) > 10) {
            $postcode = substr($postcode, 0, 10);
        }
        
        // Type must be 2-5 uppercase letters
        $packageType = $this->faker->randomElement(['EVENT', 'GEN', 'SUPPORT', 'BOOK', 'CAMP']);
        $sequence = $this->faker->unique()->numberBetween(1000, 9999);
        $reference = sprintf('CAMS-%s-%s-%d', $postcode, $packageType, $sequence);
        
        // Validate the reference format matches the pattern
        // Pattern: /^CAMS-[A-Z0-9]{4,10}-[A-Z]{2,5}-\d{4,6}$/
        if (!preg_match('/^CAMS-[A-Z0-9]{4,10}-[A-Z]{2,5}-\d{4,6}$/', $reference)) {
            // Fallback to a guaranteed valid format
            $reference = sprintf('CAMS-%s-%s-%d', 'TEST', 'GEN', $sequence);
        }

        return [
            'reference' => $reference,
            'user_id' => null,
            'is_guest_booking' => true,
            'guest_email' => $this->faker->safeEmail(),
            'guest_phone' => $this->faker->phoneNumber(),
            'package_id' => Package::factory(),
            'status' => $this->faker->randomElement([
                Booking::STATUS_DRAFT,
                Booking::STATUS_PENDING,
                Booking::STATUS_CONFIRMED,
            ]),
            'payment_status' => $this->faker->randomElement([
                Booking::PAYMENT_STATUS_PENDING,
                Booking::PAYMENT_STATUS_PARTIAL,
                Booking::PAYMENT_STATUS_PAID,
            ]),
            'parent_first_name' => $this->faker->firstName(),
            'parent_last_name' => $this->faker->lastName(),
            'parent_email' => $this->faker->safeEmail(),
            'parent_phone' => $this->faker->phoneNumber(),
            'parent_address' => $this->faker->streetAddress(),
            'parent_postcode' => $postcode,
            'parent_county' => $this->faker->city(),
            'emergency_contact' => $this->faker->phoneNumber(),
            'total_hours' => $this->faker->randomFloat(2, 5, 50),
            'booked_hours' => 0,
            'used_hours' => 0,
            'remaining_hours' => function (array $attributes) {
                return $attributes['total_hours'];
            },
            'total_price' => $this->faker->randomFloat(2, 50, 500),
            'paid_amount' => 0,
            'discount_amount' => 0,
            'discount_reason' => null,
            'payment_plan' => null,
            'installment_count' => 0,
            'next_payment_due_at' => null,
            'start_date' => $this->faker->dateTimeBetween('now', '+1 month'),
            'package_expires_at' => $this->faker->dateTimeBetween('+1 month', '+6 months'),
            'hours_expires_at' => $this->faker->dateTimeBetween('+1 month', '+6 months'),
            'allow_hour_rollover' => false,
            'created_by_admin' => false,
            'admin_notes' => null,
            'notes' => null,
            'cancellation_reason' => null,
            'cancelled_at' => null,
            'ip_address' => $this->faker->ipv4(),
            'user_agent' => $this->faker->userAgent(),
            'calculated_fields' => null,
        ];
    }

    /**
     * Indicate that the booking is for a logged-in user.
     */
    public function forUser(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => $user->id,
            'is_guest_booking' => false,
            'guest_email' => null,
            'guest_phone' => null,
        ]);
    }

    /**
     * Indicate that the booking is confirmed.
     */
    public function confirmed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Booking::STATUS_CONFIRMED,
        ]);
    }

    /**
     * Indicate that the booking is cancelled.
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Booking::STATUS_CANCELLED,
            'cancelled_at' => now(),
            'cancellation_reason' => 'Test cancellation',
        ]);
    }

    /**
     * Indicate that the booking is paid.
     */
    public function paid(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'payment_status' => Booking::PAYMENT_STATUS_PAID,
                'paid_amount' => $attributes['total_price'],
            ];
        });
    }
}

