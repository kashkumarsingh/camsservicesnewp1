<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Activity Model (Domain Layer)
 * 
 * Clean Architecture: Domain Layer
 * Purpose: Represents an activity entity in the system
 * Location: backend/app/Models/Activity.php
 * 
 * This model contains:
 * - Business logic (scopes, methods)
 * - Domain rules (validation, constraints)
 * - Relationships (Packages, Trainers)
 * 
 * The Domain Layer is the innermost layer - it has NO dependencies
 * on external frameworks or infrastructure.
 */
class Activity extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'category',
        'slug',
        'description',
        'duration',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'duration' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Scope a query to only include active activities.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get the packages that include this activity.
     *
     * @return BelongsToMany
     */
    public function packages(): BelongsToMany
    {
        return $this->belongsToMany(Package::class, 'package_activity')
            ->withPivot('order')
            ->withTimestamps()
            ->orderByPivot('order');
    }

    /**
     * Get the trainers qualified for this activity.
     *
     * @return BelongsToMany
     */
    public function trainers(): BelongsToMany
    {
        return $this->belongsToMany(Trainer::class, 'activity_trainer')
            ->withPivot('is_primary')
            ->withTimestamps()
            ->orderByPivot('is_primary', 'desc');
    }
}

