<?php

namespace App\Actions\Booking;

use App\Contracts\Booking\IBookingScheduleRepository;
use App\Models\BookingSchedule;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Delete Booking Schedule Action (Application Layer)
 * 
 * Clean Architecture: Application Layer (Use Cases)
 * Purpose: Orchestrates business logic for deleting booking schedules
 * Location: backend/app/Actions/Booking/DeleteBookingScheduleAction.php
 * 
 * This action handles:
 * - Deleting a booking schedule
 * - Updating booking hours
 * - Validating deletion rules
 * 
 * The Application Layer depends on the Domain Layer (BookingSchedule model)
 * but is independent of the Interface Layer (Controllers).
 */
class DeleteBookingScheduleAction
{
    public function __construct(
        private readonly IBookingScheduleRepository $scheduleRepository,
        private readonly CalculateBookingHoursAction $calculateBookingHoursAction
    ) {
    }

    /**
     * Execute the action to delete a booking schedule.
     *
     * @param int $id
     * @return bool
     * @throws ModelNotFoundException
     * @throws \RuntimeException
     */
    public function execute(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            $schedule = $this->scheduleRepository->findById($id);

            if (!$schedule) {
                throw new ModelNotFoundException("Booking schedule not found with ID: {$id}");
            }

            $booking = $schedule->booking;

            // Validate deletion rules
            if ($schedule->isCompleted()) {
                throw new \RuntimeException('Cannot delete a completed session. Please cancel it instead.');
            }

            // Get duration before deletion
            $duration = $schedule->duration_hours;

            // Delete the schedule
            $deleted = $this->scheduleRepository->delete($id);

            if ($deleted) {
                // Update booking hours
                $this->calculateBookingHoursAction->decrementBooked($booking, $duration);

                Log::info('Booking schedule deleted', [
                    'schedule_id' => $id,
                    'booking_id' => $booking->id,
                    'duration' => $duration,
                ]);
            }

            return $deleted;
        });
    }
}

