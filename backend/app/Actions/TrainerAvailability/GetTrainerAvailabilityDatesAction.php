<?php

namespace App\Actions\TrainerAvailability;

use App\Models\TrainerAvailability;
use Carbon\Carbon;
use Illuminate\Support\Facades\Schema;

/**
 * Single source of truth: read trainer calendar availability (specific-date only) for a range.
 *
 * Used by:
 * - Trainer API: GET /api/v1/trainer/availability-dates (authenticated trainer)
 * - Admin API: GET /api/v1/admin/trainers/{id}/availability-dates (any trainer)
 *
 * Returns available dates (is_available=true) and unavailable_dates (is_available=false).
 * Whole-day specific dates with null start_time/end_time are respected by CheckTrainerAvailabilityAction.
 *
 * @see \App\Actions\Booking\CheckTrainerAvailabilityAction
 * @see config('booking.availability_date_range_max_days')
 */
final class GetTrainerAvailabilityDatesAction
{
    public function execute(int $trainerId, Carbon $dateFrom, Carbon $dateTo): array
    {
        $dateFrom = $dateFrom->copy()->startOfDay();
        $dateTo = $dateTo->copy()->endOfDay();

        $maxDays = (int) config('booking.availability_date_range_max_days', 93);
        if ($dateFrom->diffInDays($dateTo, false) > $maxDays) {
            $dateTo = $dateFrom->copy()->addDays($maxDays);
        }

        $dates = [];
        $unavailableDates = [];

        if (! Schema::hasTable('trainer_availabilities')) {
            return [
                'dates' => $dates,
                'unavailable_dates' => $unavailableDates,
                'date_from' => $dateFrom->format('Y-m-d'),
                'date_to' => $dateTo->format('Y-m-d'),
            ];
        }

        $rows = TrainerAvailability::where('trainer_id', $trainerId)
            ->whereNotNull('specific_date')
            ->whereDate('specific_date', '>=', $dateFrom)
            ->whereDate('specific_date', '<=', $dateTo)
            ->get(['specific_date', 'is_available']);

        foreach ($rows as $row) {
            if (! $row->specific_date) {
                continue;
            }
            $d = $row->specific_date->format('Y-m-d');
            if ($row->is_available) {
                $dates[] = $d;
            } else {
                $unavailableDates[] = $d;
            }
        }

        $dates = array_values(array_unique($dates));
        sort($dates);
        $unavailableDates = array_values(array_unique($unavailableDates));
        sort($unavailableDates);

        return [
            'dates' => $dates,
            'unavailable_dates' => $unavailableDates,
            'date_from' => $dateFrom->format('Y-m-d'),
            'date_to' => $dateTo->format('Y-m-d'),
        ];
    }
}
