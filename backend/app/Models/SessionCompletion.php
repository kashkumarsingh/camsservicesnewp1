<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * SessionCompletion Model (Domain Layer)
 * 
 * Clean Architecture: Domain Layer
 * Purpose: Represents session completion details and parent approval workflow
 * Location: backend/app/Models/SessionCompletion.php
 * 
 * This model stores completion details for sessions, including actual times,
 * summaries, and parent approval workflow for transparency.
 */
class SessionCompletion extends Model
{
    use HasFactory;

    /**
     * Dispute status constants
     */
    public const DISPUTE_STATUS_NONE = 'none';
    public const DISPUTE_STATUS_PENDING = 'pending';
    public const DISPUTE_STATUS_RESOLVED = 'resolved';
    public const DISPUTE_STATUS_REFUND_ISSUED = 'refund_issued';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'booking_schedule_id',
        'actual_start_time',
        'actual_end_time',
        'actual_duration_hours',
        'session_summary',
        'highlights',
        'areas_for_improvement',
        'trainer_approved_at',
        'parent_notified_at',
        'parent_approved_at',
        'dispute_reason',
        'dispute_status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'actual_start_time' => 'string',
        'actual_end_time' => 'string',
        'actual_duration_hours' => 'decimal:2',
        'trainer_approved_at' => 'datetime',
        'parent_notified_at' => 'datetime',
        'parent_approved_at' => 'datetime',
    ];

    /**
     * Get the booking schedule this completion belongs to.
     *
     * @return BelongsTo
     */
    public function schedule(): BelongsTo
    {
        return $this->belongsTo(BookingSchedule::class, 'booking_schedule_id');
    }

    /**
     * Check if parent has approved the session.
     *
     * @return bool
     */
    public function isParentApproved(): bool
    {
        return !is_null($this->parent_approved_at);
    }

    /**
     * Check if there is a dispute.
     *
     * @return bool
     */
    public function hasDispute(): bool
    {
        return $this->dispute_status !== self::DISPUTE_STATUS_NONE;
    }

    /**
     * Scope to get approved sessions.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeApproved($query)
    {
        return $query->whereNotNull('parent_approved_at');
    }

    /**
     * Scope to get sessions with disputes.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeWithDisputes($query)
    {
        return $query->where('dispute_status', '!=', self::DISPUTE_STATUS_NONE);
    }
}
