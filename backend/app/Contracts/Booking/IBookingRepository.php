<?php

namespace App\Contracts\Booking;

use App\Models\Booking;
use Illuminate\Database\Eloquent\Collection;

/**
 * Booking Repository Interface
 * 
 * Clean Architecture: Application Layer (Port/Interface)
 * Purpose: Defines the contract for booking repository implementations
 * Location: backend/app/Contracts/Booking/IBookingRepository.php
 * 
 * This interface:
 * - Defines all booking data access operations
 * - Allows for different implementations (Eloquent, API, Mock)
 * - Follows repository pattern for testability
 */
interface IBookingRepository
{
    /**
     * Find a booking by ID.
     *
     * @param int $id
     * @return Booking|null
     */
    public function findById(int $id): ?Booking;

    /**
     * Find a booking by reference.
     *
     * @param string $reference
     * @return Booking|null
     */
    public function findByReference(string $reference): ?Booking;

    /**
     * Find bookings by user ID.
     *
     * @param int $userId
     * @param array $filters Optional filters (status, payment_status, etc.)
     * @return Collection<int, Booking>
     */
    public function findByUserId(int $userId, array $filters = []): Collection;

    /**
     * Find guest bookings by email.
     *
     * @param string $email
     * @return Collection<int, Booking>
     */
    public function findGuestBookingsByEmail(string $email): Collection;

    /**
     * Find bookings by package ID.
     *
     * @param int $packageId
     * @return Collection<int, Booking>
     */
    public function findByPackageId(int $packageId): Collection;

    /**
     * Find all bookings with optional filters.
     *
     * @param array $filters Optional filters (status, payment_status, date_range, etc.)
     * @param int|null $limit
     * @param int|null $offset
     * @return Collection<int, Booking>
     */
    public function findAll(array $filters = [], ?int $limit = null, ?int $offset = null): Collection;

    /**
     * Create a new booking.
     *
     * @param array $data
     * @return Booking
     */
    public function create(array $data): Booking;

    /**
     * Update a booking.
     *
     * @param int $id
     * @param array $data
     * @return Booking
     */
    public function update(int $id, array $data): Booking;

    /**
     * Delete a booking (soft delete).
     *
     * @param int $id
     * @return bool
     */
    public function delete(int $id): bool;

    /**
     * Check if a booking reference exists.
     *
     * @param string $reference
     * @return bool
     */
    public function referenceExists(string $reference): bool;

    /**
     * Get bookings that need payment reminders.
     *
     * @param \DateTime $dueDate
     * @return Collection<int, Booking>
     */
    public function findBookingsNeedingPaymentReminder(\DateTime $dueDate): Collection;

    /**
     * Get bookings with expiring hours.
     *
     * @param \DateTime $expiryDate
     * @return Collection<int, Booking>
     */
    public function findBookingsWithExpiringHours(\DateTime $expiryDate): Collection;

    /**
     * Count bookings by status.
     *
     * @param string|null $status Optional status filter
     * @return int
     */
    public function countByStatus(?string $status = null): int;

    /**
     * Find a recent booking by user and package within a time window.
     * Used to prevent duplicate bookings (same user, same package, within X minutes).
     *
     * @param int $userId
     * @param int $packageId
     * @param \Carbon\Carbon $since
     * @return Booking|null
     */
    public function findRecentBookingByUserAndPackage(int $userId, int $packageId, \Carbon\Carbon $since): ?Booking;
}

