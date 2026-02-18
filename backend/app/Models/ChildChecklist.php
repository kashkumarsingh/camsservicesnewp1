<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * ChildChecklist Model (Domain Layer)
 * 
 * Clean Architecture: Domain Layer
 * Purpose: Represents UK compliance checklist for a child
 * Location: backend/app/Models/ChildChecklist.php
 * 
 * This model contains:
 * - Medical information (conditions, allergies, medications)
 * - Emergency contacts
 * - Special needs and behavioral notes
 * - Consent flags
 * - Admin review tracking
 */
class ChildChecklist extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'child_id',
        'medical_conditions',
        'allergies',
        'medications',
        'dietary_requirements',
        'emergency_contact_name',
        'emergency_contact_relationship',
        'emergency_contact_phone',
        'emergency_contact_phone_alt',
        'emergency_contact_address',
        'special_needs',
        'behavioral_notes',
        'activity_restrictions',
        'consent_photography',
        'consent_medical_treatment',
        'checklist_completed',
        'checklist_completed_at',
        'checklist_completed_by',
        'admin_notes',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'consent_photography' => 'boolean',
            'consent_medical_treatment' => 'boolean',
            'checklist_completed' => 'boolean',
            'checklist_completed_at' => 'datetime',
        ];
    }

    /**
     * Get the child this checklist belongs to.
     *
     * @return BelongsTo
     */
    public function child(): BelongsTo
    {
        return $this->belongsTo(Child::class);
    }

    /**
     * Get the admin who completed the checklist review.
     *
     * @return BelongsTo
     */
    public function completedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'checklist_completed_by');
    }

    /**
     * Check if the checklist is completed.
     *
     * @return bool
     */
    public function isCompleted(): bool
    {
        return $this->checklist_completed === true;
    }

    /**
     * Check if all required fields are filled.
     *
     * @return bool
     */
    public function isComplete(): bool
    {
        return !empty($this->emergency_contact_name) 
            && !empty($this->emergency_contact_phone);
    }
}

