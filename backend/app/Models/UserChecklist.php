<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * UserChecklist Model (Domain Layer)
 * 
 * Clean Architecture: Domain Layer
 * Purpose: Represents compliance checklist for a parent/guardian
 * Location: backend/app/Models/UserChecklist.php
 * 
 * This model contains:
 * - Identity verification
 * - References
 * - Background checks
 * - Consent flags
 * - Admin review tracking
 */
class UserChecklist extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'identity_verified',
        'identity_verified_at',
        'identity_verified_by',
        'identity_document_type',
        'identity_document_reference',
        'reference_1_name',
        'reference_1_contact',
        'reference_1_verified',
        'reference_2_name',
        'reference_2_contact',
        'reference_2_verified',
        'background_check_completed',
        'background_check_completed_at',
        'consent_data_processing',
        'consent_marketing',
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
            'identity_verified' => 'boolean',
            'identity_verified_at' => 'datetime',
            'reference_1_verified' => 'boolean',
            'reference_2_verified' => 'boolean',
            'background_check_completed' => 'boolean',
            'background_check_completed_at' => 'datetime',
            'consent_data_processing' => 'boolean',
            'consent_marketing' => 'boolean',
            'checklist_completed' => 'boolean',
            'checklist_completed_at' => 'datetime',
        ];
    }

    /**
     * Get the user this checklist belongs to.
     *
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the admin who verified identity.
     *
     * @return BelongsTo
     */
    public function identityVerifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'identity_verified_by');
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
}

