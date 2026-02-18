<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * BookingScheduleActivity Model (Domain Layer - Pivot)
 * 
 * Clean Architecture: Domain Layer
 * Purpose: Represents the pivot relationship between BookingSchedule and Activity
 * Location: backend/app/Models/BookingScheduleActivity.php
 * 
 * This model contains:
 * - Business logic (scopes, methods)
 * - Domain rules (validation, constraints)
 * - Relationships (BookingSchedule, Activity)
 * 
 * The Domain Layer is the innermost layer - it has NO dependencies
 * on external frameworks or infrastructure.
 */
class BookingScheduleActivity extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'booking_schedule_activities';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'booking_schedule_id',
        'activity_id',
        'duration_hours',
        'order',
        'notes',
        'assignment_status',
        'assigned_by',
        'assigned_at',
        'confirmed_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'duration_hours' => 'decimal:2',
        'order' => 'integer',
        'assigned_at' => 'datetime',
        'confirmed_at' => 'datetime',
    ];

    /**
     * Get the booking schedule that owns this activity link.
     *
     * @return BelongsTo
     */
    public function bookingSchedule(): BelongsTo
    {
        return $this->belongsTo(BookingSchedule::class);
    }

    /**
     * Get the activity for this link.
     *
     * @return BelongsTo
     */
    public function activity(): BelongsTo
    {
        return $this->belongsTo(Activity::class);
    }

    /**
     * Get the trainer who assigned this activity.
     *
     * @return BelongsTo
     */
    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    /**
     * Check if activity is confirmed.
     *
     * @return bool
     */
    public function isConfirmed(): bool
    {
        return $this->assignment_status === 'confirmed' && !is_null($this->confirmed_at);
    }

    /**
     * Mark activity as assigned.
     *
     * @param int $trainerUserId
     * @return void
     */
    public function markAsAssigned(int $trainerUserId): void
    {
        $this->assignment_status = 'assigned';
        $this->assigned_by = $trainerUserId;
        $this->assigned_at = now();
        $this->save();
    }

    /**
     * Mark activity as confirmed.
     *
     * @return void
     */
    public function markAsConfirmed(): void
    {
        $this->assignment_status = 'confirmed';
        $this->confirmed_at = now();
        $this->save();
    }
}

