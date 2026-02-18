<?php

namespace App\Actions\Booking;

use App\Contracts\Booking\IBookingRepository;
use App\Events\BookingCancelled;
use App\Models\Booking;
use App\ValueObjects\Booking\BookingStatus;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Cancel Booking Action (Application Layer)
 * 
 * Clean Architecture: Application Layer (Use Cases)
 * Purpose: Orchestrates business logic for cancelling bookings
 * Location: backend/app/Actions/Booking/CancelBookingAction.php
 * 
 * This action handles:
 * - Cancelling a booking with validation
 * - Recording cancellation reason
 * - Updating related schedules
 * - Business rules for cancellation
 * 
 * The Application Layer depends on the Domain Layer (Booking model)
 * but is independent of the Interface Layer (Controllers).
 */
class CancelBookingAction
{
    public function __construct(
        private readonly IBookingRepository $bookingRepository
    ) {
    }

    /**
     * Execute the action to cancel a booking.
     *
     * @param int $id
     * @param string|null $reason
     * @return Booking
     * @throws ModelNotFoundException
     * @throws \RuntimeException
     */
    public function execute(int $id, ?string $reason = null): Booking
    {
        return DB::transaction(function () use ($id, $reason) {
            $booking = $this->bookingRepository->findById($id);

            if (!$booking) {
                throw new ModelNotFoundException("Booking not found with ID: {$id}");
            }

            // Validate booking can be cancelled
            if (!$booking->canBeCancelled()) {
                throw new \RuntimeException(
                    "Booking cannot be cancelled. Current status: {$booking->status}"
                );
            }

            // Cancel the booking
            $booking->cancel($reason);

            // Cancel all scheduled sessions
            foreach ($booking->schedules()->scheduled()->get() as $schedule) {
                $schedule->cancel('Booking cancelled');
            }

            Log::info('Booking cancelled', [
                'booking_id' => $booking->id,
                'reference' => $booking->reference,
                'reason' => $reason,
            ]);

            event(new BookingCancelled($booking, $reason));

            return $booking->load(['package', 'participants', 'schedules.trainer', 'payments']);
        });
    }

    /**
     * Cancel a booking by reference (for guest bookings).
     *
     * @param string $reference
     * @param string|null $reason
     * @return Booking
     * @throws ModelNotFoundException
     * @throws \RuntimeException
     */
    public function executeByReference(string $reference, ?string $reason = null): Booking
    {
        $booking = $this->bookingRepository->findByReference($reference);

        if (!$booking) {
            throw new ModelNotFoundException("Booking not found with reference: {$reference}");
        }

        return $this->execute($booking->id, $reason);
    }
}

