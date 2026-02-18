<?php

namespace App\Actions\Booking;

use App\Contracts\Booking\IBookingScheduleRepository;

class CheckChildConflictsAction
{
    public function __construct(
        private readonly IBookingScheduleRepository $scheduleRepository
    ) {
    }

    /**
     * Ensure participants in the booking are not double-booked at same time.
     *
     * @throws \RuntimeException
     */
    public function execute(
        int $bookingId,
        string $date,
        string $startTime,
        string $endTime,
        ?int $excludeScheduleId = null
    ): void {
        $conflicts = $this->scheduleRepository->findChildConflictingSchedules(
            bookingId: $bookingId,
            date: $date,
            startTime: $startTime,
            endTime: $endTime,
            excludeScheduleId: $excludeScheduleId
        );

        if ($conflicts->isNotEmpty()) {
            throw new \RuntimeException('Participant is already scheduled for this time slot.');
        }
    }
}

