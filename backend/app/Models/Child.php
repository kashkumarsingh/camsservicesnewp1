<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Child Model (Domain Layer)
 * 
 * Clean Architecture: Domain Layer
 * Purpose: Represents a child entity linked to a parent/guardian
 * Location: backend/app/Models/Child.php
 * 
 * This model contains:
 * - Child information (name, age, address)
 * - Approval status and tracking
 * - Relationships (User/Parent, Checklist, BookingParticipants)
 * 
 * The Domain Layer is the innermost layer - it has NO dependencies
 * on external frameworks or infrastructure.
 */
class Child extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Approval status constants
     */
    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'age',
        'date_of_birth',
        'gender',
        'address',
        'postcode',
        'city',
        'region',
        'latitude',
        'longitude',
        'approval_status',
        'approved_at',
        'approved_by',
        'rejection_reason',
        'rejected_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'approved_at' => 'datetime',
            'rejected_at' => 'datetime',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
        ];
    }

    /**
     * Get the parent/guardian that owns this child.
     *
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the admin who approved this child.
     *
     * @return BelongsTo
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the checklist for this child.
     *
     * @return HasOne
     */
    public function checklist(): HasOne
    {
        return $this->hasOne(ChildChecklist::class);
    }

    /**
     * Get the booking participants for this child.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function bookingParticipants(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(BookingParticipant::class);
    }

    /**
     * Get all bookings for this child (via booking participants).
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasManyThrough
     */
    public function bookings()
    {
        return $this->hasManyThrough(
            Booking::class,
            BookingParticipant::class,
            'child_id', // Foreign key on booking_participants
            'id', // Foreign key on bookings
            'id', // Local key on children
            'booking_id' // Local key on booking_participants
        );
    }

    /**
     * Get activity logs for this child.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function activityLogs(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ActivityLog::class)->orderBy('activity_date', 'desc');
    }

    /**
     * Check if the child is approved.
     *
     * @return bool
     */
    public function isApproved(): bool
    {
        return $this->approval_status === self::STATUS_APPROVED;
    }

    /**
     * Check if the child is pending approval.
     *
     * @return bool
     */
    public function isPending(): bool
    {
        return $this->approval_status === self::STATUS_PENDING;
    }

    /**
     * Check if the child is rejected.
     *
     * @return bool
     */
    public function isRejected(): bool
    {
        return $this->approval_status === self::STATUS_REJECTED;
    }

    /**
     * Scope to get only approved children.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeApproved($query)
    {
        return $query->where('approval_status', self::STATUS_APPROVED);
    }

    /**
     * Scope to get only pending children.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopePending($query)
    {
        return $query->where('approval_status', self::STATUS_PENDING);
    }

    /**
     * Scope to get only rejected children.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeRejected($query)
    {
        return $query->where('approval_status', self::STATUS_REJECTED);
    }

    /**
     * Get active bookings for this child (confirmed/paid, not cancelled, not expired).
     * 
     * A booking is considered "active" if:
     * - Status is draft, pending, or confirmed
     * - Payment status is not refunded
     * - Not soft deleted
     * - Package has not expired (package_expires_at is null or in the future)
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasManyThrough
     */
    public function activeBookings()
    {
        return $this->hasManyThrough(
            Booking::class,
            BookingParticipant::class,
            'child_id', // Foreign key on booking_participants
            'id', // Foreign key on bookings
            'id', // Local key on children
            'booking_id' // Local key on booking_participants
        )
        ->whereIn('bookings.status', ['draft', 'pending', 'confirmed'])
        ->where('bookings.payment_status', '!=', 'refunded')
        ->whereNull('bookings.deleted_at')
        ->where(function ($query) {
            // Package is active if:
            // 1. package_expires_at is NULL (no expiry set) OR
            // 2. package_expires_at is in the future (not expired)
            $query->whereNull('bookings.package_expires_at')
                  ->orWhere('bookings.package_expires_at', '>', now());
        });
    }

    /**
     * Check if child has an active booking for a specific package.
     *
     * @param int $packageId
     * @return bool
     */
    public function hasActiveBookingForPackage(int $packageId): bool
    {
        return $this->activeBookings()
            ->where('bookings.package_id', $packageId)
            ->exists();
    }

    /**
     * Check if child has any active booking (regardless of package).
     * Used to enforce "one active package per child" business rule.
     *
     * @return bool
     */
    public function hasAnyActiveBooking(): bool
    {
        return $this->activeBookings()->exists();
    }

    /**
     * Get active bookings for this child with package and mode information.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getActiveBookingsWithDetails()
    {
        return $this->activeBookings()
            ->with(['package', 'participants'])
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'reference' => $booking->reference,
                    'package' => [
                        'id' => $booking->package->id ?? null,
                        'name' => $booking->package->name ?? null,
                        'weeks' => $booking->package->duration_weeks ?? null,
                    ],
                    'mode_key' => $booking->mode_key,
                    'mode_name' => $booking->mode_name,
                    'status' => $booking->status,
                    'payment_status' => $booking->payment_status,
                    'package_expires_at' => $booking->package_expires_at,
                    'created_at' => $booking->created_at,
                ];
            });
    }

    /**
     * Auto-approve child when checklist is completed.
     * This method is called automatically when a checklist is marked as completed.
     * 
     * @param bool $sendEmail Whether to send email notification (default: true)
     * @return bool True if child was approved, false if already approved or cannot be approved
     */
    public function autoApproveFromChecklist(bool $sendEmail = true): bool
    {
        // Only approve if currently pending
        if ($this->approval_status !== self::STATUS_PENDING) {
            return false;
        }

        // Update approval status
        $this->update([
            'approval_status' => self::STATUS_APPROVED,
            'approved_at' => now(),
            'approved_by' => auth()->id(),
            'rejection_reason' => null,
            'rejected_at' => null,
        ]);

        if ($sendEmail) {
            app(\App\Contracts\Notifications\INotificationDispatcher::class)
                ->dispatch(\App\Services\Notifications\NotificationIntentFactory::childApproved($this));
        }

        return true;
    }

    /**
     * Auto-unapprove child when checklist is marked as incomplete.
     * This method is called automatically when a checklist is unchecked.
     * 
     * @return bool True if child was unapproved, false if already pending/rejected
     */
    public function autoUnapproveFromChecklist(): bool
    {
        // Only unapprove if currently approved
        if ($this->approval_status !== self::STATUS_APPROVED) {
            return false;
        }

        // Reset to pending status
        $this->update([
            'approval_status' => self::STATUS_PENDING,
            'approved_at' => null,
            'approved_by' => null,
        ]);

        return true;
    }

    /**
     * Check for dependencies that prevent safe deletion.
     *
     * @return bool
     */
    public function hasDependencies(): bool
    {
        return $this->hasAnyBookings()
            || $this->hasAnyPayments()
            || $this->hasAttendanceRecords()
            || $this->hasCompletedSessions();
    }

    /**
     * Check for future-dated bookings.
     *
     * @return bool
     */
    public function hasFutureBookings(): bool
    {
        return $this->bookings()->where('start_date', '>', now())->exists();
    }

    /**
     * Check for any associated payments (non-refunded).
     *
     * @return bool
     */
    public function hasPayments(): bool
    {
        return $this->bookings()->where('payment_status', '!=', 'refunded')->exists();
    }

    /**
     * Check for any bookings at all linked to this child.
     * This includes past, present, future, draft, cancelled, and refunded bookings.
     *
     * Business rule: any booking record counts as "history" for deletion safeguards.
     */
    public function hasAnyBookings(): bool
    {
        return $this->bookings()->exists();
    }

    /**
     * Check for any associated payments, including refunded ones.
     *
     * Business rule: any payment history (even if later refunded) prevents hard deletion
     * to preserve financial and audit records.
     */
    public function hasAnyPayments(): bool
    {
        return $this->bookings()->whereHas('payments')->exists();
    }

    /**
     * Check for any attendance records for this child across all schedules.
     *
     * @return bool
     */
    public function hasAttendanceRecords(): bool
    {
        return \App\Models\ScheduleAttendance::whereHas('participant', function ($query) {
            $query->where('child_id', $this->id);
        })->exists();
    }

    /**
     * Check for any completed sessions for this child.
     *
     * A session counts as "completed" if the underlying schedule has a completed status
     * or an associated completion record.
     *
     * @return bool
     */
    public function hasCompletedSessions(): bool
    {
        return \App\Models\BookingSchedule::whereHas('booking.participants', function ($query) {
            $query->where('child_id', $this->id);
        })->where(function ($query) {
            $query->where('status', \App\Models\BookingSchedule::STATUS_COMPLETED)
                  ->orWhereHas('completion');
        })->exists();
    }

    /**
     * A child can be archived if they have no active bookings and no recent activity.
     *
     * @param int $monthsInactive
     * @return bool
     */
    public function isArchivalEligible(int $monthsInactive = 6): bool
    {
        $hasActiveBookings = $this->activeBookings()->exists();

        $lastActivityDate = $this->activityLogs()->latest('activity_date')->value('activity_date');
        $isInactive = !$lastActivityDate || now()->diffInMonths($lastActivityDate) >= $monthsInactive;

        return !$hasActiveBookings && $isInactive;
    }

    /**
     * Check if a child can be safely deleted.
     *
     * Business rules:
     * - A child CANNOT be deleted if they have:
     *   - Any purchased hours (used or unused)
     *   - Any bookings (past, present, or future)
     *   - Any payment history (including refunded)
     *   - Any attendance records
     *   - Any completed sessions
     * - A child CAN ONLY be deleted if:
     *   - They were created less than 24 hours ago
     *   - They have zero bookings
     *   - They have zero payments
     *   - They have zero attendance / completion history
     *
     * @return bool
     */
    public function isDeletionAllowed(): bool
    {
        // Safety gate: only allow deletion for very new records
        if ($this->created_at && $this->created_at->diffInHours(now()) > 24) {
            return false;
        }

        // If the child has *any* historical footprint, disallow hard deletion
        if ($this->hasAnyBookings()
            || $this->hasAnyPayments()
            || $this->hasAttendanceRecords()
            || $this->hasCompletedSessions()
        ) {
            return false;
        }

        return true;
    }
}

