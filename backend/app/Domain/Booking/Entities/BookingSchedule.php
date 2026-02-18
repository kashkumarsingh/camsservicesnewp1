<?php

namespace App\Domain\Booking\Entities;

final class BookingSchedule
{
    private function __construct(
        private readonly string $id,
        private readonly string $date,
        private readonly string $startTime,
        private readonly string $endTime,
        private readonly float $durationHours,
        private readonly ?float $actualDurationHours,
        private readonly string $status,
        private readonly ?array $trainer,
        private readonly ?string $modeKey,
        private readonly ?string $itineraryNotes,
        private readonly int $order
    ) {
    }

    public static function create(
        string $id,
        string $date,
        string $startTime,
        string $endTime,
        float $durationHours,
        ?float $actualDurationHours,
        string $status,
        ?array $trainer,
        ?string $modeKey,
        ?string $itineraryNotes,
        int $order
    ): self {
        return new self(
            $id,
            $date,
            $startTime,
            $endTime,
            $durationHours,
            $actualDurationHours,
            $status,
            $trainer,
            $modeKey,
            $itineraryNotes,
            $order
        );
    }

    public function id(): string
    {
        return $this->id;
    }

    public function date(): string
    {
        return $this->date;
    }

    public function startTime(): string
    {
        return $this->startTime;
    }

    public function endTime(): string
    {
        return $this->endTime;
    }

    public function durationHours(): float
    {
        return $this->durationHours;
    }

    public function actualDurationHours(): ?float
    {
        return $this->actualDurationHours;
    }

    public function status(): string
    {
        return $this->status;
    }

    public function trainer(): ?array
    {
        return $this->trainer;
    }

    public function modeKey(): ?string
    {
        return $this->modeKey;
    }

    public function itineraryNotes(): ?string
    {
        return $this->itineraryNotes;
    }

    public function order(): int
    {
        return $this->order;
    }
}

