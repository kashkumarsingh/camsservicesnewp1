<?php

namespace App\Services\Booking;

use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

/**
 * Validates booking schedules against package constraints.
 *
 * Ensures:
 * - Session dates are within package validity period
 * - Session hours don't exceed remaining package hours
 * - New business rule: tomorrow only bookable until 6:00 PM today
 */
class PackageConstraintValidator
{
    /**
     * Validate session date is within package validity period.
     *
     * @param Booking $booking
     * @param string $sessionDate Date in Y-m-d format
     * @return void
     * @throws ValidationException
     */
    public function validateSessionDate(Booking $booking, string $sessionDate): void
    {
        // If package has no expiry date, allow any future date
        if (!$booking->package_expires_at) {
            return;
        }

        $sessionDateCarbon = Carbon::parse($sessionDate);
        $packageExpiryDate = Carbon::parse($booking->package_expires_at);

        if ($sessionDateCarbon->isAfter($packageExpiryDate)) {
            throw ValidationException::withMessages([
                'date' => [
                    "This session date is outside your package's validity period. " .
                    "Your package expires on {$packageExpiryDate->format('F j, Y')}."
                ]
            ]);
        }

        // Also check if session date is in the past
        if ($sessionDateCarbon->isPast() && !$sessionDateCarbon->isToday()) {
            throw ValidationException::withMessages([
                'date' => ['Session date cannot be in the past.']
            ]);
        }
    }

    /**
     * Validate session hours don't exceed remaining package hours.
     *
     * @param Booking $booking
     * @param float $sessionHours Hours for this session
     * @return void
     * @throws ValidationException
     */
    public function validateSessionHours(Booking $booking, float $sessionHours): void
    {
        // Use computed remaining (total - booked) to avoid drift from stored remaining_hours and floating-point
        $remainingHours = $booking->calculateRemainingHours();
        $sessionRounded = round($sessionHours, 2);
        $remainingRounded = round($remainingHours, 2);

        if ($sessionRounded > $remainingRounded) {
            $formattedRemaining = number_format($remainingRounded, 1);
            throw ValidationException::withMessages([
                'duration' => [
                    "This session would exceed your remaining {$formattedRemaining} hours. " .
                    "Please book a shorter session or select a different date."
                ]
            ]);
        }
    }

    /**
     * Validate 24-hour advance booking requirement.
     * 
     * Business Rule: Tomorrow is only bookable until 6:00 PM today.
     * No same-day bookings allowed. Must book from tomorrow onwards.
     * This ensures trainers have adequate preparation time.
     *
     * @param string $sessionDate Date in Y-m-d format
     * @param string $startTime Time in H:i format
     * @return void
     * @throws ValidationException
     */
    public function validate24HourAdvanceBooking(string $sessionDate, string $startTime): void
    {
        $sessionDateTime = Carbon::parse("{$sessionDate} {$startTime}");
        $now = Carbon::now();
        $today = $now->copy()->startOfDay();
        $sessionDateOnly = Carbon::parse($sessionDate)->startOfDay();
        
        // Business Rule: No same-day bookings
        if ($sessionDateOnly->isSameDay($today)) {
            $tomorrow = $today->copy()->addDay();
            $msg = str_replace(':date', $tomorrow->format('l, F j, Y'), config('booking.messages.same_day'));
            throw ValidationException::withMessages(['date' => [$msg]]);
        }

        $tomorrow = $today->copy()->addDay();
        // Business Rule: Booking for exactly tomorrow is only allowed until 6:00 PM today
        if ($sessionDateOnly->isSameDay($tomorrow)) {
            $cutoffToday = $today->copy()->setTime(18, 0, 0);
            if ($now->gte($cutoffToday)) {
                $dayAfterTomorrow = $tomorrow->copy()->addDay();
                $msg = str_replace(':date', $dayAfterTomorrow->format('l, F j, Y'), config('booking.messages.tomorrow_after_cutoff'));
                throw ValidationException::withMessages(['date' => [$msg]]);
            }
        }

        // For tomorrow onwards: Check if start time is at least 24 hours away
        $minimumDateTime = $now->copy()->addHours(24);

        if ($sessionDateTime->isBefore($minimumDateTime)) {
            $hoursUntilSession = $now->diffInHours($sessionDateTime, false);
            $formattedMinimum = $minimumDateTime->format('l, F j, Y \a\t g:i A');
            $dateMsg = str_replace(':time', $formattedMinimum, config('booking.messages.time_too_soon'))
                . " You selected a session that is only {$hoursUntilSession} hours away.";

            throw ValidationException::withMessages([
                'date' => [$dateMsg],
                'start_time' => [config('booking.messages.start_time_too_soon')],
            ]);
        }
    }

    /**
     * Validate both date and hours constraints.
     *
     * @param Booking $booking
     * @param string $sessionDate Date in Y-m-d format
     * @param float $sessionHours Hours for this session
     * @return void
     * @throws ValidationException
     */
    public function validate(Booking $booking, string $sessionDate, float $sessionHours): void
    {
        $this->validateSessionDate($booking, $sessionDate);
        $this->validateSessionHours($booking, $sessionHours);
    }

    /**
     * Validate all constraints including 24-hour advance booking.
     *
     * @param Booking $booking
     * @param string $sessionDate Date in Y-m-d format
     * @param string $startTime Time in H:i format
     * @param float $sessionHours Hours for this session
     * @return void
     * @throws ValidationException
     */
    public function validateAll(Booking $booking, string $sessionDate, string $startTime, float $sessionHours): void
    {
        $this->validate24HourAdvanceBooking($sessionDate, $startTime);
        $this->validate($booking, $sessionDate, $sessionHours);
    }
}

