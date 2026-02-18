<?php

namespace App\Actions\Booking;

use App\Contracts\Booking\IBookingScheduleRepository;
use App\Models\Booking;
use App\Models\BookingSchedule;
use App\Services\Booking\PersistCustomActivitiesFromNotesService;
use App\ValueObjects\Booking\SessionStatus;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Update Booking Schedule Action (Application Layer)
 * 
 * Clean Architecture: Application Layer (Use Cases)
 * Purpose: Orchestrates business logic for updating booking schedules
 * Location: backend/app/Actions/Booking/UpdateBookingScheduleAction.php
 * 
 * This action handles:
 * - Updating schedule details (date, time, trainer)
 * - Rescheduling with conflict detection
 * - Status transitions
 * - Duration recalculation
 * 
 * The Application Layer depends on the Domain Layer (BookingSchedule model)
 * but is independent of the Interface Layer (Controllers).
 */
class UpdateBookingScheduleAction
{
    public function __construct(
        private readonly IBookingScheduleRepository $scheduleRepository,
        private readonly CheckTrainerConflictsAction $checkTrainerConflictsAction,
        private readonly CheckChildConflictsAction $checkChildConflictsAction,
        private readonly ValidateHoursAvailableAction $validateHoursAvailableAction,
        private readonly CalculateBookingHoursAction $calculateBookingHoursAction,
        private readonly PersistCustomActivitiesFromNotesService $persistCustomActivities
    ) {
    }

    /**
     * Execute the action to update a booking schedule.
     *
     * @param int $id
     * @param array $data
     * @return BookingSchedule
     * @throws ModelNotFoundException
     * @throws \Exception
     */
    public function execute(int $id, array $data): BookingSchedule
    {
        return DB::transaction(function () use ($id, $data) {
            $schedule = $this->scheduleRepository->findById($id);

            if (!$schedule) {
                throw new ModelNotFoundException("Booking schedule not found with ID: {$id}");
            }

            $booking = $schedule->booking;
            // Lock booking row when duration may increase to prevent concurrent overbooking
            $booking = Booking::where('id', $booking->id)->lockForUpdate()->first();
            if (!$booking) {
                throw new ModelNotFoundException("Booking not found for schedule ID: {$id}");
            }
            $durationDiff = 0;

            // Handle rescheduling (date/time changes)
            if (isset($data['date']) || isset($data['start_time']) || isset($data['end_time'])) {
                $this->handleReschedule($schedule, $data, $booking);
            }

            // Handle trainer change
            if (isset($data['trainer_id']) && $data['trainer_id'] !== $schedule->trainer_id) {
                $this->checkTrainerConflictsAction->execute(
                    trainerId: (int) $data['trainer_id'],
                    date: $data['date'] ?? $schedule->date,
                    startTime: $data['start_time'] ?? $schedule->start_time,
                    endTime: $data['end_time'] ?? $schedule->end_time,
                    excludeScheduleId: $id
                );
            }

            // Handle status changes
            if (isset($data['status'])) {
                $this->validateStatusTransition($schedule, $data['status']);
            }

            // Recalculate duration if time changed
            if (isset($data['start_time']) || isset($data['end_time'])) {
                $date = $data['date'] ?? $schedule->date;
                $startTime = $data['start_time'] ?? $schedule->start_time;
                $endTime = $data['end_time'] ?? $schedule->end_time;
                $newDuration = $this->calculateDuration($date, $startTime, $endTime);
                $data['duration_hours'] = $newDuration;

                $durationDiff = $newDuration - $schedule->duration_hours;
                if ($durationDiff > 0) {
                    $this->validateHoursAvailableAction->execute($booking, $durationDiff);
                }
            }
            // Handle activities update if provided
            if (isset($data['activities'])) {
                $this->syncActivities($schedule, $data['activities']);
                // Remove activities from data array (already handled)
                unset($data['activities']);
            }

            // Persist any custom activities from notes so they appear in the standard list for future bookings
            if (! empty($data['itinerary_notes'])) {
                $this->persistCustomActivities->persistFromNotes($data['itinerary_notes']);
            }

            // Normalise itinerary_notes for storage (model casts to array; request may send string)
            if (array_key_exists('itinerary_notes', $data)) {
                $notes = $data['itinerary_notes'];
                $data['itinerary_notes'] = is_string($notes)
                    ? array_values(array_filter(array_map('trim', explode("\n", $notes))))
                    : $notes;
            }

            // Update schedule
            $schedule = $this->scheduleRepository->update($id, $data);

            // Update booking hours if duration changed
            if ($durationDiff !== 0) {
                $this->calculateBookingHoursAction->adjust($booking, $durationDiff);
            }

            Log::info('Booking schedule updated', [
                'schedule_id' => $schedule->id,
                'booking_id' => $booking->id,
                'status' => $schedule->status,
            ]);

            return $schedule->load(['booking', 'trainer', 'activities']);
        });
    }

