<?php

namespace App\Repositories\Booking;

use App\Contracts\Booking\IBookingRepository;
use App\Models\Booking;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Eloquent Booking Repository
 * 
 * Clean Architecture: Infrastructure Layer (Repository Implementation)
 * Purpose: Eloquent implementation of booking repository
 * Location: backend/app/Repositories/Booking/EloquentBookingRepository.php
 * 
 * This repository:
 * - Implements IBookingRepository interface
 * - Uses Eloquent ORM for data access
 * - Handles all booking CRUD operations
 * - Provides query methods with filtering
 */
class EloquentBookingRepository implements IBookingRepository
{
    /**
     * Find a booking by ID.
     *
     * @param int $id
     * @return Booking|null
     */
    public function findById(int $id): ?Booking
    {
        return Booking::find($id);
    }

    /**
     * Find a booking by reference.
     *
     * @param string $reference
     * @return Booking|null
     */
    public function findByReference(string $reference): ?Booking
    {
        // Reference lookup is case-sensitive by default, but we'll make it case-insensitive
        // to handle any URL encoding issues
        return Booking::whereRaw('LOWER(reference) = LOWER(?)', [$reference])->first();
    }

    /**
     * Find bookings by user ID.
     *
     * @param int $userId
     * @param array $filters Optional filters (status, payment_status, etc.)
     * @return Collection<int, Booking>
     */
    public function findByUserId(int $userId, array $filters = []): Collection
    {
        $query = Booking::where('user_id', $userId);

        // Apply filters
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['payment_status'])) {
            $query->where('payment_status', $filters['payment_status']);
        }

        if (isset($filters['package_id'])) {
            $query->where('package_id', $filters['package_id']);
        }

        if (isset($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }

        // Sorting
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        return $query->get();
    }

    /**
     * Find guest bookings by email.
     *
     * @param string $email
     * @return Collection<int, Booking>
     */
    public function findGuestBookingsByEmail(string $email): Collection
    {
        return Booking::where('is_guest_booking', true)
            ->where(function ($query) use ($email) {
                $query->where('guest_email', $email)
                      ->orWhere('parent_email', $email);
            })
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Find bookings by package ID.
     *
     * @param int $packageId
     * @return Collection<int, Booking>
     */
    public function findByPackageId(int $packageId): Collection
    {
        return Booking::where('package_id', $packageId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Find all bookings with optional filters.
     *
     * @param array $filters Optional filters (status, payment_status, date_range, etc.)
     * @param int|null $limit
     * @param int|null $offset
     * @return Collection<int, Booking>
     */
    public function findAll(array $filters = [], ?int $limit = null, ?int $offset = null): Collection
    {
        $query = Booking::query();

        // Include soft-deleted bookings if requested (for debugging/admin purposes)
        // By default, SoftDeletes trait excludes deleted_at IS NOT NULL
        // Use withTrashed() to include soft-deleted bookings
        if (isset($filters['include_deleted']) && $filters['include_deleted']) {
            $query->withTrashed();
        }

        // Apply filters
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['payment_status'])) {
            $query->where('payment_status', $filters['payment_status']);
        }

        if (isset($filters['package_id'])) {
            $query->where('package_id', $filters['package_id']);
        }

        if (isset($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (isset($filters['is_guest_booking'])) {
            $query->where('is_guest_booking', $filters['is_guest_booking']);
        }

        if (isset($filters['parent_email'])) {
            $query->where('parent_email', $filters['parent_email']);
        }

        if (isset($filters['parent_phone'])) {
            $query->where('parent_phone', $filters['parent_phone']);
        }

        if (isset($filters['parent_postcode'])) {
            $query->where('parent_postcode', $filters['parent_postcode']);
        }

        if (isset($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }

        // Sorting
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        if ($limit !== null) {
            $query->limit($limit);
        }

        if ($offset !== null) {
            $query->offset($offset);
        }

        $bookings = $query->get();

        // Log booking count and details for debugging
        $softDeletedCount = 0;
        if (isset($filters['include_deleted']) && $filters['include_deleted']) {
            $softDeletedCount = $bookings->filter(function ($booking) {
                return $booking->trashed();
            })->count();
        }

        \Illuminate\Support\Facades\Log::info('Bookings fetched', [
            'total_count' => $bookings->count(),
            'user_id_filter' => isset($filters['user_id']) ? $filters['user_id'] : 'none',
            'booking_ids' => $bookings->pluck('id')->toArray(),
            'booking_references' => $bookings->pluck('reference')->toArray(),
            'booking_statuses' => $bookings->pluck('status')->toArray(),
            'booking_payment_statuses' => $bookings->pluck('payment_status')->toArray(),
            'booking_package_ids' => $bookings->pluck('package_id')->toArray(),
            'soft_deleted_count' => $softDeletedCount,
        ]);

        return $bookings;
    }

    /**
     * Create a new booking.
     *
     * @param array $data
     * @return Booking
     */
    public function create(array $data): Booking
    {
        return Booking::create($data);
    }

    /**
     * Update a booking.
     *
     * @param int $id
     * @param array $data
     * @return Booking
     */
    public function update(int $id, array $data): Booking
    {
        $booking = $this->findById($id);

        if (!$booking) {
            throw new \RuntimeException("Booking not found with ID: {$id}");
        }

        $booking->update($data);
        $booking->refresh();

        return $booking;
    }

    /**
     * Delete a booking (soft delete).
     *
     * @param int $id
     * @return bool
     */
    public function delete(int $id): bool
    {
        $booking = $this->findById($id);

        if (!$booking) {
            return false;
        }

        return $booking->delete();
    }

    /**
     * Check if a booking reference exists.
     *
     * @param string $reference
     * @return bool
     */
    public function referenceExists(string $reference): bool
    {
        return Booking::where('reference', $reference)->exists();
    }

    /**
     * Get bookings that need payment reminders.
     *
     * @param \DateTime $dueDate
     * @return Collection<int, Booking>
     */
    public function findBookingsNeedingPaymentReminder(\DateTime $dueDate): Collection
    {
        return Booking::where('payment_status', '!=', 'paid')
            ->where('next_payment_due_at', '<=', $dueDate->format('Y-m-d'))
            ->whereNotNull('next_payment_due_at')
            ->get();
    }

    /**
     * Get bookings with expiring hours.
     *
     * @param \DateTime $expiryDate
     * @return Collection<int, Booking>
     */
    public function findBookingsWithExpiringHours(\DateTime $expiryDate): Collection
    {
        return Booking::where('remaining_hours', '>', 0)
            ->where('hours_expires_at', '<=', $expiryDate->format('Y-m-d'))
            ->whereNotNull('hours_expires_at')
            ->get();
    }

    /**
     * Count bookings by status.
     *
     * @param string|null $status Optional status filter
     * @return int
     */
    public function countByStatus(?string $status = null): int
    {
        $query = Booking::query();

        if ($status !== null) {
            $query->where('status', $status);
        }

        return $query->count();
    }

    /**
     * Find a recent booking by user and package within a time window.
     * Used to prevent duplicate bookings (same user, same package, within X minutes).
     *
     * @param int $userId
     * @param int $packageId
     * @param \Carbon\Carbon $since
     * @return Booking|null
     */
    public function findRecentBookingByUserAndPackage(int $userId, int $packageId, \Carbon\Carbon $since): ?Booking
    {
        return Booking::where('user_id', $userId)
            ->where('package_id', $packageId)
            ->where('created_at', '>=', $since)
            ->orderBy('created_at', 'desc')
            ->first();
    }
}

