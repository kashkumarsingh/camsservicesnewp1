<?php

namespace App\Domain\Booking\Entities;

use App\ValueObjects\Booking\BookingReference;
use App\ValueObjects\Booking\BookingStatus;
use App\ValueObjects\Booking\PaymentStatus;

final class Booking
{
    /**
     * @param array<int, BookingParticipant> $participants
     * @param array<int, BookingSchedule> $schedules
     * @param array<int, \App\Domain\Payment\Entities\Payment> $payments
     */
    private function __construct(
        private readonly string $id,
        private readonly BookingReference $reference,
        private BookingStatus $status,
        private PaymentStatus $paymentStatus,
        private readonly bool $isGuestBooking,
        private readonly array $packageSummary,
        private readonly array $parentDetails,
        private readonly float $totalHours,
        private readonly float $bookedHours,
        private readonly float $usedHours,
        private readonly float $remainingHours,
        private readonly float $totalPrice,
        private readonly float $paidAmount,
        private readonly float $discountAmount,
        private readonly ?string $discountReason,
        private readonly ?string $paymentPlan,
        private readonly ?int $installmentCount,
        private readonly ?string $nextPaymentDueAt,
        private readonly ?string $startDate,
        private readonly ?string $packageExpiresAt,
        private readonly ?string $hoursExpiresAt,
        private readonly bool $allowHourRollover,
        private readonly bool $createdByAdmin,
        private readonly ?string $adminNotes,
        private readonly ?string $notes,
        private readonly ?string $cancellationReason,
        private readonly array $participants,
        private readonly array $schedules,
        private readonly array $payments,
        private readonly array $timestamps
    ) {
    }

    /**
     * @param array<int, BookingParticipant> $participants
     * @param array<int, BookingSchedule> $schedules
     * @param array<int, \App\Domain\Payment\Entities\Payment> $payments
     */
    public static function create(
        string $id,
        BookingReference $reference,
        BookingStatus $status,
        PaymentStatus $paymentStatus,
        bool $isGuestBooking,
        array $packageSummary,
        array $parentDetails,
        float $totalHours,
        float $bookedHours,
        float $usedHours,
        float $remainingHours,
        float $totalPrice,
        float $paidAmount,
        float $discountAmount,
        ?string $discountReason,
        ?string $paymentPlan,
        ?int $installmentCount,
        ?string $nextPaymentDueAt,
        ?string $startDate,
        ?string $packageExpiresAt,
        ?string $hoursExpiresAt,
        bool $allowHourRollover,
        bool $createdByAdmin,
        ?string $adminNotes,
        ?string $notes,
        ?string $cancellationReason,
        array $participants,
        array $schedules,
        array $payments,
        array $timestamps
    ): self {
        return new self(
            $id,
            $reference,
            $status,
            $paymentStatus,
            $isGuestBooking,
            $packageSummary,
            $parentDetails,
            $totalHours,
            $bookedHours,
            $usedHours,
            $remainingHours,
            $totalPrice,
            $paidAmount,
            $discountAmount,
            $discountReason,
            $paymentPlan,
            $installmentCount,
            $nextPaymentDueAt,
            $startDate,
            $packageExpiresAt,
            $hoursExpiresAt,
            $allowHourRollover,
            $createdByAdmin,
            $adminNotes,
            $notes,
            $cancellationReason,
            $participants,
            $schedules,
            $payments,
            $timestamps
        );
    }

    public function id(): string
    {
        return $this->id;
    }

    public function reference(): BookingReference
    {
        return $this->reference;
    }

    public function status(): BookingStatus
    {
        return $this->status;
    }

    public function paymentStatus(): PaymentStatus
    {
        return $this->paymentStatus;
    }

    public function isGuestBooking(): bool
    {
        return $this->isGuestBooking;
    }

    public function packageSummary(): array
    {
        return $this->packageSummary;
    }

    public function packageId(): string
    {
        return $this->packageSummary['id'] ?? '';
    }

    public function packageName(): string
    {
        return $this->packageSummary['name'] ?? '';
    }

    public function packageSlug(): ?string
    {
        return $this->packageSummary['slug'] ?? null;
    }

    public function parentDetails(): array
    {
        return $this->parentDetails;
    }

    public function parentFirstName(): string
    {
        return $this->parentDetails['first_name'] ?? '';
    }

    public function parentLastName(): string
    {
        return $this->parentDetails['last_name'] ?? '';
    }

    public function parentFullName(): string
    {
        return trim(sprintf('%s %s', $this->parentFirstName(), $this->parentLastName()));
    }

    public function parentEmail(): string
    {
        return $this->parentDetails['email'] ?? '';
    }

    public function parentPhone(): string
    {
        return $this->parentDetails['phone'] ?? '';
    }

    public function parentAddress(): ?string
    {
        return $this->parentDetails['address'] ?? null;
    }

    public function parentPostcode(): ?string
    {
        return $this->parentDetails['postcode'] ?? null;
    }

    public function parentCounty(): ?string
    {
        return $this->parentDetails['county'] ?? null;
    }

    public function emergencyContact(): ?string
    {
        return $this->parentDetails['emergency_contact'] ?? null;
    }

    public function totalHours(): float
    {
        return $this->totalHours;
    }

    public function bookedHours(): float
    {
        return $this->bookedHours;
    }

    public function usedHours(): float
    {
        return $this->usedHours;
    }

    public function remainingHours(): float
    {
        return $this->remainingHours;
    }

    public function totalPrice(): float
    {
        return $this->totalPrice;
    }

    public function paidAmount(): float
    {
        return $this->paidAmount;
    }

    public function discountAmount(): float
    {
        return $this->discountAmount;
    }

    public function discountReason(): ?string
    {
        return $this->discountReason;
    }

    public function outstandingAmount(): float
    {
        $balance = $this->totalPrice - $this->paidAmount - $this->discountAmount;

        return max(0.0, $balance);
    }

    public function paymentPlan(): ?string
    {
        return $this->paymentPlan;
    }

    public function installmentCount(): ?int
    {
        return $this->installmentCount;
    }

    public function nextPaymentDueAt(): ?string
    {
        return $this->nextPaymentDueAt;
    }

    public function startDate(): ?string
    {
        return $this->startDate;
    }

    public function packageExpiresAt(): ?string
    {
        return $this->packageExpiresAt;
    }

    public function hoursExpiresAt(): ?string
    {
        return $this->hoursExpiresAt;
    }

    public function allowHourRollover(): bool
    {
        return $this->allowHourRollover;
    }

    public function createdByAdmin(): bool
    {
        return $this->createdByAdmin;
    }

    public function adminNotes(): ?string
    {
        return $this->adminNotes;
    }

    public function notes(): ?string
    {
        return $this->notes;
    }

    public function cancellationReason(): ?string
    {
        return $this->cancellationReason;
    }

    /**
     * @return array<int, BookingParticipant>
     */
    public function participants(): array
    {
        return $this->participants;
    }

    /**
     * @return array<int, BookingSchedule>
     */
    public function schedules(): array
    {
        return $this->schedules;
    }

    /**
     * Get payments for this booking.
     * 
     * Returns Payment domain entities (independent domain).
     * 
     * @return array<int, \App\Domain\Payment\Entities\Payment>
     */
    public function payments(): array
    {
        return $this->payments;
    }

    public function createdAt(): ?string
    {
        return $this->timestamps['created_at'] ?? null;
    }

    public function updatedAt(): ?string
    {
        return $this->timestamps['updated_at'] ?? null;
    }

    public function cancelledAt(): ?string
    {
        return $this->timestamps['cancelled_at'] ?? null;
    }
}

