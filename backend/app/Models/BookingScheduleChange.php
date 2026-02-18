<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * BookingScheduleChange Model (Domain Layer - Audit Trail)
 * 
 * Clean Architecture: Domain Layer
 * Purpose: Tracks all reschedule/cancellation changes for booking schedules (audit trail)
 * Location: backend/app/Models/BookingScheduleChange.php
 * 
 * This model contains:
 * - Business logic (scopes, methods)
 * - Domain rules (validation, constraints)
 * - Relationships (BookingSchedule, User)
 * 
 * The Domain Layer is the innermost layer - it has NO dependencies
 * on external frameworks or infrastructure.
 */
class BookingScheduleChange extends Model
{
    use HasFactory;

    /**
     * Change type constants
     */
    public const TYPE_RESCHEDULE = 'reschedule';
    public const TYPE_CANCEL = 'cancel';
    public const TYPE_COMPLETE = 'complete';
    public const TYPE_NO_SHOW = 'no_show';
    public const TYPE_STATUS_CHANGE = 'status_change';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'booking_schedule_id',
        'change_type',
        'old_status',
        'new_status',
        'old_date',
        'new_date',
        'old_start_time',
        'new_start_time',
        'old_end_time',
        'new_end_time',
        'reason',
        'changed_by_user_id',
        'ip_address',
        'user_agent',
        'metadata',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'old_date' => 'date',
        'new_date' => 'date',
        'old_start_time' => 'datetime:H:i:s',
        'new_start_time' => 'datetime:H:i:s',
        'old_end_time' => 'datetime:H:i:s',
        'new_end_time' => 'datetime:H:i:s',
        'metadata' => 'array',
    ];

    /**
     * Get the booking schedule that owns this change.
     *
     * @return BelongsTo
     */
    public function bookingSchedule(): BelongsTo
    {
        return $this->belongsTo(BookingSchedule::class);
    }

    /**
     * Get the user who made this change.
     *
     * @return BelongsTo
     */
    public function changedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by_user_id');
    }

    /**
     * Scope a query to filter by change type.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $type
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByChangeType($query, string $type)
    {
        return $query->where('change_type', $type);
    }
}

