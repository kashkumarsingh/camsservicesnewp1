<?php

namespace App\Actions\Booking;

use App\Models\Booking;
use App\Models\BookingSchedule;
use App\Models\Trainer;
use App\Contracts\Booking\IBookingScheduleRepository;
use Carbon\Carbon;

/**
 * Score a trainer (0-100) for a session to pick the best match.
 * +20 worked with child before, +15 rating >= 4.5, +10 location, +5 experience,
 * -10 already 4+ sessions that day, -20 back-to-back with no break.
 */
class ScoreTrainerForSessionAction
{
    private const MAX_SESSIONS_PENALTY = 4;
    private const MIN_BREAK_MINUTES = 30;

    public function __construct(
        private readonly IBookingScheduleRepository $scheduleRepository
    ) {
    }

    public function execute(Trainer $trainer, BookingSchedule $schedule): int
    {
        $booking = $schedule->booking;
        $score = 50;

        if ($booking && $this->hasWorkedWithBookingChildren($trainer->id, $booking, $schedule->id)) {
            $score += 20;
        }

        if ((float) ($trainer->rating ?? 0) >= 4.5) {
            $score += 15;
        }

        $postcode = $booking?->user?->postcode ?? $booking?->parent_postcode ?? null;
        if ($postcode && $this->trainerServicesPostcode($trainer, $postcode)) {
            $score += 10;
        }

        if ((int) ($trainer->experience_years ?? 0) >= 5) {
            $score += 5;
        }

        $count = $this->scheduleRepository->countTrainerSchedulesOnDate(
            $trainer->id,
            $schedule->date,
            $schedule->id
        );
        if ($count >= self::MAX_SESSIONS_PENALTY) {
            $score -= 10;
        }

        if ($this->hasBackToBackWithNoBreak($trainer->id, $schedule)) {
            $score -= 20;
        }

        return max(0, min(100, $score));
    }

    private function hasWorkedWithBookingChildren(int $trainerId, Booking $booking, int $excludeId): bool
    {
        $childIds = $booking->participants()->whereNotNull('child_id')->pluck('child_id')->toArray();
        if ($childIds === []) {
            return false;
        }
        return BookingSchedule::where('trainer_id', $trainerId)
            ->where('id', '!=', $excludeId)
            ->whereHas('booking.participants', fn ($q) => $q->whereIn('child_id', $childIds))
            ->exists();
    }

    private function trainerServicesPostcode(Trainer $trainer, string $postcode): bool
    {
        $areas = $trainer->service_area_postcodes;
        if (empty($areas) || !is_array($areas)) {
            return true;
        }
        $p = strtoupper(trim(explode(' ', $postcode)[0]));
        foreach ($areas as $area) {
            $a = strtoupper(trim(explode(' ', $area)[0]));
            if (str_starts_with($p, $a) || str_starts_with($a, $p)) {
                return true;
            }
        }
        return false;
    }

    private function hasBackToBackWithNoBreak(int $trainerId, BookingSchedule $newSchedule): bool
    {
        $prev = BookingSchedule::where('trainer_id', $trainerId)
            ->where('date', $newSchedule->date)
            ->whereIn('status', [BookingSchedule::STATUS_SCHEDULED, BookingSchedule::STATUS_RESCHEDULED])
            ->where('id', '!=', $newSchedule->id)
            ->where('end_time', '<=', $newSchedule->start_time)
            ->orderByDesc('end_time')
            ->first();

        if (!$prev) {
            return false;
        }
        $prevEnd = Carbon::parse($prev->date->format('Y-m-d') . ' ' . $prev->end_time);
        $newStart = Carbon::parse($newSchedule->date->format('Y-m-d') . ' ' . $newSchedule->start_time);
        return $prevEnd->diffInMinutes($newStart, false) < self::MIN_BREAK_MINUTES;
    }
}
