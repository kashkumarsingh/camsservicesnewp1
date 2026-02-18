<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * TrainerEmergencyContact Model
 *
 * Clean Architecture: Domain Layer
 * Purpose: Represents an emergency contact for a trainer.
 */
class TrainerEmergencyContact extends Model
{
    use HasFactory;

    protected $fillable = [
        'trainer_id',
        'name',
        'relationship',
        'phone',
        'email',
    ];

    public function trainer(): BelongsTo
    {
        return $this->belongsTo(Trainer::class);
    }
}

