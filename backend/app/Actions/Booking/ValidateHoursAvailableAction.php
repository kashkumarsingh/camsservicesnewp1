<?php

namespace App\Actions\Booking;

use App\Models\Booking;

class ValidateHoursAvailableAction
{
    /**
     * Ensure requested hours can be booked within remaining allocation.
     *
     * @throws \RuntimeException
     */
    public function execute(Booking $booking, float $requestedHours): void
    {
        if ($requestedHours <= 0) {
            throw new \RuntimeException('Requested hours must be greater than zero.');
        }

        $remaining = $booking->calculateRemainingHours();
        if (round($requestedHours, 2) > round($remaining, 2)) {
            throw new \RuntimeException(sprintf(
                'Insufficient hours available. Required: %.2f, Remaining: %.2f.',
                $requestedHours,
                $remaining
            ));
        }
    }
}

