<?php

namespace App\Actions\Booking;

use App\Contracts\Booking\IBookingRepository;
use App\Contracts\Booking\IBookingScheduleRepository;
use App\Models\Booking;
use App\Models\BookingSchedule;
use App\Services\Booking\PackageConstraintValidator;
use App\Services\Booking\PersistCustomActivitiesFromNotesService;
use App\ValueObjects\Booking\SessionStatus;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Create Booking Schedule Action (Application Layer)
 * 
 * Clean Architecture: Application Layer (Use Cases)
 * Purpose: Orchestrates business logic for creating booking schedules
 * Location: backend/app/Actions/Booking/CreateBookingScheduleAction.php
 * 
 * This action handles:
 * - Creating a new booking schedule (session)
 * - Conflict detection (trainer, child)
 * - Hour validation
 * - Activity assignment
 * 
 * The Application Layer depends on the Domain Layer (BookingSchedule model)
 * but is independent of the Interface Layer (Controllers).
 */
class CreateBookingScheduleAction
{
    public function __construct(
        private readonly IBookingRepository $bookingRepository,
        private readonly IBookingScheduleRepository $scheduleRepository,
        private readonly CheckTrainerConflictsAction $checkTrainerConflictsAction,
        private readonly CheckChildConflictsAction $checkChildConflictsAction,
        private readonly ValidateHoursAvailableAction $validateHoursAvailableAction,
        private readonly CalculateBookingHoursAction $calculateBookingHoursAction,
        private readonly PackageConstraintValidator $packageConstraintValidator,
        private readonly AutoAssignTrainerAction $autoAssignTrainerAction,
        private readonly PersistCustomActivitiesFromNotesService $persistCustomActivities
    ) {
    }

