<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * BookingParticipant Model (Domain Layer)
 * 
 * Clean Architecture: Domain Layer
 * Purpose: Represents a child/participant in a booking
 * Location: backend/app/Models/BookingParticipant.php
 * 
 * This model contains:
 * - Business logic (scopes, methods)
 * - Domain rules (validation, constraints)
 * - Relationships (Booking)
 * 
 * The Domain Layer is the innermost layer - it has NO dependencies
 * on external frameworks or infrastructure.
 */
class BookingParticipant extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'booking_id',
        'child_id',
        'first_name',
        'last_name',
        'date_of_birth',
        'medical_info',
        'special_needs',
        'order',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date_of_birth' => 'date',
        'order' => 'integer',
    ];

    /**
     * Get the booking that owns this participant.
     *
     * @return BelongsTo
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    /**
     * Get the child this participant is linked to (if approved child).
     *
     * @return BelongsTo
     */
    public function child(): BelongsTo
    {
        return $this->belongsTo(Child::class);
    }

    /**
     * Get the participant's full name.
     *
     * @return string
     */
    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    /**
     * Calculate the participant's age.
     *
     * @return int|null
     */
    public function getAge(): ?int
    {
        if (!$this->date_of_birth) {
            return null;
        }

        return $this->date_of_birth->age;
    }

    /**
     * Check if the participant has medical information.
     *
     * @return bool
     */
    public function hasMedicalInfo(): bool
    {
        return !empty($this->medical_info);
    }

    /**
     * Check if the participant has special needs.
     *
     * @return bool
     */
    public function hasSpecialNeeds(): bool
    {
        return !empty($this->special_needs);
    }
}

