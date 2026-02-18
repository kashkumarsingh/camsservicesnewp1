<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

/**
 * ActivityLog Model (Domain Layer)
 * 
 * Clean Architecture: Domain Layer
 * Purpose: Represents an activity log entry created by a trainer
 * Location: backend/app/Models/ActivityLog.php
 */
class ActivityLog extends Model
{
    use HasFactory;

    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_NEEDS_ATTENTION = 'needs_attention';

    protected $fillable = [
        'trainer_id',
        'child_id',
        'booking_id',
        'booking_schedule_id',
        'activity_name',
        'description',
        'notes',
        'behavioral_observations',
        'achievements',
        'challenges',
        'status',
        'activity_date',
        'start_time',
        'end_time',
        'duration_minutes',
        'actual_hours_used',
        'activity_status',
        'activity_completed_at',
        'requires_parent_approval',
        'parent_approved_at',
        'photos',
        'videos',
        'consent_photography',
        'milestone_achieved',
        'milestone_name',
        'milestone_description',
        'is_editable',
        'editable_until',
    ];

    protected $casts = [
        'activity_date' => 'date',
        'start_time' => 'string',
        'end_time' => 'string',
        'duration_minutes' => 'decimal:2',
        'actual_hours_used' => 'decimal:2',
        'activity_completed_at' => 'datetime',
        'requires_parent_approval' => 'boolean',
        'parent_approved_at' => 'datetime',
        'photos' => 'array',
        'videos' => 'array',
        'consent_photography' => 'boolean',
        'milestone_achieved' => 'boolean',
        'is_editable' => 'boolean',
        'editable_until' => 'datetime',
    ];

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($activityLog) {
            // Set editable_until to 24 hours from now
            $activityLog->editable_until = Carbon::now()->addHours(24);
            $activityLog->is_editable = true;
        });
    }

    /**
     * Get the trainer
     */
    public function trainer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'trainer_id');
    }

    /**
     * Get the child
     */
    public function child(): BelongsTo
    {
        return $this->belongsTo(Child::class, 'child_id');
    }

    /**
     * Get the booking (if linked)
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }

    /**
     * Get the schedule (if linked)
     */
    public function schedule(): BelongsTo
    {
        return $this->belongsTo(BookingSchedule::class, 'booking_schedule_id');
    }

    /**
     * Check if the log can still be edited
     */
    public function canBeEdited(): bool
    {
        if (!$this->is_editable) {
            return false;
        }

        if ($this->editable_until && Carbon::now()->gt($this->editable_until)) {
            $this->is_editable = false;
            $this->save();
            return false;
        }

        return true;
    }

    /**
     * Scope to get logs for a specific child
     */
    public function scopeForChild($query, int $childId)
    {
        return $query->where('child_id', $childId);
    }

    /**
     * Scope to get logs for a specific trainer
     */
    public function scopeForTrainer($query, int $trainerId)
    {
        return $query->where('trainer_id', $trainerId);
    }

    /**
     * Scope to get logs with milestones
     */
    public function scopeWithMilestones($query)
    {
        return $query->where('milestone_achieved', true);
    }

    /**
     * Scope to get editable logs
     */
    public function scopeEditable($query)
    {
        return $query->where('is_editable', true)
            ->where('editable_until', '>', Carbon::now());
    }
}

