<?php

namespace App\Actions\Booking;

use App\Models\Booking;

class CalculateBookingHoursAction
{
    /**
     * Adjust booked/used/remaining hours atomically.
     */
    public function adjust(Booking $booking, float $bookedDelta = 0, float $usedDelta = 0): Booking
    {
        $booking->booked_hours = max(0, $booking->booked_hours + $bookedDelta);
        $booking->used_hours = max(0, $booking->used_hours + $usedDelta);
        // Remaining = hours left to BOOK (total - booked), not hours left to use (total - used)
        $booking->remaining_hours = max(0, $booking->total_hours - $booking->booked_hours);
        $booking->save();

        return $booking;
    }

    public function incrementBooked(Booking $booking, float $hours): Booking
    {
        return $this->adjust($booking, $hours, 0);
    }

    public function decrementBooked(Booking $booking, float $hours): Booking
    {
        return $this->adjust($booking, -$hours, 0);
    }

    public function updateUsed(Booking $booking, float $usedDelta): Booking
    {
        return $this->adjust($booking, 0, $usedDelta);
    }
}

