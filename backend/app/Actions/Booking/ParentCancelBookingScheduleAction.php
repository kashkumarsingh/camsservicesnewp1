<?php

namespace App\Actions\Booking;

use App\Contracts\Booking\IBookingScheduleRepository;
use App\Models\BookingSchedule;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Parent Cancel Booking Schedule Action (Application Layer)
 *
 * This is a copy of the original CancelBookingScheduleAction, introduced to
 * avoid autoloading a legacy/broken class file while preserving behaviour.
 */
class ParentCancelBookingScheduleAction
{
    public function __construct(
        private readonly IBookingScheduleRepository $scheduleRepository,
        private readonly CalculateBookingHoursAction $calculateBookingHoursAction
    ) {
    }

    /**
     * Execute the action to cancel a booking schedule (session).
     *
     * @param int $id
     * @param string|null $reason
     * @return BookingSchedule
     *
     * @throws ModelNotFoundException
     * @throws \RuntimeException
     */
    public function execute(int $id, ?string $reason = null): BookingSchedule
    {
        return DB::transaction(function () use ($id, $reason) {
            /** @var BookingSchedule|null $schedule */
            $schedule = $this->scheduleRepository->findById($id);

            if (!$schedule) {
                throw new ModelNotFoundException("Booking schedule not found with ID: {$id}");
            }

            $booking = $schedule->booking;

            // Guard clauses for invalid states
            if ($schedule->isCompleted()) {
                throw new \RuntimeException('Cannot cancel a completed session.');
            }

            if ($schedule->isCancelled()) {
                throw new \RuntimeException('This session has already been cancelled.');
            }

            // Capture duration before cancellation so we can refund hours
            $duration = (float) ($schedule->duration_hours ?? 0);

            // Mark the session as cancelled (status + timestamps + reason)
            $schedule->cancel($reason);

            // Refund booked hours back to the booking's remaining balance
            if ($booking && $duration > 0) {
                $this->calculateBookingHoursAction->decrementBooked($booking, $duration);
            }

            Log::info('Booking schedule cancelled', [
                'schedule_id'    => $schedule->id,
                'booking_id'     => $booking?->id,
                'duration_hours' => $duration,
                'reason'         => $reason,
            ]);

            return $schedule->refresh();
        });
    }
}

