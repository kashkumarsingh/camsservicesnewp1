<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ContactSubmission extends Model
{
    use HasFactory;
    use SoftDeletes;

    public const STATUS_PENDING = 'pending';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_RESOLVED = 'resolved';
    public const STATUS_ARCHIVED = 'archived';

    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'postal_code',
        'child_age',
        'inquiry_type',
        'inquiry_details',
        'urgency',
        'preferred_contact',
        'message',
        'newsletter',
        'source_page',
        'status',
        'assigned_to_id',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'newsletter' => 'bool',
        'subscribed_at' => 'datetime',
        'unsubscribed_at' => 'datetime',
    ];

    /**
     * Assigned support user.
     */
    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to_id');
    }

    /**
     * Scope urgent submissions for dashboards.
     */
    public function scopeUrgent($query)
    {
        return $query->where('urgency', 'urgent');
    }

    /**
     * Scope unresolved submissions.
     */
    public function scopeOpen($query)
    {
        return $query->whereIn('status', [
            self::STATUS_PENDING,
            self::STATUS_IN_PROGRESS,
        ]);
    }
}

