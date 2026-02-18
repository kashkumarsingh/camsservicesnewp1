<?php

namespace App\Actions\Booking;

use App\Models\Trainer;
use App\Models\TrainerAbsenceRequest;
use App\Models\TrainerAvailability;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

/**
 * Check if a trainer is available at a given date/time according to TrainerAvailability and approved absences.
 *
 * Logic:
 * - Approved absence on this date → not available (synced with trainer dashboard).
 * - Specific date: if any record for that date with is_available=false and overlapping time → not available.
 *   If any for that date with is_available=true and session time within window → available.
 * - Else weekly: day_of_week (0=Sunday..6=Saturday), is_available=true, session within start_time/end_time.
 * - If trainer has no availability records at all (calendar never set) → not available.
 * - If trainer has records but none cover this day/time → not available.
 */
class CheckTrainerAvailabilityAction
{
    public function execute(
        int $trainerId,
        string $date,
        string $startTime,
        string $endTime
    ): bool {
        $dateCarbon = Carbon::parse($date);
        $dayOfWeek = $dateCarbon->dayOfWeek; // 0=Sunday, 6=Saturday

        // 0) Approved absence on this date → not available (admin/trainer calendar sync)
        $onApprovedAbsence = TrainerAbsenceRequest::where('trainer_id', $trainerId)
            ->where('status', TrainerAbsenceRequest::STATUS_APPROVED)
            ->whereDate('date_from', '<=', $date)
            ->whereDate('date_to', '>=', $date)
            ->exists();
        if ($onApprovedAbsence) {
            Log::debug('CheckTrainerAvailability: trainer on approved absence', [
                'trainer_id' => $trainerId,
                'date' => $date,
            ]);

            return false;
        }

        // 1) Specific date overrides
        $specific = TrainerAvailability::where('trainer_id', $trainerId)
            ->whereNotNull('specific_date')
            ->whereDate('specific_date', $date)
            ->get();

        if ($specific->isNotEmpty()) {
            foreach ($specific as $av) {
                $wholeDay = empty($av->start_time) && empty($av->end_time);
                if ($av->is_available) {
                    if ($wholeDay) {
                        return true;
                    }
                    if ($this->timeWithinWindow($startTime, $endTime, $av->start_time, $av->end_time)) {
                        return true;
                    }
                } else {
                    if ($wholeDay) {
                        return false;
                    }
                    if ($this->timesOverlap($startTime, $endTime, $av->start_time, $av->end_time)) {
                        Log::debug('CheckTrainerAvailability: trainer blocked by specific date', [
                            'trainer_id' => $trainerId,
                            'date' => $date,
                            'reason' => $av->reason,
                        ]);
                        return false;
                    }
                }
            }
            return false;
        }

        // 2) Weekly availability
        $weekly = TrainerAvailability::where('trainer_id', $trainerId)
            ->whereNull('specific_date')
            ->where('day_of_week', $dayOfWeek)
            ->where('is_available', true)
            ->get();

        foreach ($weekly as $av) {
            $wholeDay = empty($av->start_time) && empty($av->end_time);
            if ($wholeDay) {
                return true;
            }
            if ($this->timeWithinWindow($startTime, $endTime, (string) $av->start_time, (string) $av->end_time)) {
                return true;
            }
        }

        // No weekly slot contained this session
        if ($weekly->isNotEmpty()) {
            return false;
        }

        // 3) No specific and no weekly slot for this day → check if trainer has set any availability at all
        $hasAnyAvailability = TrainerAvailability::where('trainer_id', $trainerId)->exists();
        if (! $hasAnyAvailability) {
            Log::debug('CheckTrainerAvailability: trainer has no availability records (calendar not set)', [
                'trainer_id' => $trainerId,
                'date' => $date,
            ]);
            return false;
        }

        // Trainer has availability set but no slot covers this day/time → not available
        return false;
    }

    private function timeWithinWindow(string $sessionStart, string $sessionEnd, string $windowStart, string $windowEnd): bool
    {
        return $this->compareTime($sessionStart, '>=', $windowStart)
            && $this->compareTime($sessionEnd, '<=', $windowEnd);
    }

    private function timesOverlap(string $s1, string $e1, string $s2, string $e2): bool
    {
        return $this->compareTime($s1, '<', $e2) && $this->compareTime($e1, '>', $s2);
    }

    private function compareTime(string $a, string $op, string $b): bool
    {
        $a = $this->normaliseTime((string) $a);
        $b = $this->normaliseTime((string) $b);
        $cmp = strcmp($a, $b);
        return match ($op) {
            '<' => $cmp < 0,
            '<=' => $cmp <= 0,
            '>' => $cmp > 0,
            '>=' => $cmp >= 0,
            '==' => $cmp === 0,
            default => false,
        };
    }

    /** Normalise to HH:mm so "09:00" and "09:00:00" compare equal. */
    private function normaliseTime(string $time): string
    {
        $time = trim($time);
        return strlen($time) >= 8 ? substr($time, 0, 5) : $time;
    }
}
