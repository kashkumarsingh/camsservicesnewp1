<?php

namespace App\Actions\Booking;

use App\Contracts\Booking\IBookingRepository;
use App\Models\Booking;
use Illuminate\Database\Eloquent\ModelNotFoundException;

/**
 * Get Booking Action (Application Layer)
 * 
 * Clean Architecture: Application Layer (Use Cases)
 * Purpose: Orchestrates business logic for retrieving bookings
 * Location: backend/app/Actions/Booking/GetBookingAction.php
 * 
 * This action handles:
 * - Getting a booking by ID or reference
 * - Eager loading relationships
 * - Business rules (e.g., user access control)
 * 
 * The Application Layer depends on the Domain Layer (Booking model)
 * but is independent of the Interface Layer (Controllers).
 */
class GetBookingAction
{
    public function __construct(
        private readonly IBookingRepository $bookingRepository
    ) {
    }

    /**
     * Execute the action to get a booking by ID.
     *
     * @param int $id
     * @param array $options Optional options (e.g., 'with' for eager loading)
     * @return Booking
     * @throws ModelNotFoundException
     */
    public function execute(int $id, array $options = []): Booking
    {
        $booking = $this->bookingRepository->findById($id);

        if (!$booking) {
            throw new ModelNotFoundException("Booking not found with ID: {$id}");
        }

        // Eager load relationships if specified
        if (isset($options['with'])) {
            $booking->load($options['with']);
        } else {
            // Default eager loading
            $booking->load(['package.activities', 'participants', 'schedules.trainer', 'schedules.activities', 'payments']);
        }

        return $booking;
    }

    /**
     * Get a booking by reference.
     *
     * @param string $reference
     * @param array $options Optional options (e.g., 'with' for eager loading)
     * @return Booking
     * @throws ModelNotFoundException
     */
    public function executeByReference(string $reference, array $options = []): Booking
    {
        $booking = $this->bookingRepository->findByReference($reference);

        if (!$booking) {
            throw new ModelNotFoundException("Booking not found with reference: {$reference}");
        }

        // Eager load relationships if specified
        if (isset($options['with'])) {
            $booking->load($options['with']);
        } else {
            // Default eager loading
            $booking->load(['package.activities', 'participants', 'schedules.trainer', 'schedules.activities', 'payments']);
        }

        return $booking;
    }

    /**
     * Get bookings for a user.
     *
     * @param int $userId
     * @param array $filters Optional filters
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function executeForUser(int $userId, array $filters = []): \Illuminate\Database\Eloquent\Collection
    {
        return $this->bookingRepository->findByUserId($userId, $filters)
            ->load(['package.activities', 'participants', 'schedules.trainer', 'schedules.activities', 'payments']);
    }

    /**
     * Get guest bookings by email.
     *
     * @param string $email
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function executeGuestBookingsByEmail(string $email): \Illuminate\Database\Eloquent\Collection
    {
        return $this->bookingRepository->findGuestBookingsByEmail($email)
            ->load(['package.activities', 'participants', 'schedules.trainer', 'schedules.activities', 'payments']);
    }
}

