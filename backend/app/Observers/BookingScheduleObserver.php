<?php

namespace App\Observers;

use App\Actions\TrainerSessionPay\CreateTrainerSessionPaymentForScheduleAction;
use App\Http\Controllers\Api\LiveRefreshController;
use App\Models\BookingSchedule;
use App\Models\BookingScheduleChange;
use App\Services\LiveRefreshBroadcastService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

/**
 * BookingScheduleObserver
 * 
 * Clean Architecture: Infrastructure Layer
 * Purpose: Observes BookingSchedule model events to:
 * 1. Track booking schedule changes (audit trail)
 * 2. Update booking hours (booked_hours, used_hours, remaining_hours)
 * 
 * This observer ensures that whenever a session is created, updated, or deleted,
 * the parent booking's hours are automatically recalculated and updated.
 */
class BookingScheduleObserver
{
    /**
     * Handle the BookingSchedule "created" event.
     * 
     * When a new session is created, update the booking's booked_hours.
     */
    public function created(BookingSchedule $schedule): void
    {
        $this->updateBookingHours($schedule->booking);
        $this->broadcastSchedulesRefresh($schedule);
    }

    /**
     * Handle the BookingSchedule "updated" event.
     * 
     * When a session is updated (status, duration, etc.), update booking hours
     * and create an audit log entry.
     */
    public function updated(BookingSchedule $schedule): void
    {
        $statusChanged = $schedule->isDirty('status');
        $dateChanged = $schedule->isDirty('date');
        $timeChanged = $schedule->isDirty('start_time') || $schedule->isDirty('end_time');
        $durationChanged = $schedule->isDirty('duration_hours') || $schedule->isDirty('actual_duration_hours');

        // Update booking hours if status, duration, or time changed
        if ($statusChanged || $durationChanged || $timeChanged) {
            $this->updateBookingHours($schedule->booking);
        }

        // Create audit log entry for significant changes
        if ($statusChanged || $dateChanged || $timeChanged) {
            $changeType = BookingScheduleChange::TYPE_STATUS_CHANGE;
            if ($statusChanged) {
                $changeType = match ($schedule->status) {
                    BookingSchedule::STATUS_CANCELLED => BookingScheduleChange::TYPE_CANCEL,
                    BookingSchedule::STATUS_COMPLETED => BookingScheduleChange::TYPE_COMPLETE,
                    BookingSchedule::STATUS_NO_SHOW => BookingScheduleChange::TYPE_NO_SHOW,
                    default => BookingScheduleChange::TYPE_STATUS_CHANGE,
                };
            } elseif ($dateChanged || $timeChanged) {
                $changeType = BookingScheduleChange::TYPE_RESCHEDULE;
            }

            BookingScheduleChange::create([
                'booking_schedule_id' => $schedule->id,
                'change_type' => $changeType,
                'old_status' => $schedule->getOriginal('status'),
                'new_status' => $schedule->status,
                'old_date' => $schedule->getOriginal('date'),
                'new_date' => $schedule->date,
                'old_start_time' => $schedule->getOriginal('start_time'),
                'new_start_time' => $schedule->start_time,
                'old_end_time' => $schedule->getOriginal('end_time'),
                'new_end_time' => $schedule->end_time,
                'reason' => $schedule->reschedule_reason ?? $schedule->cancellation_reason,
                'changed_by_user_id' => Auth::id(),
                'ip_address' => request()?->ip(),
                'user_agent' => request()?->userAgent(),
                'metadata' => [
                    'changes' => array_keys($schedule->getChanges()),
                ],
            ]);
        }

        // When session is marked completed, create a pending trainer session payment (for pay-after-session)
        if ($statusChanged && $schedule->status === BookingSchedule::STATUS_COMPLETED && $schedule->trainer_id) {
            try {
                app(CreateTrainerSessionPaymentForScheduleAction::class)->execute($schedule);
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('Trainer session payment creation skipped or failed', [
                    'booking_schedule_id' => $schedule->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }
        $this->broadcastSchedulesRefresh($schedule);
    }

    /**
     * Handle the BookingSchedule "deleted" event.
     * 
     * When a session is deleted, update the booking's booked_hours.
     */
    public function deleted(BookingSchedule $schedule): void
    {
        $this->broadcastSchedulesRefresh($schedule);
        // Reload booking before updating (schedule relationship may be gone)
        $booking = $schedule->booking;
        if ($booking) {
            $this->updateBookingHours($booking);
        }
    }

    private function broadcastSchedulesRefresh(BookingSchedule $schedule): void
    {
        $userIds = [];
        $booking = $schedule->relationLoaded('booking') ? $schedule->booking : $schedule->booking()->first();
        if ($booking) {
            $userIds[] = $booking->user_id;
        }
        if ($schedule->trainer_id) {
            $trainer = \App\Models\Trainer::find($schedule->trainer_id);
            if ($trainer?->user_id) {
                $userIds[] = $trainer->user_id;
            }
        }
        $userIds = array_values(array_unique(array_filter($userIds)));
        LiveRefreshBroadcastService::notify(
            [LiveRefreshController::CONTEXT_BOOKINGS, LiveRefreshController::CONTEXT_TRAINER_SCHEDULES],
            $userIds,
            true
        );
    }

    /**
     * Update booking hours based on all schedules.
     * 
     * Calculates:
     * - booked_hours: Sum of all scheduled sessions (scheduled, completed, rescheduled)
     * - used_hours: Sum of all completed sessions (using actual_duration_hours if available)
     * - remaining_hours: total_hours - booked_hours
     * 
     * @param \App\Models\Booking $booking
     * @return void
     */
    protected function updateBookingHours($booking): void
    {
        if (!$booking) {
            return;
        }

        // Calculate booked_hours: sum of all scheduled sessions (not cancelled, not no_show)
        $bookedHours = $booking->schedules()
            ->whereNotIn('status', [
                BookingSchedule::STATUS_CANCELLED,
                BookingSchedule::STATUS_NO_SHOW,
            ])
            ->sum('duration_hours') ?? 0;

        // Calculate used_hours: sum of completed sessions (use actual_duration_hours if available)
        $usedHours = $booking->schedules()
            ->where('status', BookingSchedule::STATUS_COMPLETED)
            ->get()
            ->sum(function ($schedule) {
                // Prefer actual_duration_hours if available, otherwise use duration_hours
                return (float) ($schedule->actual_duration_hours ?? $schedule->duration_hours ?? 0);
            });

        // Calculate remaining_hours: total_hours - booked_hours
        $remainingHours = max(0, ($booking->total_hours ?? 0) - $bookedHours);

        // Update booking (use DB::table to avoid triggering observers recursively)
        DB::table('bookings')
            ->where('id', $booking->id)
            ->update([
                'booked_hours' => round($bookedHours, 2),
                'used_hours' => round($usedHours, 2),
                'remaining_hours' => round($remainingHours, 2),
                'updated_at' => now(),
            ]);
    }
}