    /**
     * Handle rescheduling logic.
     *
     * @param BookingSchedule $schedule
     * @param array $data
     * @param \App\Models\Booking $booking
     * @return void
     * @throws \RuntimeException
     */
    private function handleReschedule(BookingSchedule $schedule, array &$data, \App\Models\Booking $booking): void
    {
        $newDate = $data['date'] ?? $schedule->date;
        $newStartTime = $data['start_time'] ?? $schedule->start_time;
        $newEndTime = $data['end_time'] ?? $schedule->end_time;

        // Check for conflicts with new time
        if (isset($schedule->trainer_id)) {
            $this->checkTrainerConflictsAction->execute(
                trainerId: (int) $schedule->trainer_id,
                date: $newDate,
                startTime: $newStartTime,
                endTime: $newEndTime,
                excludeScheduleId: $schedule->id
            );
        }

        // Check for child conflicts
        $this->checkChildConflictsAction->execute(
            bookingId: (int) $booking->id,
            date: $newDate,
            startTime: $newStartTime,
            endTime: $newEndTime,
            excludeScheduleId: $schedule->id
        );

        // Mark as rescheduled
        $data['status'] = SessionStatus::RESCHEDULED;
        $data['rescheduled_at'] = now();
        $data['original_date'] = $schedule->date;
        $data['original_start_time'] = $schedule->start_time;
    }

    /**
     * Validate status transition.
     *
     * @param BookingSchedule $schedule
     * @param string $newStatus
     * @return void
     * @throws \RuntimeException
     */
    private function validateStatusTransition(BookingSchedule $schedule, string $newStatus): void
    {
        if (!in_array($newStatus, SessionStatus::all(), true)) {
            throw new \RuntimeException("Invalid session status: {$newStatus}");
        }

        // Business rules for status transitions
        if ($schedule->isCancelled() && $newStatus !== SessionStatus::CANCELLED) {
            throw new \RuntimeException('Cannot change status from cancelled to another status.');
        }
    }

    /**
     * Calculate duration in hours.
     *
     * @param string $date
     * @param string $startTime
     * @param string $endTime
     * @return float
     */
    private function calculateDuration(string $date, string $startTime, string $endTime): float
    {
        $start = \Carbon\Carbon::parse("{$date} {$startTime}");
        $end = \Carbon\Carbon::parse("{$date} {$endTime}");
        
        return round($end->diffInHours($start, true), 2);
    }

    /**
     * Sync activities for the schedule.
     *
     * @param BookingSchedule $schedule
     * @param array $activitiesData
     * @return void
     */
    private function syncActivities(BookingSchedule $schedule, array $activitiesData): void
    {
        // Detach all existing activities
        $schedule->activities()->detach();

        // Attach new activities if provided
        if (!empty($activitiesData)) {
            foreach ($activitiesData as $index => $activityData) {
                $schedule->activities()->attach($activityData['activity_id'], [
                    'duration_hours' => $activityData['duration_hours'] ?? 0,
                    'order' => $activityData['order'] ?? $index,
                    'notes' => $activityData['notes'] ?? null,
                ]);
            }
        }
    }
}

