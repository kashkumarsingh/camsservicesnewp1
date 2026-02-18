<?php

namespace App\Domain\Booking\Entities;

final class BookingParticipant
{
    private function __construct(
        private readonly string $id,
        private readonly ?int $childId,
        private readonly string $firstName,
        private readonly string $lastName,
        private readonly ?string $dateOfBirth,
        private readonly ?int $age,
        private readonly ?string $medicalInfo,
        private readonly ?string $specialNeeds,
        private readonly int $order
    ) {
    }

    public static function create(
        string $id,
        ?int $childId,
        string $firstName,
        string $lastName,
        ?string $dateOfBirth,
        ?int $age,
        ?string $medicalInfo,
        ?string $specialNeeds,
        int $order
    ): self {
        return new self(
            $id,
            $childId,
            $firstName,
            $lastName,
            $dateOfBirth,
            $age,
            $medicalInfo,
            $specialNeeds,
            $order
        );
    }

    public function id(): string
    {
        return $this->id;
    }

    public function childId(): ?int
    {
        return $this->childId;
    }

    public function firstName(): string
    {
        return $this->firstName;
    }

    public function lastName(): string
    {
        return $this->lastName;
    }

    public function fullName(): string
    {
        return trim(sprintf('%s %s', $this->firstName, $this->lastName));
    }

    public function dateOfBirth(): ?string
    {
        return $this->dateOfBirth;
    }

    public function age(): ?int
    {
        return $this->age;
    }

    public function medicalInfo(): ?string
    {
        return $this->medicalInfo;
    }

    public function specialNeeds(): ?string
    {
        return $this->specialNeeds;
    }

    public function order(): int
    {
        return $this->order;
    }
}

