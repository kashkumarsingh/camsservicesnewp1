<?php

namespace App\Repositories\Booking;

use App\Contracts\Booking\IBookingScheduleRepository;
use App\Models\BookingSchedule;
use Illuminate\Database\Eloquent\Collection;

/**
 * Eloquent Booking Schedule Repository
 * 
 * Clean Architecture: Infrastructure Layer (Repository Implementation)
 * Purpose: Eloquent implementation of booking schedule repository
 * Location: backend/app/Repositories/Booking/EloquentBookingScheduleRepository.php
 * 
 * This repository:
 * - Implements IBookingScheduleRepository interface
 * - Uses Eloquent ORM for data access
 * - Handles all booking schedule CRUD operations
 * - Provides conflict detection methods
 */
class EloquentBookingScheduleRepository implements IBookingScheduleRepository
{
    /**
     * Find a schedule by ID.
     *
     * @param int $id
     * @return BookingSchedule|null
     */
    public function findById(int $id): ?BookingSchedule
    {
        return BookingSchedule::find($id);
    }

    /**
     * Find schedules by booking ID.
     *
     * @param int $bookingId
     * @return Collection<int, BookingSchedule>
     */
    public function findByBookingId(int $bookingId): Collection
    {
        return BookingSchedule::where('booking_id', $bookingId)
            ->orderBy('date')
            ->orderBy('start_time')
            ->get();
    }

    /**
     * Find schedules by trainer ID.
     *
     * @param int $trainerId
     * @param array $filters Optional filters (date, status, etc.)
     * @return Collection<int, BookingSchedule>
     */
    public function findByTrainerId(int $trainerId, array $filters = []): Collection
    {
        $query = BookingSchedule::where('trainer_id', $trainerId);

        // Apply filters
        if (isset($filters['date'])) {
            $query->where('date', $filters['date']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['date_from'])) {
            $query->where('date', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->where('date', '<=', $filters['date_to']);
        }

        // Sorting
        $sortBy = $filters['sort_by'] ?? 'date';
        $sortOrder = $filters['sort_order'] ?? 'asc';
        $query->orderBy($sortBy, $sortOrder);

        return $query->get();
    }

    /**
     * Find schedules by date range.
     *
     * @param string $startDate
     * @param string $endDate
     * @return Collection<int, BookingSchedule>
     */
    public function findByDateRange(string $startDate, string $endDate): Collection
    {
        return BookingSchedule::whereBetween('date', [$startDate, $endDate])
            ->orderBy('date')
            ->orderBy('start_time')
            ->get();
    }

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
    ): Collection {
        $query = BookingSchedule::where('trainer_id', $trainerId)
            ->where('date', $date)
            ->where('status', BookingSchedule::STATUS_SCHEDULED);

        // Exclude specific schedule if provided
        if ($excludeScheduleId !== null) {
            $query->where('id', '!=', $excludeScheduleId);
        }

        // Check for time overlaps using proper interval overlap logic
        // Two intervals overlap if: existing_start < new_end AND existing_end > new_start
        $query->where(function ($q) use ($startTime, $endTime) {
            $q->where('start_time', '<', $endTime)
              ->where('end_time', '>', $startTime);
        });

        return $query->get();
    }

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
    ): Collection {
        $query = BookingSchedule::where('booking_id', $bookingId)
            ->where('date', $date)
            ->whereIn('status', [
                BookingSchedule::STATUS_SCHEDULED,
                BookingSchedule::STATUS_RESCHEDULED
            ]);

        // Exclude specific schedule if provided
        if ($excludeScheduleId !== null) {
            $query->where('id', '!=', $excludeScheduleId);
        }

        // Check for time overlaps using proper interval overlap logic
        // Two intervals overlap if: existing_start < new_end AND existing_end > new_start
        $query->where(function ($q) use ($startTime, $endTime) {
            $q->where('start_time', '<', $endTime)
              ->where('end_time', '>', $startTime);
        });

        return $query->get();
    }

    /**
     * Create a new schedule.
     *
     * @param array $data
     * @return BookingSchedule
     */
    public function create(array $data): BookingSchedule
    {
        return BookingSchedule::create($data);
    }

    /**
     * Update a schedule.
     *
     * @param int $id
     * @param array $data
     * @return BookingSchedule
     */
    public function update(int $id, array $data): BookingSchedule
    {
        $schedule = $this->findById($id);

        if (!$schedule) {
            throw new \RuntimeException("Booking schedule not found with ID: {$id}");
        }

        $schedule->update($data);
        $schedule->refresh();

        return $schedule;
    }

    /**
     * Delete a schedule.
     *
     * @param int $id
     * @return bool
     */
    public function delete(int $id): bool
    {
        $schedule = $this->findById($id);

        if (!$schedule) {
            return false;
        }

        return $schedule->delete();
    }

    /**
     * Get schedules for a specific date.
     *
     * @param string $date
     * @return Collection<int, BookingSchedule>
     */
    public function findByDate(string $date): Collection
    {
        return BookingSchedule::where('date', $date)
            ->orderBy('start_time')
            ->get();
    }

    /**
     * Get upcoming schedules.
     *
     * @param int $days Number of days ahead
     * @return Collection<int, BookingSchedule>
     */
    public function findUpcoming(int $days = 7): Collection
    {
        $startDate = now()->format('Y-m-d');
        $endDate = now()->addDays($days)->format('Y-m-d');

        return BookingSchedule::whereBetween('date', [$startDate, $endDate])
            ->whereIn('status', [
                BookingSchedule::STATUS_SCHEDULED,
                BookingSchedule::STATUS_RESCHEDULED
            ])
            ->orderBy('date')
            ->orderBy('start_time')
            ->get();
    }

    /**
     * Get schedules by status.
     *
     * @param string $status
     * @return Collection<int, BookingSchedule>
     */
    public function findByStatus(string $status): Collection
    {
        return BookingSchedule::where('status', $status)
            ->orderBy('date')
            ->orderBy('start_time')
            ->get();
    }

    /**
     * Count scheduled sessions for a trainer on a given date (for capacity scoring).
     *
     * @param int $trainerId
     * @param string $date
     * @param int|null $excludeScheduleId
     * @return int
     */
    public function countTrainerSchedulesOnDate(int $trainerId, string $date, ?int $excludeScheduleId = null): int
    {
        $query = BookingSchedule::where('trainer_id', $trainerId)
            ->where('date', $date)
            ->whereIn('status', [
                BookingSchedule::STATUS_SCHEDULED,
                BookingSchedule::STATUS_RESCHEDULED,
            ]);

        if ($excludeScheduleId !== null) {
            $query->where('id', '!=', $excludeScheduleId);
        }

        return $query->count();
    }

    /**
     * Find assigned (scheduled) sessions for a trainer on any of the given dates.
     *
     * @param int $trainerId
     * @param array<int, string> $dates Y-m-d date strings
     * @return Collection<int, BookingSchedule>
     */
    public function findAssignedSessionsOnDates(int $trainerId, array $dates): Collection
    {
        if (empty($dates)) {
            return new Collection();
        }

        return BookingSchedule::where('trainer_id', $trainerId)
            ->whereIn('date', $dates)
            ->where('status', BookingSchedule::STATUS_SCHEDULED)
            ->orderBy('date')
            ->orderBy('start_time')
            ->get();
    }
}

