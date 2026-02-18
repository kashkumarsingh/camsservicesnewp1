<?php

namespace App\Actions\Booking;

use App\Contracts\Booking\IBookingScheduleRepository;

class CheckTrainerConflictsAction
{
    public function __construct(
        private readonly IBookingScheduleRepository $scheduleRepository
    ) {
    }

    /**
     * Ensure the trainer is free for the requested time range.
     *
     * @throws \RuntimeException
     */
    public function execute(
        int $trainerId,
        string $date,
        string $startTime,
        string $endTime,
        ?int $excludeScheduleId = null
    ): void {
        $conflicts = $this->scheduleRepository->findConflictingSchedules(
            trainerId: $trainerId,
            date: $date,
            startTime: $startTime,
            endTime: $endTime,
            excludeScheduleId: $excludeScheduleId
        );

        if ($conflicts->isNotEmpty()) {
            throw new \RuntimeException('Trainer is already booked for this time slot. Please choose a different time.');
        }
    }
}

