<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Package Model (Domain Layer)
 * 
 * Clean Architecture: Domain Layer
 * Purpose: Represents a package/program entity in the system
 * Location: backend/app/Models/Package.php
 * 
 * This model contains:
 * - Business logic (scopes, methods)
 * - Domain rules (validation, constraints)
 * - Relationships (will be added when Trainers are created)
 * 
 * The Domain Layer is the innermost layer - it has NO dependencies
 * on external frameworks or infrastructure.
 */
class Package extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'hours',
        'duration_weeks',
        'hours_per_week',
        'hours_per_activity',
        'calculated_activities',
        'allow_activity_override',
        'age_group',
        'difficulty_level',
        'max_participants',
        'spots_remaining',
        'total_spots',
        'features',
        'perks',
        'what_to_expect',
        'requirements',
        'image',
        'color',
        'trust_indicators',
        'is_active',
        'is_popular',
        'views',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'price' => 'decimal:2',
        'hours' => 'integer',
        'duration_weeks' => 'integer',
        'hours_per_week' => 'float',
        'hours_per_activity' => 'decimal:2',
        'calculated_activities' => 'integer',
        'allow_activity_override' => 'boolean',
        'max_participants' => 'integer',
        'spots_remaining' => 'integer',
        'total_spots' => 'integer',
        'views' => 'integer',
        'features' => 'array',
        'perks' => 'array',
        'requirements' => 'array',
        'trust_indicators' => 'array',
        'is_active' => 'boolean',
        'is_popular' => 'boolean',
    ];

    /**
     * Get the difficulty level options.
     *
     * @return array<string, string>
     */
    public static function getDifficultyLevelOptions(): array
    {
        return [
            'beginner' => 'Beginner',
            'intermediate' => 'Intermediate',
            'advanced' => 'Advanced',
        ];
    }

    /**
     * Scope a query to only include active packages.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include popular packages.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopePopular($query)
    {
        return $query->where('is_popular', true);
    }

    /**
     * Scope a query to filter by difficulty level.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $level
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByDifficulty($query, string $level)
    {
        return $query->where('difficulty_level', $level);
    }

    /**
     * Scope a query to filter by age group.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $ageGroup
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByAgeGroup($query, string $ageGroup)
    {
        return $query->where('age_group', $ageGroup);
    }

    /**
     * Check if the package has available spots.
     *
     * @return bool
     */
    public function hasAvailableSpots(): bool
    {
        return $this->spots_remaining > 0;
    }

    /**
     * Check if the package is fully booked.
     *
     * @return bool
     */
    public function isFullyBooked(): bool
    {
        return $this->spots_remaining === 0;
    }

    /**
     * Get the availability percentage.
     *
     * @return float
     */
    public function getAvailabilityPercentage(): float
    {
        if (!$this->total_spots || $this->total_spots === 0) {
            return 0;
        }

        return ($this->spots_remaining / $this->total_spots) * 100;
    }

    /**
     * Check if the package can be booked.
     *
     * @return bool
     */
    public function canBeBooked(): bool
    {
        return $this->is_active && $this->hasAvailableSpots();
    }

    /**
     * Decrement available spots.
     *
     * @param  int  $count
     * @return void
     */
    public function decrementSpots(int $count = 1): void
    {
        $this->decrement('spots_remaining', $count);
    }

    /**
     * Increment available spots.
     *
     * @param  int  $count
     * @return void
     */
    public function incrementSpots(int $count = 1): void
    {
        $this->increment('spots_remaining', $count);
    }

    /**
     * Get the activities included in this package.
     *
     * @return BelongsToMany
     */
    public function activities(): BelongsToMany
    {
        return $this->belongsToMany(Activity::class, 'package_activity')
            ->withPivot('order')
            ->withTimestamps()
            ->orderByPivot('order');
    }

    /**
     * Get the testimonials associated with this package.
     *
     * @return BelongsToMany
     */
    public function testimonials(): BelongsToMany
    {
        return $this->belongsToMany(Testimonial::class, 'package_testimonial')
            ->withPivot('order')
            ->withTimestamps()
            ->orderByPivot('order');
    }

    /**
     * Get normalized features array.
     * Handles both formats:
     * - Simple array: ['Feature 1', 'Feature 2']
     * - Object array: [{'feature': 'Feature 1'}, {'feature': 'Feature 2'}]
     *
     * @return array
     */
    public function getNormalizedFeaturesAttribute(): array
    {
        $features = $this->features ?? [];
        
        if (empty($features) || !is_array($features)) {
            return [];
        }

        $normalized = [];
        foreach ($features as $feature) {
            if (is_string($feature)) {
                $normalized[] = $feature;
            } elseif (is_array($feature) && isset($feature['feature'])) {
                $normalized[] = $feature['feature'];
            } elseif (is_array($feature) && isset($feature[0])) {
                // Handle edge case where it's an array with numeric keys
                $normalized[] = is_string($feature[0]) ? $feature[0] : (string) $feature[0];
            }
        }

        return $normalized;
    }

    /**
     * Get normalized requirements array.
     * Handles both formats:
     * - Simple array: ['Requirement 1', 'Requirement 2']
     * - Object array: [{'requirement': 'Requirement 1'}, {'requirement': 'Requirement 2'}]
     *
     * @return array
     */
    public function getNormalizedRequirementsAttribute(): array
    {
        $requirements = $this->requirements ?? [];
        
        if (empty($requirements) || !is_array($requirements)) {
            return [];
        }

        $normalized = [];
        foreach ($requirements as $requirement) {
            if (is_string($requirement)) {
                $normalized[] = $requirement;
            } elseif (is_array($requirement) && isset($requirement['requirement'])) {
                $normalized[] = $requirement['requirement'];
            } elseif (is_array($requirement) && isset($requirement[0])) {
                // Handle edge case where it's an array with numeric keys
                $normalized[] = is_string($requirement[0]) ? $requirement[0] : (string) $requirement[0];
            }
        }

        return $normalized;
    }

    /**
     * Get the bookings for this package.
     *
     * @return HasMany
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Get the formatted duration string.
     * Example: "3 hours per week for 6 weeks"
     *
     * @return string
     */
    public function getDurationString(): string
    {
        $durationWeeks = $this->duration_weeks ?? 0;
        $hoursPerWeek = $this->hours_per_week ?? ($durationWeeks > 0 && $this->hours > 0 ? round($this->hours / $durationWeeks, 1) : 0);
        $hoursPerWeekFormatted = $hoursPerWeek == (int) $hoursPerWeek ? (int) $hoursPerWeek : $hoursPerWeek;
        
        return sprintf(
            '%s hour%s per week for %d week%s',
            $hoursPerWeekFormatted,
            $hoursPerWeekFormatted == 1 ? '' : 's',
            $durationWeeks,
            $durationWeeks == 1 ? '' : 's'
        );
    }

    /**
     * Calculate hours per week from hours and duration_weeks.
     *
     * @return float|null
     */
    public function calculateHoursPerWeek(): ?float
    {
        if ($this->duration_weeks > 0 && $this->hours > 0) {
            return round($this->hours / $this->duration_weeks, 1);
        }

        return null;
    }

    /**
     * Increment view counter.
     *
     * @return void
     */
    public function incrementViews(): void
    {
        $this->increment('views');
    }

    /**
     * Calculate total activities based on hours and hours_per_activity.
     * Default: 3 hours = 1 activity
     *
     * @return int
     */
    public function calculateActivities(): int
    {
        if (!$this->hours || !$this->hours_per_activity || $this->hours_per_activity <= 0) {
            return 0;
        }
        
        return (int) ceil($this->hours / $this->hours_per_activity);
    }

    /**
     * Get hours per activity (default: 3.0).
     *
     * @return float
     */
    public function getHoursPerActivity(): float
    {
        return $this->hours_per_activity ?? 3.0;
    }

    /**
     * Boot method to auto-calculate activities on save.
     */
    protected static function boot()
    {
        parent::boot();
        
        static::saving(function ($package) {
            // Auto-calculate activities if hours or hours_per_activity changed
            if ($package->isDirty(['hours', 'hours_per_activity']) || is_null($package->calculated_activities)) {
                $package->calculated_activities = $package->calculateActivities();
            }
            
            // Set default hours_per_activity if not set
            if (is_null($package->hours_per_activity)) {
                $package->hours_per_activity = 3.0;
            }
        });
    }
}
