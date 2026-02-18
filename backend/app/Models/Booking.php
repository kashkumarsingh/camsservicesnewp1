<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Booking Model (Domain Layer)
 * 
 * Clean Architecture: Domain Layer
 * Purpose: Represents a booking entity in the system
 * Location: backend/app/Models/Booking.php
 * 
 * This model contains:
 * - Business logic (scopes, methods)
 * - Domain rules (validation, constraints)
 * - Relationships (User, Package, Participants, Schedules, Payments)
 * 
 * The Domain Layer is the innermost layer - it has NO dependencies
 * on external frameworks or infrastructure.
 */
class Booking extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Booking status constants
     */
    public const STATUS_DRAFT = 'draft';
    public const STATUS_PENDING = 'pending';
    public const STATUS_CONFIRMED = 'confirmed';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_COMPLETED = 'completed';

    /**
     * Payment status constants
     */
    public const PAYMENT_STATUS_PENDING = 'pending';
    public const PAYMENT_STATUS_PARTIAL = 'partial';
    public const PAYMENT_STATUS_PAID = 'paid';
    public const PAYMENT_STATUS_REFUNDED = 'refunded';
    public const PAYMENT_STATUS_FAILED = 'failed';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'reference',
        'user_id',
        'is_guest_booking',
        'guest_email',
        'guest_phone',
        'package_id',
        'status',
        'payment_status',
        'parent_first_name',
        'parent_last_name',
        'parent_email',
        'parent_phone',
        'parent_address',
        'parent_postcode',
        'parent_county',
        'emergency_contact',
        'total_hours',
        'booked_hours',
        'used_hours',
        'remaining_hours',
        'total_price',
        'paid_amount',
        'discount_amount',
        'discount_reason',
        'payment_plan',
        'installment_count',
        'next_payment_due_at',
        'start_date',
        'package_expires_at',
        'hours_expires_at',
        'allow_hour_rollover',
        'created_by_admin',
        'admin_notes',
        'notes',
        'cancellation_reason',
        'cancelled_at',
        'ip_address',
        'user_agent',
        'calculated_fields',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_guest_booking' => 'boolean',
        'total_hours' => 'decimal:2',
        'booked_hours' => 'decimal:2',
        'used_hours' => 'decimal:2',
        'remaining_hours' => 'decimal:2',
        'total_price' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'installment_count' => 'integer',
        'allow_hour_rollover' => 'boolean',
        'created_by_admin' => 'boolean',
        'next_payment_due_at' => 'date',
        'start_date' => 'date',
        'package_expires_at' => 'date',
        'hours_expires_at' => 'date',
        'cancelled_at' => 'datetime',
        'calculated_fields' => 'array',
    ];

    /**
     * Get the user that owns the booking (nullable for guest bookings).
     *
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the package for this booking.
     *
     * @return BelongsTo
     */
    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }

    /**
     * Get the participants (children) for this booking.
     *
     * @return HasMany
     */
    public function participants(): HasMany
    {
        return $this->hasMany(BookingParticipant::class)->orderBy('order');
    }

    /**
     * Get the children (via participants) for this booking.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasManyThrough
     */
    public function children()
    {
        return $this->hasManyThrough(
            Child::class,
            BookingParticipant::class,
            'booking_id', // Foreign key on booking_participants
            'id', // Foreign key on children
            'id', // Local key on bookings
            'child_id' // Local key on booking_participants
        );
    }

    /**
     * Get formatted list of children names for this booking.
     *
     * @return string
     */
    public function getChildrenNamesAttribute(): string
    {
        $children = $this->participants()
            ->whereNotNull('child_id')
            ->with('child')
            ->get()
            ->map(function ($participant) {
                return $participant->child ? $participant->child->name : $participant->full_name;
            });

        return $children->join(', ');
    }

    /**
     * Get the schedules (sessions) for this booking.
     *
     * @return HasMany
     */
    public function schedules(): HasMany
    {
        return $this->hasMany(BookingSchedule::class)->orderBy('date')->orderBy('start_time');
    }

    /**
     * Get the payments for this booking.
     * 
     * Uses polymorphic relationship to maintain separation of concerns.
     * Payment domain is independent - Booking references payments, not owns them.
     *
     * @return \Illuminate\Database\Eloquent\Relations\MorphMany
     */
    public function payments(): \Illuminate\Database\Eloquent\Relations\MorphMany
    {
        return $this->morphMany(\App\Models\Payment::class, 'payable')->orderBy('created_at', 'desc');
    }
    
    /**
     * Get the status changes (audit trail) for this booking.
     *
     * @return HasMany
     */
    public function statusChanges(): HasMany
    {
        return $this->hasMany(BookingStatusChange::class)->orderBy('created_at', 'desc');
    }

    /**
     * Get the audit logs for this booking.
     *
     * @return HasMany
     */
    public function auditLogs(): HasMany
    {
        return $this->hasMany(BookingAuditLog::class)->orderBy('created_at', 'desc');
    }

    /**
     * Scope a query to only include confirmed bookings.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeConfirmed($query)
    {
        return $query->where('status', self::STATUS_CONFIRMED);
    }

    /**
     * Scope a query to only include pending bookings.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope a query to only include guest bookings.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeGuestBookings($query)
    {
        return $query->where('is_guest_booking', true);
    }

    /**
     * Scope a query to only include user bookings.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeUserBookings($query)
    {
        return $query->where('is_guest_booking', false);
    }

    /**
     * Scope a query to filter by payment status.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $status
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByPaymentStatus($query, string $status)
    {
        return $query->where('payment_status', $status);
    }

    /**
     * Scope a query to filter bookings by user ID.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  int|null  $userId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeForUser($query, ?int $userId)
    {
        if ($userId) {
            return $query->where('user_id', $userId);
        }
        
        return $query->whereNull('user_id');
    }

    /**
     * Check if the booking is a guest booking.
     *
     * @return bool
     */
    public function isGuestBooking(): bool
    {
        return $this->is_guest_booking;
    }

    /**
     * Check if the booking is confirmed.
     *
     * @return bool
     */
    public function isConfirmed(): bool
    {
        return $this->status === self::STATUS_CONFIRMED;
    }

    /**
     * Check if the booking is cancelled.
     *
     * @return bool
     */
    public function isCancelled(): bool
    {
        return $this->status === self::STATUS_CANCELLED;
    }

    /**
     * Check if the booking is fully paid.
     *
     * @return bool
     */
    public function isFullyPaid(): bool
    {
        return $this->payment_status === self::PAYMENT_STATUS_PAID;
    }

    /**
     * Check if the booking has remaining hours.
     *
     * @return bool
     */
    public function hasRemainingHours(): bool
    {
        return $this->remaining_hours > 0;
    }

    /**
     * Check if the booking has expired.
     *
     * @return bool
     */
    public function hasExpired(): bool
    {
        if ($this->hours_expires_at) {
            return $this->hours_expires_at->isPast();
        }
        
        if ($this->package_expires_at) {
            return $this->package_expires_at->isPast();
        }
        
        return false;
    }

    /**
     * Calculate remaining hours.
     *
     * @return float
     */
    public function calculateRemainingHours(): float
    {
        // Use booked_hours (scheduled sessions) not used_hours (completed sessions)
        // Parents need to know how many hours they can still BOOK
        return max(0, $this->total_hours - $this->booked_hours);
    }

    /**
     * Update remaining hours based on used hours.
     *
     * @return void
     */
    public function updateRemainingHours(): void
    {
        $this->remaining_hours = $this->calculateRemainingHours();
        $this->save();
    }

    /**
     * Attribute accessor for total hours (camelCase for API/collections).
     *
     * @return float
     */
    public function getTotalHoursAttribute(): float
    {
        return (float) ($this->attributes['total_hours'] ?? 0);
    }

    /**
     * Attribute accessor for booked hours (camelCase for API/collections).
     *
     * @return float
     */
    public function getBookedHoursAttribute(): float
    {
        return (float) ($this->attributes['booked_hours'] ?? 0);
    }

    /**
     * Attribute accessor for used hours.
     * Uses getXxxAttribute so $booking->usedHours returns a float; a method named usedHours() would be treated as a relationship by Laravel.
     *
     * @return float
     */
    public function getUsedHoursAttribute(): float
    {
        return (float) ($this->attributes['used_hours'] ?? 0);
    }

    /**
     * Attribute accessor for remaining hours.
     *
     * @return float
     */
    public function getRemainingHoursAttribute(): float
    {
        return (float) ($this->attributes['remaining_hours'] ?? 0);
    }

    /**
     * Attribute accessor for total price.
     *
     * @return float
     */
    public function getTotalPriceAttribute(): float
    {
        return (float) ($this->attributes['total_price'] ?? 0);
    }

    /**
     * Attribute accessor for paid amount.
     *
     * @return float
     */
    public function getPaidAmountAttribute(): float
    {
        return (float) ($this->attributes['paid_amount'] ?? 0);
    }

    /**
     * Attribute accessor for outstanding amount (camelCase for API/collections).
     *
     * @return float
     */
    public function getOutstandingAmountAttribute(): float
    {
        return $this->getOutstandingAmount();
    }

    /**
     * Attribute accessor for package expiry date (camelCase for API/collections).
     *
     * @return \Carbon\Carbon|null
     */
    public function getPackageExpiresAtAttribute(): ?\Carbon\Carbon
    {
        $value = $this->attributes['package_expires_at'] ?? null;
        return $value ? \Carbon\Carbon::parse($value) : null;
    }

    /**
     * Attribute accessor for created at (camelCase for API/collections).
     *
     * @return \Illuminate\Support\Carbon|null
     */
    public function getCreatedAtAttribute(): ?\Illuminate\Support\Carbon
    {
        $value = $this->attributes['created_at'] ?? null;
        return $value ? \Illuminate\Support\Carbon::parse($value) : null;
    }

    /**
     * Get the outstanding payment amount.
     *
     * @return float
     */
    public function getOutstandingAmount(): float
    {
        return max(0, $this->total_price - $this->paid_amount - $this->discount_amount);
    }

    /**
     * Check if the booking can be cancelled.
     *
     * @return bool
     */
    public function canBeCancelled(): bool
    {
        return in_array($this->status, [self::STATUS_DRAFT, self::STATUS_PENDING, self::STATUS_CONFIRMED]);
    }

    /**
     * Cancel the booking.
     *
     * @param  string|null  $reason
     * @return void
     */
    public function cancel(?string $reason = null): void
    {
        if (!$this->canBeCancelled()) {
            throw new \RuntimeException('Booking cannot be cancelled in its current state.');
        }

        $this->status = self::STATUS_CANCELLED;
        $this->cancellation_reason = $reason;
        $this->cancelled_at = now();
        $this->save();
    }

    /**
     * Get the parent's full name.
     *
     * @return string
     */
    public function getParentFullNameAttribute(): string
    {
        return trim("{$this->parent_first_name} {$this->parent_last_name}");
    }

    /**
     * Get the booking mode key from calculated_fields.
     *
     * @return string|null
     */
    public function getModeKeyAttribute(): ?string
    {
        if (!$this->calculated_fields || !is_array($this->calculated_fields)) {
            return null;
        }
        
        return $this->calculated_fields['mode_key'] ?? null;
    }

    /**
     * Get the formatted mode name for display.
     *
     * @return string|null
     */
    public function getModeNameAttribute(): ?string
    {
        $modeKey = $this->mode_key;
        
        if (!$modeKey) {
            return null;
        }

        // Map mode keys to display names
        $modeNames = [
            'single-day-event' => 'Single-day event',
            'multi-day-event' => 'Multi-day event',
            'school-run-after' => 'School run + after-school',
            'hospital-appointment' => 'Hospital appointment',
            'exam-support' => 'Exam support',
            'weekend-respite' => 'Weekend respite',
            'club-escort' => 'Club/Class escort',
            'therapy-companion' => 'Therapy companion',
            'holiday-day-trip' => 'Holiday day trip',
            'custom' => 'Custom plan',
            'sessions' => 'Sessions (by the hour)',
        ];

        return $modeNames[$modeKey] ?? ucfirst(str_replace('-', ' ', $modeKey));
    }
}

