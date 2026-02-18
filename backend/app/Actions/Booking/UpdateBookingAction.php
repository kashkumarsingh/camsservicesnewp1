<?php

namespace App\Actions\Booking;

use App\Contracts\Booking\IBookingRepository;
use App\Models\Booking;
use App\ValueObjects\Booking\BookingStatus;
use App\ValueObjects\Booking\PaymentStatus;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Update Booking Action (Application Layer)
 * 
 * Clean Architecture: Application Layer (Use Cases)
 * Purpose: Orchestrates business logic for updating bookings
 * Location: backend/app/Actions/Booking/UpdateBookingAction.php
 * 
 * This action handles:
 * - Updating booking details
 * - Status transitions with validation
 * - Payment status updates
 * - Hour tracking updates
 * 
 * The Application Layer depends on the Domain Layer (Booking model)
 * but is independent of the Interface Layer (Controllers).
 */
class UpdateBookingAction
{
    public function __construct(
        private readonly IBookingRepository $bookingRepository
    ) {
    }

    /**
     * Execute the action to update a booking.
     *
     * @param int $id
     * @param array $data
     * @return Booking
     * @throws ModelNotFoundException
     * @throws \Exception
     */
    public function execute(int $id, array $data): Booking
    {
        return DB::transaction(function () use ($id, $data) {
            $booking = $this->bookingRepository->findById($id);

            if (!$booking) {
                throw new ModelNotFoundException("Booking not found with ID: {$id}");
            }

            // Handle status changes
            if (isset($data['status'])) {
                $this->validateStatusTransition($booking, $data['status']);
            }

            // Handle payment status changes
            if (isset($data['payment_status'])) {
                $this->validatePaymentStatusTransition($booking, $data['payment_status']);
            }

            // Update booking
            $booking = $this->bookingRepository->update($id, $data);

            // Update remaining hours if used_hours changed
            if (isset($data['used_hours'])) {
                $booking->updateRemainingHours();
            }

            Log::info('Booking updated', [
                'booking_id' => $booking->id,
                'reference' => $booking->reference,
                'status' => $booking->status,
                'payment_status' => $booking->payment_status,
            ]);

            return $booking->load(['package', 'participants', 'schedules.trainer', 'payments']);
        });
    }

    /**
     * Validate status transition.
     *
     * @param Booking $booking
     * @param string $newStatus
     * @return void
     * @throws \RuntimeException
     */
    private function validateStatusTransition(Booking $booking, string $newStatus): void
    {
        $currentStatus = $booking->status;
        
        // Validate status value
        if (!in_array($newStatus, BookingStatus::all(), true)) {
            throw new \RuntimeException("Invalid booking status: {$newStatus}");
        }

        // Business rules for status transitions
        if ($currentStatus === BookingStatus::CANCELLED && $newStatus !== BookingStatus::CANCELLED) {
            throw new \RuntimeException('Cannot change status from cancelled to another status.');
        }

        if ($currentStatus === BookingStatus::COMPLETED && $newStatus !== BookingStatus::COMPLETED) {
            throw new \RuntimeException('Cannot change status from completed to another status.');
        }
    }

    /**
     * Validate payment status transition.
     *
     * @param Booking $booking
     * @param string $newPaymentStatus
     * @return void
     * @throws \RuntimeException
     */
    private function validatePaymentStatusTransition(Booking $booking, string $newPaymentStatus): void
    {
        $currentPaymentStatus = $booking->payment_status;
        
        // Validate payment status value
        if (!in_array($newPaymentStatus, PaymentStatus::all(), true)) {
            throw new \RuntimeException("Invalid payment status: {$newPaymentStatus}");
        }

        // Business rules for payment status transitions
        if ($currentPaymentStatus === PaymentStatus::REFUNDED && $newPaymentStatus !== PaymentStatus::REFUNDED) {
            throw new \RuntimeException('Cannot change payment status from refunded to another status.');
        }
    }
}

