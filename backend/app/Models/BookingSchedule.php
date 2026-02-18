<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * BookingSchedule Model (Domain Layer)
 * 
 * Clean Architecture: Domain Layer
 * Purpose: Represents a session/schedule within a booking
 * Location: backend/app/Models/BookingSchedule.php
 * 
 * This model contains:
 * - Business logic (scopes, methods)
 * - Domain rules (validation, constraints)
 * - Relationships (Booking, Trainer, Activities)
 * 
 * The Domain Layer is the innermost layer - it has NO dependencies
 * on external frameworks or infrastructure.
 */
class BookingSchedule extends Model
{
    use HasFactory;

    /**
     * Session status constants
     */
    public const STATUS_SCHEDULED = 'scheduled';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_NO_SHOW = 'no_show';
    public const STATUS_RESCHEDULED = 'rescheduled';

    /** Trainer assignment workflow (intelligent auto-assignment) */
    public const TRAINER_ASSIGNMENT_PENDING_CONFIRMATION = 'pending_trainer_confirmation';
    public const TRAINER_ASSIGNMENT_CONFIRMED = 'trainer_confirmed';
    public const TRAINER_ASSIGNMENT_DECLINED = 'trainer_declined';
    public const TRAINER_ASSIGNMENT_ADMIN_ASSIGNED = 'admin_assigned';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'booking_id',
        'date',
        'start_time',
        'end_time',
        'trainer_id',
        'auto_assigned', // Track if trainer was auto-assigned
        'requires_admin_approval', // Track if auto-assigned trainer needs approval
        'trainer_approved_at', // When admin approved the trainer
        'trainer_approved_by_user_id', // Who approved the trainer
        'trainer_assignment_status', // pending_trainer_confirmation | trainer_confirmed | trainer_declined | admin_assigned
        'trainer_confirmation_requested_at',
        'trainer_confirmed_at',
        'trainer_declined_at',
        'trainer_decline_reason',
        'assignment_attempt_count',
        'booked_by', // 'parent' or 'trainer'
        'booked_by_user_id', // ID of user who booked (parent or trainer)
        'duration_hours',
        'actual_duration_hours',
        'activity_count',
        'is_activity_override',
        'activity_override_reason',
        'activity_status',
        'activity_confirmed_at',
        'mode_key',
        'itinerary_notes',
        'location',
        'current_activity_id',
        'status',
        'original_date',
        'original_start_time',
        'actual_start_time',
        'actual_end_time',
        'rescheduled_at',
        'reschedule_reason',
        'cancellation_reason',
        'completed_at',
        'cancelled_at',
        'order',
        'session_today_notification_sent_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date' => 'date',
        'start_time' => 'string', // TIME field stored as string
        'end_time' => 'string', // TIME field stored as string
        'auto_assigned' => 'boolean',
        'requires_admin_approval' => 'boolean',
        'trainer_approved_at' => 'datetime',
        'trainer_confirmation_requested_at' => 'datetime',
        'trainer_confirmed_at' => 'datetime',
        'trainer_declined_at' => 'datetime',
        'assignment_attempt_count' => 'integer',
        'booked_by' => 'string', // 'parent' or 'trainer'
        'booked_by_user_id' => 'integer', // ID of user who booked
        'duration_hours' => 'decimal:2',
        'actual_duration_hours' => 'decimal:2',
        'activity_count' => 'integer',
        'is_activity_override' => 'boolean',
        'activity_status' => 'string',
        'activity_confirmed_at' => 'datetime',
        'original_date' => 'date',
        'original_start_time' => 'string', // TIME field stored as string
        'actual_start_time' => 'string', // TIME field stored as string
        'actual_end_time' => 'string', // TIME field stored as string
        'rescheduled_at' => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'order' => 'integer',
        'itinerary_notes' => 'array',
        'session_today_notification_sent_at' => 'datetime',
    ];

    /**
     * Get the booking that owns this schedule.
     *
     * @return BelongsTo
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    /**
     * Get the trainer assigned to this schedule.
     *
     * @return BelongsTo
     */
    public function trainer(): BelongsTo
    {
        return $this->belongsTo(Trainer::class);
    }

    /**
     * Get the activities for this schedule.
     *
     * @return BelongsToMany
     */
    public function activities(): BelongsToMany
    {
        return $this->belongsToMany(Activity::class, 'booking_schedule_activities')
            ->withPivot('duration_hours', 'order', 'notes')
            ->withTimestamps()
            ->orderByPivot('order');
    }

    /**
     * Get the "current activity" (trainer-set "doing now") for live status display.
     *
     * @return BelongsTo
     */
    public function currentActivity(): BelongsTo
    {
        return $this->belongsTo(Activity::class, 'current_activity_id');
    }

    /**
     * Past "Currently doing [activity] at [location]" updates for the Right now tab.
     *
     * @return HasMany
     */
    public function currentActivityUpdates(): HasMany
    {
        return $this->hasMany(ScheduleCurrentActivityUpdate::class, 'booking_schedule_id')->orderBy('created_at', 'desc');
    }

    /**
     * Get the schedule changes (audit trail) for this schedule.
     *
     * @return HasMany
     */
    public function changes(): HasMany
    {
        return $this->hasMany(BookingScheduleChange::class)->orderBy('created_at', 'desc');
    }

    /**
     * Get the attendance records for this schedule.
     *
     * @return HasMany
     */
    public function attendance(): HasMany
    {
        return $this->hasMany(ScheduleAttendance::class, 'booking_schedule_id');
    }

    /**
     * Get the trainer notes for this schedule.
     *
     * @return HasMany
     */
    public function notes(): HasMany
    {
        return $this->hasMany(TrainerNote::class, 'booking_schedule_id');
    }

    /**
     * Get the completion record for this schedule.
     */
    public function completion(): HasOne
    {
        return $this->hasOne(SessionCompletion::class, 'booking_schedule_id');
    }

    /**
     * Get time entries (clock in/out events) for this schedule.
     */
    public function timeEntries(): HasMany
    {
        return $this->hasMany(TimeEntry::class, 'booking_schedule_id')->orderBy('recorded_at', 'asc');
    }

    /**
     * Scope a query to only include scheduled sessions.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeScheduled($query)
    {
        return $query->where('status', self::STATUS_SCHEDULED);
    }

    /**
     * Scope a query to only include completed sessions.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    /**
     * Scope a query to filter by date range.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $startDate
     * @param  string  $endDate
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByDateRange($query, string $startDate, string $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    /**
     * Scope a query to filter by trainer.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  int  $trainerId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByTrainer($query, int $trainerId)
    {
        return $query->where('trainer_id', $trainerId);
    }

    /**
     * Scope a query to filter by date and time for conflict detection.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $date
     * @param  string  $startTime
     * @param  string  $endTime
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeConflicting($query, string $date, string $startTime, string $endTime)
    {
        return $query->where('date', $date)
            ->where('status', self::STATUS_SCHEDULED)
            ->where(function ($q) use ($startTime, $endTime) {
                $q->whereBetween('start_time', [$startTime, $endTime])
                  ->orWhereBetween('end_time', [$startTime, $endTime])
                  ->orWhere(function ($q2) use ($startTime, $endTime) {
                      $q2->where('start_time', '<=', $startTime)
                         ->where('end_time', '>=', $endTime);
                  });
            });
    }

    /**
     * Check if the session is scheduled.
     *
     * @return bool
     */
    public function isScheduled(): bool
    {
        return $this->status === self::STATUS_SCHEDULED;
    }

    /**
     * Check if the session is completed.
     *
     * @return bool
     */
    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * Check if the session is cancelled.
     *
     * @return bool
     */
    public function isCancelled(): bool
    {
        return $this->status === self::STATUS_CANCELLED;
    }

    /**
     * Check if the session has been rescheduled.
     *
     * @return bool
     */
    public function isRescheduled(): bool
    {
        return $this->status === self::STATUS_RESCHEDULED || !is_null($this->rescheduled_at);
    }

    /**
     * Calculate duration from start and end times.
     *
     * @return float
     */
    public function calculateDuration(): float
    {
        if (!$this->start_time || !$this->end_time || !$this->date) {
            return 0;
        }

        $start = \Carbon\Carbon::parse($this->date->format('Y-m-d') . ' ' . $this->start_time);
        $end = \Carbon\Carbon::parse($this->date->format('Y-m-d') . ' ' . $this->end_time);
        
        return round($end->diffInHours($start, true), 2);
    }

    /**
     * Update duration based on start and end times.
     *
     * @return void
     */
    public function updateDuration(): void
    {
        $this->duration_hours = $this->calculateDuration();
        $this->save();
    }

    /**
     * Mark the session as completed.
     *
     * @param  string|\DateTime|null  $actualStartTime
     * @param  string|\DateTime|null  $actualEndTime
     * @return void
     */
    public function markAsCompleted($actualStartTime = null, $actualEndTime = null): void
    {
        $this->status = self::STATUS_COMPLETED;
        $this->actual_start_time = $actualStartTime instanceof \DateTime ? $actualStartTime->format('H:i:s') : $actualStartTime;
        $this->actual_end_time = $actualEndTime instanceof \DateTime ? $actualEndTime->format('H:i:s') : $actualEndTime;
        $this->completed_at = now();
        
        if ($actualStartTime && $actualEndTime) {
            $start = \Carbon\Carbon::parse($actualStartTime instanceof \DateTime ? $actualStartTime->format('Y-m-d H:i:s') : $actualStartTime);
            $end = \Carbon\Carbon::parse($actualEndTime instanceof \DateTime ? $actualEndTime->format('Y-m-d H:i:s') : $actualEndTime);
            $this->actual_duration_hours = round($end->diffInHours($start, true), 2);
        }
        
        $this->save();
    }

    /**
     * Cancel the session.
     *
     * @param  string|null  $reason
     * @return void
     */
    public function cancel(?string $reason = null): void
    {
        $this->status = self::STATUS_CANCELLED;
        $this->cancellation_reason = $reason;
        $this->cancelled_at = now();
        $this->save();
    }

    /**
     * Reschedule the session.
     *
     * @param  string  $newDate
     * @param  string  $newStartTime
     * @param  string  $newEndTime
     * @param  string|null  $reason
     * @return void
     */
    public function reschedule(string $newDate, string $newStartTime, string $newEndTime, ?string $reason = null): void
    {
        $this->original_date = $this->date;
        $this->original_start_time = $this->start_time;
        
        $this->date = $newDate;
        $this->start_time = $newStartTime;
        $this->end_time = $newEndTime;
        $this->rescheduled_at = now();
        $this->reschedule_reason = $reason;
        $this->status = self::STATUS_RESCHEDULED;
        
        $this->updateDuration();
        $this->save();
    }

    /**
     * Get the session datetime (date + start_time).
     *
     * @return \Carbon\Carbon|null
     */
    public function getSessionDateTimeAttribute(): ?\Carbon\Carbon
    {
        if (!$this->date || !$this->start_time) {
            return null;
        }
        
        return \Carbon\Carbon::parse($this->date->format('Y-m-d') . ' ' . $this->start_time);
    }

    /**
     * Get the computed display status based on current date/time and stored status.
     * 
     * This computed property calculates the actual status to display, considering:
     * - Current date vs session date
     * - Current time vs session time (for "in progress")
     * - Stored status value
     * 
     * Status priority:
     * 1. If cancelled or no_show → show as-is
     * 2. If completed → show as completed
     * 3. If date < today AND status = scheduled → show "Past (Not Completed)"
     * 4. If date < today AND status = rescheduled → show "Rescheduled (Past)"
     * 5. If date = today AND time is current → show "In Progress"
     * 6. If date > today → show "Scheduled"
     * 7. If date = today AND time hasn't started → show "Scheduled"
     * 
     * @return string
     */
    public function getDisplayStatusAttribute(): string
    {
        $now = now();
        $today = $now->toDateString();
        $sessionDate = $this->date ? $this->date->toDateString() : null;
        
        if (!$sessionDate) {
            return $this->status ?? self::STATUS_SCHEDULED;
        }
        
        // Always respect explicit statuses that don't depend on date
        if ($this->status === self::STATUS_CANCELLED) {
            return 'cancelled';
        }
        
        if ($this->status === self::STATUS_NO_SHOW) {
            return 'no_show';
        }
        
        if ($this->status === self::STATUS_COMPLETED) {
            return 'completed';
        }
        
        // For past sessions, show appropriate status
        if ($sessionDate < $today) {
            if ($this->status === self::STATUS_SCHEDULED) {
                return 'past_not_completed';
            }
            
            if ($this->status === self::STATUS_RESCHEDULED) {
                return 'rescheduled_past';
            }
            
            // Fallback: if status is something else but date is past
            return 'past';
        }
        
        // For today's sessions, check if in progress
        if ($sessionDate === $today) {
            $sessionStart = \Carbon\Carbon::parse($sessionDate . ' ' . $this->start_time);
            $sessionEnd = \Carbon\Carbon::parse($sessionDate . ' ' . $this->end_time);
            
            // Check if current time is within session time range
            if ($now->gte($sessionStart) && $now->lte($sessionEnd)) {
                return 'in_progress';
            }
            
            // If session time has passed today
            if ($now->gt($sessionEnd)) {
                if ($this->status === self::STATUS_SCHEDULED) {
                    return 'past_not_completed';
                }
                
                if ($this->status === self::STATUS_RESCHEDULED) {
                    return 'rescheduled_past';
                }
                
                return 'past';
            }
        }
        
        // Future sessions or sessions that haven't started yet today
        if ($this->status === self::STATUS_RESCHEDULED) {
            return 'rescheduled';
        }
        
        return 'scheduled';
    }

    /**
     * Get the display status label (human-readable).
     * 
     * @return string
     */
    public function getDisplayStatusLabelAttribute(): string
    {
        return match ($this->display_status) {
            'completed' => 'Completed',
            'cancelled' => 'Cancelled',
            'no_show' => 'No Show',
            'scheduled' => 'Scheduled',
            'rescheduled' => 'Rescheduled',
            'rescheduled_past' => 'Rescheduled (Past)',
            'in_progress' => 'In Progress',
            'past_not_completed' => 'Past (Not Completed)',
            'past' => 'Past',
            default => ucfirst(str_replace('_', ' ', $this->display_status)),
        };
    }

    /**
     * Calculate activity count based on duration and package's hours_per_activity.
     * Default: 3 hours = 1 activity
     *
     * @return int
     */
    public function calculateActivityCount(): int
    {
        if (!$this->duration_hours || $this->duration_hours <= 0) {
            return 1; // Default to 1 activity if no duration
        }
        
        // Get package's hours_per_activity (default: 3.0)
        $package = $this->booking->package ?? null;
        $hoursPerActivity = $package?->hours_per_activity ?? 3.0;
        
        if ($hoursPerActivity <= 0) {
            return 1; // Default to 1 activity if invalid hours_per_activity
        }
        
        // Calculate: duration_hours ÷ hours_per_activity (rounded up)
        return (int) ceil($this->duration_hours / $hoursPerActivity);
    }

    /**
     * Get calculated activity count (without override).
     *
     * @return int
     */
    public function getCalculatedActivityCount(): int
    {
        return $this->calculateActivityCount();
    }

    /**
     * Override activity count manually.
     *
     * @param int $count
     * @param string|null $reason
     * @return void
     */
    public function overrideActivityCount(int $count, ?string $reason = null): void
    {
        $this->activity_count = $count;
        $this->is_activity_override = true;
        $this->activity_override_reason = $reason;
        $this->save();
    }

    /**
     * Reset activity count to calculated value.
     *
     * @return void
     */
    public function resetActivityCount(): void
    {
        $this->activity_count = $this->calculateActivityCount();
        $this->is_activity_override = false;
        $this->activity_override_reason = null;
        $this->save();
    }

    /**
     * Check if activity is confirmed.
     *
     * @return bool
     */
    public function isActivityConfirmed(): bool
    {
        return $this->activity_status === 'confirmed' && !is_null($this->activity_confirmed_at);
    }

    /**
     * Boot method to auto-calculate activity count on save (if not overridden).
     */
    protected static function boot()
    {
        parent::boot();
        
        static::saving(function ($schedule) {
            // Auto-calculate activity count if not overridden and duration changed
            if (!$schedule->is_activity_override && $schedule->isDirty(['duration_hours', 'booking_id'])) {
                $schedule->activity_count = $schedule->calculateActivityCount();
            }
            
            // Set default activity_count if not set
            if (is_null($schedule->activity_count) || $schedule->activity_count < 1) {
                $schedule->activity_count = $schedule->calculateActivityCount();
            }
            
            // Set default activity_status if not set
            if (is_null($schedule->activity_status)) {
                $schedule->activity_status = 'pending';
            }
        });
    }
}

