<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Incident report submitted by staff or trainers.
 */
class Incident extends Model
{
    public const STATUS_OPEN = 'open';
    public const STATUS_REVIEWING = 'reviewing';
    public const STATUS_CLOSED = 'closed';

    public const TYPE_SAFEGUARDING = 'safeguarding';
    public const TYPE_ACCIDENT = 'accident';
    public const TYPE_NEAR_MISS = 'near_miss';
    public const TYPE_TRANSPORT = 'transport';
    public const TYPE_MISSING_CHILD = 'missing_child';
    public const TYPE_DATA_BREACH = 'data_breach';
    public const TYPE_OTHER = 'other';

    public const SEVERITY_LOW = 'low';
    public const SEVERITY_MEDIUM = 'medium';
    public const SEVERITY_HIGH = 'high';
    public const SEVERITY_CRITICAL = 'critical';

    protected $fillable = [
        'reference',
        'incident_type',
        'severity',
        'description',
        'location',
        'occurred_at',
        'child_id',
        'booking_schedule_id',
        'reported_by_user_id',
        'status',
        'immediate_actions',
        'follow_up_notes',
        'dsl_reviewed_at',
        'reviewed_by_user_id',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'occurred_at' => 'datetime',
        'dsl_reviewed_at' => 'datetime',
    ];

    public function child(): BelongsTo
    {
        return $this->belongsTo(Child::class);
    }

    public function bookingSchedule(): BelongsTo
    {
        return $this->belongsTo(BookingSchedule::class);
    }

    public function reportedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by_user_id');
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by_user_id');
    }
}
