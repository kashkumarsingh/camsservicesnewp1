<?php

namespace App\Actions\TrainerAvailability;

use App\Actions\Booking\ProcessTrainerDeclineAndTryNextAction;
use App\Contracts\Booking\IBookingScheduleRepository;
use App\Contracts\Notifications\INotificationDispatcher;
use App\Http\Controllers\Api\LiveRefreshController;
use App\Models\Trainer;
use App\Models\TrainerAvailability;
use App\Services\LiveRefreshBroadcastService;
use App\Services\Notifications\NotificationIntentFactory;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Single source of truth: write trainer calendar availability (specific-date only) for a range.
 *
 * Replaces all specific-date availability records in [date_from, date_to] with the given
 * available dates (is_available=true) and unavailable_dates (is_available=false).
 * Whole-day records (start_time/end_time null) are used by CheckTrainerAvailabilityAction.
 *
 * Business rule (illness / emergency): When a trainer marks a date as unavailable and they
 * have assigned sessions on that date, the system allows the update and automatically
 * releases those sessions: each is treated like a trainer decline (unassign, try next
 * trainer, or notify admin). So the trainer can mark unavailable when ill or in an
 * emergency without having to decline each session first.
 *
 * Used by:
 * - Trainer API: PUT /api/v1/trainer/availability-dates (authenticated trainer only)
 *
 * @see \App\Actions\TrainerAvailability\GetTrainerAvailabilityDatesAction
 * @see \App\Actions\Booking\CheckTrainerAvailabilityAction
 * @see config('booking.availability_date_range_max_days')
 */
final class SetTrainerAvailabilityDatesAction
{
    private const UNAVAILABLE_RELEASE_REASON = 'Trainer marked as unavailable (e.g. illness or emergency).';

    public function __construct(
        private readonly IBookingScheduleRepository $scheduleRepository,
        private readonly ProcessTrainerDeclineAndTryNextAction $processDecline,
        private readonly INotificationDispatcher $dispatcher
    ) {
    }

    public function execute(
        int $trainerId,
        Carbon $dateFrom,
        Carbon $dateTo,
        array $dates,
        array $unavailableDates = []
    ): array {
        $dateFrom = $dateFrom->copy()->startOfDay();
        $dateTo = $dateTo->copy()->endOfDay();

        $maxDays = (int) config('booking.availability_date_range_max_days', 93);
        if ($dateFrom->diffInDays($dateTo, false) > $maxDays) {
            throw new \InvalidArgumentException(
                'Date range must not exceed ' . $maxDays . ' days.'
            );
        }

        $dates = $this->normaliseDateList($dates, $dateFrom, $dateTo);
        $unavailableDates = $this->normaliseDateList($unavailableDates, $dateFrom, $dateTo);

        if (! Schema::hasTable('trainer_availabilities')) {
            throw new \RuntimeException('Availability feature is not set up. Please contact admin.');
        }

        DB::transaction(function () use ($trainerId, $dateFrom, $dateTo, $dates, $unavailableDates) {
            TrainerAvailability::withoutEvents(function () use ($trainerId, $dateFrom, $dateTo, $dates, $unavailableDates) {
                TrainerAvailability::where('trainer_id', $trainerId)
                    ->whereNotNull('specific_date')
                    ->whereDate('specific_date', '>=', $dateFrom)
                    ->whereDate('specific_date', '<=', $dateTo)
                    ->delete();

                foreach ($dates as $d) {
                    TrainerAvailability::create([
                        'trainer_id' => $trainerId,
                        'specific_date' => $d,
                        'is_available' => true,
                        'day_of_week' => null,
                        'start_time' => null,
                        'end_time' => null,
                    ]);
                }
                foreach ($unavailableDates as $d) {
                    TrainerAvailability::create([
                        'trainer_id' => $trainerId,
                        'specific_date' => $d,
                        'is_available' => false,
                        'day_of_week' => null,
                        'start_time' => null,
                        'end_time' => null,
                    ]);
                }
            });
        });

        $trainer = Trainer::find($trainerId);
        if ($trainer?->user_id) {
            LiveRefreshBroadcastService::notify(
                [LiveRefreshController::CONTEXT_TRAINER_AVAILABILITY, LiveRefreshController::CONTEXT_TRAINER_SCHEDULES],
                [$trainer->user_id],
                true
            );
        }

        // After updating calendar: auto-release any assigned sessions on now-unavailable dates
        // (e.g. trainer ill or emergency — sessions are declined and reassigned or admin notified)
        if ($unavailableDates !== []) {
            $toRelease = $this->scheduleRepository->findAssignedSessionsOnDates($trainerId, $unavailableDates);
            foreach ($toRelease as $schedule) {
                $this->processDecline->execute($schedule->fresh(), self::UNAVAILABLE_RELEASE_REASON);
            }
        }

        // Notify admin so the bell shows "Trainer availability updated" (e.g. trainer set a date as available)
        if ($trainer) {
            $this->dispatcher->dispatch(NotificationIntentFactory::trainerAvailabilityUpdatedToAdmin($trainer));
        }

        return [
            'dates' => $dates,
            'unavailable_dates' => $unavailableDates,
        ];
    }

    /**
     * @param array<int, string> $list
     * @return array<int, string>
     */
    private function normaliseDateList(array $list, Carbon $dateFrom, Carbon $dateTo): array
    {
        $out = [];
        foreach ($list as $d) {
            $parsed = Carbon::parse($d)->format('Y-m-d');
            $carbon = Carbon::parse($parsed);
            if ($carbon->between($dateFrom, $dateTo)) {
                $out[] = $parsed;
            }
        }
        $out = array_values(array_unique($out));
        sort($out);

        return $out;
    }
}