    /**
     * Execute the action to create a booking schedule.
     *
     * @param array $data Schedule data
     * @return BookingSchedule
     * @throws \Exception
     */
    public function execute(array $data): BookingSchedule
    {
        return DB::transaction(function () use ($data) {
            // Validate booking exists
            $booking = $this->bookingRepository->findById($data['booking_id']);

            if (!$booking) {
                throw new ModelNotFoundException("Booking not found with ID: {$data['booking_id']}");
            }

            // Lock booking row to prevent concurrent overbooking (e.g. two tabs both creating a session)
            $booking = Booking::where('id', $booking->id)->lockForUpdate()->first();
            if (!$booking) {
                throw new ModelNotFoundException("Booking not found with ID: {$data['booking_id']}");
            }

            // Validate booking can accept new schedules
            if ($booking->isCancelled()) {
                throw new \RuntimeException('Cannot create schedule for cancelled booking.');
            }

            // Check for trainer conflicts
            if (isset($data['trainer_id'])) {
                $this->checkTrainerConflictsAction->execute(
                    trainerId: (int) $data['trainer_id'],
                    date: $data['date'],
                    startTime: $data['start_time'],
                    endTime: $data['end_time']
                );
            }

            // Check for child conflicts (same booking, different schedule)
            $this->checkChildConflictsAction->execute(
                bookingId: (int) $booking->id,
                date: $data['date'],
                startTime: $data['start_time'],
                endTime: $data['end_time']
            );

            // Calculate duration
            $duration = $this->calculateDuration(
                $data['date'],
                $data['start_time'],
                $data['end_time']
            );

            // Validate package constraints (date, hours, and 24-hour advance booking)
            $this->packageConstraintValidator->validateAll(
                $booking,
                $data['date'],
                $data['start_time'],
                $duration
            );

            // Validate hours available (additional validation for remaining hours)
            $this->validateHoursAvailableAction->execute($booking, $duration);

            // Persist any custom activities from notes so they appear in the standard list for future bookings
            if (! empty($data['itinerary_notes'])) {
                $this->persistCustomActivities->persistFromNotes($data['itinerary_notes']);
            }

            // Normalise itinerary_notes for storage (model casts to array; request may send string)
            $itineraryNotes = $data['itinerary_notes'] ?? null;
            if (is_string($itineraryNotes)) {
                $itineraryNotes = array_values(array_filter(array_map('trim', explode("\n", $itineraryNotes))));
            }

            // Create schedule
            $scheduleData = [
                'booking_id' => $booking->id,
                'date' => $data['date'],
                'start_time' => $data['start_time'],
                'end_time' => $data['end_time'],
                'trainer_id' => $data['trainer_id'] ?? null,
                'booked_by' => $data['booked_by'] ?? 'parent', // Default to 'parent' if not specified
                'booked_by_user_id' => $data['booked_by_user_id'] ?? null, // User ID of who booked (parent or trainer)
                'duration_hours' => $duration,
                'mode_key' => $data['mode_key'] ?? null,
                'itinerary_notes' => $itineraryNotes,
                'location' => $data['location'] ?? null,
                'status' => SessionStatus::SCHEDULED,
                'order' => $data['order'] ?? 0,
            ];

            $schedule = $this->scheduleRepository->create($scheduleData);

            // Attach activities if provided
            if (isset($data['activities']) && is_array($data['activities'])) {
                $this->attachActivities($schedule, $data['activities']);
            }

            // Assign trainer: either leave unassigned (admin assigns on schedule) or auto-assign
            if (empty($schedule->trainer_id)) {
                $flow = config('booking.schedule_assignment_flow', 'unassigned_first');

                if ($flow === 'auto_assign') {
                    $autoAssignedTrainer = $this->autoAssignTrainerAction->execute($schedule->fresh(), []);

                    if ($autoAssignedTrainer) {
                        $autoAccept = (bool) ($autoAssignedTrainer->auto_accept_sessions ?? false);
                        $schedule->update([
                            'trainer_id' => $autoAssignedTrainer->id,
                            'auto_assigned' => true,
                            'requires_admin_approval' => !$autoAccept,
                            'trainer_assignment_status' => $autoAccept
                                ? BookingSchedule::TRAINER_ASSIGNMENT_CONFIRMED
                                : BookingSchedule::TRAINER_ASSIGNMENT_PENDING_CONFIRMATION,
                            'trainer_confirmation_requested_at' => $autoAccept ? null : now(),
                            'trainer_confirmed_at' => $autoAccept ? now() : null,
                            'assignment_attempt_count' => 1,
                        ]);
                        $schedule->refresh();

                        Log::info('Trainer auto-assigned to schedule', [
                            'schedule_id' => $schedule->id,
                            'trainer_id' => $autoAssignedTrainer->id,
                            'trainer_name' => $autoAssignedTrainer->name,
                            'pending_trainer_confirmation' => !$autoAccept,
                        ]);
                    } else {
                        Log::info('No trainer auto-assigned (manual assignment needed)', [
                            'schedule_id' => $schedule->id,
                            'booking_id' => $booking->id,
                            'reason' => 'No qualified/available trainer found',
                        ]);
                    }
                } else {
                    // unassigned_first: session stays without trainer; admin assigns on Schedule view
                    Log::info('Schedule created unassigned (admin will assign)', [
                        'schedule_id' => $schedule->id,
                        'booking_id' => $booking->id,
                    ]);
                }
            }

            // Update booking hours
            $this->calculateBookingHoursAction->incrementBooked($booking, $duration);

            Log::info('Booking schedule created', [
                'schedule_id' => $schedule->id,
                'booking_id' => $booking->id,
                'date' => $data['date'],
                'duration' => $duration,
                'trainer_assigned' => $schedule->trainer_id !== null,
                'auto_assigned' => empty($data['trainer_id']) && $schedule->trainer_id !== null,
            ]);

            // Dispatch SessionBooked event (triggers trainer notification if trainer is assigned)
            event(new \App\Events\SessionBooked($schedule));

            return $schedule->load(['booking', 'trainer', 'activities']);
        });
    }

    /**
     * Calculate duration in hours from date and times.
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
        // Use fractional hours so 6h 0m = 6.0 and 6h 30m = 6.5 (diffInHours returns integer only)
        $hours = (float) $end->diffInMinutes($start, true) / 60;
        return round($hours, 2);
    }

    /**
     * Attach activities to the schedule.
     *
     * @param BookingSchedule $schedule
     * @param array $activitiesData
     * @return void
     */
    private function attachActivities(BookingSchedule $schedule, array $activitiesData): void
    {
        foreach ($activitiesData as $index => $activityData) {
            $schedule->activities()->attach($activityData['activity_id'], [
                'duration_hours' => $activityData['duration_hours'] ?? 0,
                'order' => $activityData['order'] ?? $index,
                'notes' => $activityData['notes'] ?? null,
            ]);
        }
    }
}

