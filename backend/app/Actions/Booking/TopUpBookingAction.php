<?php

namespace App\Actions\Booking;

use App\Actions\Booking\ProcessPaymentAction;
use App\Models\Booking;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * Top Up Booking Action (Application Layer)
 *
 * Clean Architecture: Application Layer (Use Cases)
 * Purpose: Safely add hours to an existing, fully paid booking and
 *          create a payment intent for the top-up amount.
 *
 * This action:
 * - Validates booking ownership and state (confirmed, fully paid, not expired)
 * - Calculates top-up price using the original package rate
 * - Increases total_hours / remaining_hours and total_price
 * - Delegates payment intent creation to ProcessPaymentAction
 */
class TopUpBookingAction
{
    public function __construct(
        private readonly ProcessPaymentAction $processPaymentAction
    ) {
    }

    /**
     * Execute the top-up for a booking.
     *
     * @param int $bookingId
     * @param float $hours
     * @param string $currency
     * @return array{
     *  success: bool,
     *  checkout_url?: string|null,
     *  payment_intent_id?: string|null,
     *  payment_id?: string|null,
     *  amount?: float,
     *  hours?: float,
     *  error?: string
     * }
     */
    public function execute(int $bookingId, float $hours, string $currency = 'GBP'): array
    {
        return DB::transaction(function () use ($bookingId, $hours, $currency) {
            $user = Auth::user();

            if (!$user) {
                throw new RuntimeException('You must be logged in to top up a booking.');
            }

            /** @var Booking $booking */
            $booking = Booking::with(['package', 'user'])->findOrFail($bookingId);

            // Security: parents can only top up their own bookings.
            if ((int) $booking->user_id !== (int) $user->id) {
                // Do not reveal that the booking exists – behave as "not found".
                throw new \Illuminate\Database\Eloquent\ModelNotFoundException();
            }

            // Business rules: only confirmed, fully paid, non-expired bookings can be topped up.
            if (!$booking->isConfirmed()) {
                throw new RuntimeException('Only confirmed bookings can be topped up.');
            }

            if (!$booking->isFullyPaid()) {
                throw new RuntimeException('You can only top up fully paid packages.');
            }

            if ($booking->hasExpired()) {
                throw new RuntimeException('This package has expired and cannot be topped up.');
            }

            if ($hours <= 0) {
                throw new RuntimeException('Top-up hours must be greater than zero.');
            }

            if ($hours > 100) {
                throw new RuntimeException('Top-up hours are too high. Please contact support for larger adjustments.');
            }

            // Determine the hourly rate from the original package where possible,
            // falling back to the booking totals for legacy data.
            $package = $booking->package;
            $totalPackageHours = $package?->hours ?? $booking->total_hours;
            $packagePrice = $package?->price ?? $booking->total_price;

            if ($totalPackageHours <= 0 || $packagePrice <= 0) {
                throw new RuntimeException('Unable to calculate hourly rate for this package. Please contact support.');
            }

            $rate = $packagePrice / $totalPackageHours;
            $topUpAmount = round($rate * $hours, 2);

            if ($topUpAmount <= 0) {
                throw new RuntimeException('Calculated top-up amount is invalid. Please try a different value or contact support.');
            }

            // Log before mutating for traceability.
            Log::info('TopUpBookingAction: Starting top-up', [
                'booking_id' => $booking->id,
                'user_id' => $user->id,
                'hours' => $hours,
                'rate' => $rate,
                'amount' => $topUpAmount,
                'currency' => $currency,
            ]);

            // Update booking hours and price. We deliberately do NOT modify
            // booked_hours or used_hours here; those change when sessions are booked/completed.
            $booking->total_hours = $booking->total_hours + $hours;
            $booking->remaining_hours = $booking->remaining_hours + $hours;
            $booking->total_price = $booking->total_price + $topUpAmount;
            $booking->save();

            // Delegate payment intent creation – this will validate that the
            // amount does not exceed the new outstanding balance.
            $paymentResult = $this->processPaymentAction->createPaymentIntent(
                (int) $booking->id,
                $topUpAmount,
                $currency,
                'stripe'
            );

            if (!$paymentResult['success']) {
                // Throwing here will roll back the booking update transaction.
                $errorMessage = $paymentResult['error'] ?? 'Failed to create payment intent for top-up.';

                Log::error('TopUpBookingAction: Payment intent creation failed', [
                    'booking_id' => $booking->id,
                    'user_id' => $user->id,
                    'amount' => $topUpAmount,
                    'currency' => $currency,
                    'error' => $errorMessage,
                ]);

                throw new RuntimeException($errorMessage);
            }

            Log::info('TopUpBookingAction: Top-up payment intent created', [
                'booking_id' => $booking->id,
                'user_id' => $user->id,
                'hours' => $hours,
                'amount' => $topUpAmount,
                'payment_intent_id' => $paymentResult['payment_intent_id'] ?? null,
                'payment_id' => $paymentResult['payment_id'] ?? null,
            ]);

            return [
                'success' => true,
                'checkout_url' => $paymentResult['checkout_url'] ?? null,
                'payment_intent_id' => $paymentResult['payment_intent_id'] ?? null,
                'payment_id' => $paymentResult['payment_id'] ?? null,
                'amount' => $topUpAmount,
                'hours' => $hours,
            ];
        });
    }
}

