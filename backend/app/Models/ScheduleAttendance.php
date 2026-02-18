<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * ScheduleAttendance Model (Domain Layer)
 * 
 * Clean Architecture: Domain Layer
 * Purpose: Represents attendance tracking for a participant in a schedule
 * Location: backend/app/Models/ScheduleAttendance.php
 */
class ScheduleAttendance extends Model
{
    use HasFactory;

    protected $table = 'schedule_attendance';

    protected $fillable = [
        'booking_schedule_id',
        'booking_participant_id',
        'attended',
        'arrival_time',
        'departure_time',
        'notes',
        'marked_by',
        'marked_at',
    ];

    protected $casts = [
        'attended' => 'boolean',
        'arrival_time' => 'datetime:H:i',
        'departure_time' => 'datetime:H:i',
        'marked_at' => 'datetime',
    ];

    /**
     * Get the booking schedule
     */
    public function schedule(): BelongsTo
    {
        return $this->belongsTo(BookingSchedule::class, 'booking_schedule_id');
    }

    /**
     * Get the participant
     */
    public function participant(): BelongsTo
    {
        return $this->belongsTo(BookingParticipant::class, 'booking_participant_id');
    }

    /**
     * Get the trainer who marked attendance
     */
    public function markedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'marked_by');
    }
}

