<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Safeguarding Concern Model (Domain Layer)
 *
 * Clean Architecture: Domain Layer
 * Purpose: Represents a parent-reported safeguarding concern.
 * Location: backend/app/Models/SafeguardingConcern.php
 */
class SafeguardingConcern extends Model
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_RESOLVED = 'resolved';
    public const STATUS_ARCHIVED = 'archived';

    public const CONCERN_TYPE_SAFETY = 'safety';
    public const CONCERN_TYPE_BEHAVIOUR = 'behaviour';
    public const CONCERN_TYPE_ENVIRONMENT = 'environment';
    public const CONCERN_TYPE_OTHER = 'other';

    protected $fillable = [
        'user_id',
        'concern_type',
        'description',
        'child_id',
        'date_of_concern',
        'contact_preference',
        'status',
        'ip_address',
        'user_agent',
        'trainer_acknowledged_at',
        'trainer_note',
        'acknowledged_by_user_id',
    ];

    protected $casts = [
        'date_of_concern' => 'date',
        'trainer_acknowledged_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function child(): BelongsTo
    {
        return $this->belongsTo(Child::class);
    }

    public function acknowledgedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'acknowledged_by_user_id');
    }
}
