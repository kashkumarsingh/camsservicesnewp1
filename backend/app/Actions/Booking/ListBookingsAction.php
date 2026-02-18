<?php

namespace App\Actions\Booking;

use App\Contracts\Booking\IBookingRepository;
use Illuminate\Database\Eloquent\Collection;

/**
 * List Bookings Action (Application Layer)
 * 
 * Clean Architecture: Application Layer (Use Cases)
 * Purpose: Orchestrates business logic for listing bookings
 * Location: backend/app/Actions/Booking/ListBookingsAction.php
 * 
 * This action handles:
 * - Filtering bookings (status, payment_status, date_range, etc.)
 * - Sorting bookings
 * - Pagination
 * - Business rules for booking visibility
 * 
 * The Application Layer depends on the Domain Layer (Booking model)
 * but is independent of the Interface Layer (Controllers).
 */
class ListBookingsAction
{
    public function __construct(
        private readonly IBookingRepository $bookingRepository
    ) {
    }

    /**
     * Execute the action to list bookings with optional filters.
     *
     * @param array $filters
     * @param int|null $limit
     * @param int|null $offset
     * @return Collection
     */
    public function execute(array $filters = [], ?int $limit = null, ?int $offset = null): Collection
    {
        $bookings = $this->bookingRepository->findAll($filters, $limit, $offset);

        // Eager load relationships to avoid N+1 queries
        $bookings->load(['package', 'participants', 'schedules.trainer', 'schedules.activities', 'payments']);

        return $bookings;
    }

    /**
     * Get bookings for a specific user.
     *
     * @param int $userId
     * @param array $filters
     * @return Collection
     */
    public function executeForUser(int $userId, array $filters = []): Collection
    {
        $bookings = $this->bookingRepository->findByUserId($userId, $filters);

        // Eager load relationships
        $bookings->load(['package', 'participants', 'schedules.trainer', 'schedules.activities', 'payments']);

        return $bookings;
    }
}

