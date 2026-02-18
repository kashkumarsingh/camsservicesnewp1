<?php

namespace App\Contracts\Booking;

use App\Models\BookingSchedule;
use Illuminate\Database\Eloquent\Collection;

/**
 * Booking Schedule Repository Interface
 * 
 * Clean Architecture: Application Layer (Port/Interface)
 * Purpose: Defines the contract for booking schedule repository implementations
 * Location: backend/app/Contracts/Booking/IBookingScheduleRepository.php
 * 
 * This interface:
 * - Defines all booking schedule data access operations
 * - Allows for different implementations (Eloquent, API, Mock)
 * - Follows repository pattern for testability
 */
interface IBookingScheduleRepository
{
    /**
     * Find a schedule by ID.
     *
     * @param int $id
     * @return BookingSchedule|null
     */
    public function findById(int $id): ?BookingSchedule;

    /**
     * Find schedules by booking ID.
     *
     * @param int $bookingId
     * @return Collection<int, BookingSchedule>
     */
    public function findByBookingId(int $bookingId): Collection;

    /**
     * Find schedules by trainer ID.
     *
     * @param int $trainerId
     * @param array $filters Optional filters (date, status, etc.)
     * @return Collection<int, BookingSchedule>
     */
    public function findByTrainerId(int $trainerId, array $filters = []): Collection;

    /**
     * Find schedules by date range.
     *
     * @param string $startDate
     * @param string $endDate
     * @return Collection<int, BookingSchedule>
     */
    public function findByDateRange(string $startDate, string $endDate): Collection;

    /**
     * Find conflicting schedules for a trainer.
     *
     * @param int $trainerId
     * @param string $date
     * @param string $startTime
     * @param string $endTime
     * @param int|null $excludeScheduleId Optional schedule ID to exclude from conflict check
     * @return Collection<int, BookingSchedule>
     */
    public function findConflictingSchedules(
        int $trainerId,
        string $date,
        string $startTime,
        string $endTime,
        ?int $excludeScheduleId = null
    ): Collection;

    /**
     * Find conflicting schedules for a child (participant).
     *
     * @param int $bookingId
     * @param string $date
     * @param string $startTime
     * @param string $endTime
     * @param int|null $excludeScheduleId Optional schedule ID to exclude from conflict check
     * @return Collection<int, BookingSchedule>
     */
    public function findChildConflictingSchedules(
        int $bookingId,
        string $date,
        string $startTime,
        string $endTime,
        ?int $excludeScheduleId = null
    ): Collection;

    /**
     * Create a new schedule.
     *
     * @param array $data
     * @return BookingSchedule
     */
    public function create(array $data): BookingSchedule;

    /**
     * Update a schedule.
     *
     * @param int $id
     * @param array $data
     * @return BookingSchedule
     */
    public function update(int $id, array $data): BookingSchedule;

    /**
     * Delete a schedule.
     *
     * @param int $id
     * @return bool
     */
    public function delete(int $id): bool;

    /**
     * Get schedules for a specific date.
     *
     * @param string $date
     * @return Collection<int, BookingSchedule>
     */
    public function findByDate(string $date): Collection;

    /**
     * Get upcoming schedules.
     *
     * @param int $days Number of days ahead
     * @return Collection<int, BookingSchedule>
     */
    public function findUpcoming(int $days = 7): Collection;

    /**
     * Get schedules by status.
     *
     * @param string $status
     * @return Collection<int, BookingSchedule>
     */
    public function findByStatus(string $status): Collection;

    /**
     * Count scheduled sessions for a trainer on a given date (for capacity scoring).
     *
     * @param int $trainerId
     * @param string $date
     * @param int|null $excludeScheduleId
     * @return int
     */
    public function countTrainerSchedulesOnDate(int $trainerId, string $date, ?int $excludeScheduleId = null): int;

    /**
     * Find assigned (scheduled) sessions for a trainer on any of the given dates.
     * Used to block marking availability as unavailable when trainer has confirmed/scheduled sessions.
     *
     * @param int $trainerId
     * @param array<int, string> $dates Y-m-d date strings
     * @return Collection<int, BookingSchedule>
     */
    public function findAssignedSessionsOnDates(int $trainerId, array $dates): Collection;
}

