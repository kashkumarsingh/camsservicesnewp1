<?php

namespace App\Domain\Booking\Mappers;

use App\Domain\Booking\Entities\Booking as BookingEntity;
use App\Domain\Booking\Entities\BookingParticipant;
use App\Domain\Booking\Entities\BookingSchedule;
use App\Domain\Payment\Entities\Payment as PaymentEntity;
use App\Domain\Payment\Mappers\PaymentMapper;
use App\Models\Booking as BookingModel;
use App\ValueObjects\Booking\BookingReference;
use App\ValueObjects\Booking\BookingStatus;
use App\ValueObjects\Booking\PaymentStatus;
use Illuminate\Support\Collection;

final class BookingMapper
{
    public static function fromModel(BookingModel $model): BookingEntity
    {
        $model->loadMissing([
            'package',
            'participants',
            'schedules.trainer',
            'payments',
        ]);

        $participants = $model->participants?->map(
            fn ($participant, int $index) => BookingParticipant::create(
                id: (string) $participant->id,
                childId: $participant->child_id ? (int) $participant->child_id : null,
                firstName: $participant->first_name,
                lastName: $participant->last_name,
                dateOfBirth: $participant->date_of_birth?->toDateString(),
                age: $participant->date_of_birth?->age,
                medicalInfo: $participant->medical_info,
                specialNeeds: $participant->special_needs,
                order: $participant->order ?? $index
            )
        ) ?? new Collection();

        $schedules = $model->schedules?->map(
            fn ($schedule) => BookingSchedule::create(
                id: (string) $schedule->id,
                date: $schedule->date?->toDateString() ?? '',
                startTime: $schedule->start_time ?? '',
                endTime: $schedule->end_time ?? '',
                durationHours: (float) ($schedule->duration_hours ?? 0),
                actualDurationHours: $schedule->actual_duration_hours ? (float) $schedule->actual_duration_hours : null,
                status: $schedule->status ?? 'scheduled',
                trainer: $schedule->trainer ? [
                    'id' => (string) $schedule->trainer->id,
                    'name' => $schedule->trainer->name ?? '',
                    'slug' => $schedule->trainer->slug ?? '',
                    'avatar' => $schedule->trainer->image ?? null,
                ] : null,
                modeKey: $schedule->mode_key ?? null,
                itineraryNotes: is_array($schedule->itinerary_notes) ? json_encode($schedule->itinerary_notes) : ($schedule->itinerary_notes ?? null),
                order: $schedule->order ?? 0
            )
        ) ?? new Collection();

        // Map payments using Payment domain (independent domain)
        // Payment domain handles its own mapping via PaymentMapper
        $payments = $model->payments?->map(
            fn ($payment) => PaymentMapper::fromModel($payment)
        ) ?? new Collection();

        return BookingEntity::create(
            id: (string) $model->id,
            reference: BookingReference::fromString((string) ($model->reference ?? '')),
            status: BookingStatus::fromString((string) ($model->status ?? 'draft')),
            paymentStatus: PaymentStatus::fromString((string) ($model->payment_status ?? 'pending')),
            isGuestBooking: (bool) $model->is_guest_booking,
            packageSummary: [
                'id' => $model->package?->id ? (string) $model->package->id : '',
                'name' => $model->package?->name,
                'slug' => $model->package?->slug,
            ],
            parentDetails: [
                'first_name' => $model->parent_first_name,
                'last_name' => $model->parent_last_name,
                'email' => $model->parent_email,
                'phone' => $model->parent_phone,
                'address' => $model->parent_address,
                'postcode' => $model->parent_postcode,
                'county' => $model->parent_county,
                'emergency_contact' => $model->emergency_contact,
            ],
            totalHours: (float) $model->total_hours,
            bookedHours: (float) $model->booked_hours,
            usedHours: (float) $model->used_hours,
            remainingHours: (float) $model->remaining_hours,
            totalPrice: (float) $model->total_price,
            paidAmount: (float) $model->paid_amount,
            discountAmount: (float) $model->discount_amount,
            discountReason: $model->discount_reason,
            paymentPlan: $model->payment_plan,
            installmentCount: $model->installment_count,
            nextPaymentDueAt: $model->next_payment_due_at?->toDateString(),
            startDate: $model->start_date?->toDateString(),
            packageExpiresAt: $model->package_expires_at?->toDateString(),
            hoursExpiresAt: $model->hours_expires_at?->toDateString(),
            allowHourRollover: (bool) $model->allow_hour_rollover,
            createdByAdmin: (bool) $model->created_by_admin,
            adminNotes: $model->admin_notes,
            notes: $model->notes,
            cancellationReason: $model->cancellation_reason,
            participants: $participants->values()->all(),
            schedules: $schedules->values()->all(),
            payments: $payments->values()->all(),
            timestamps: [
                'created_at' => $model->created_at?->toIso8601String(),
                'updated_at' => $model->updated_at?->toIso8601String(),
                'cancelled_at' => $model->cancelled_at?->toIso8601String(),
            ]
        );
    }
}

