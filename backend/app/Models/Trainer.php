<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Trainer Model (Domain Layer)
 * 
 * Clean Architecture: Domain Layer
 * Purpose: Represents a trainer/coach entity in the system
 * Location: backend/app/Models/Trainer.php
 * 
 * This model contains:
 * - Business logic (scopes, methods)
 * - Domain rules (validation, constraints)
 * - Relationships (User, Packages)
 * 
 * The Domain Layer is the innermost layer - it has NO dependencies
 * on external frameworks or infrastructure.
 */
class Trainer extends Model
{
    use HasFactory;

    /**
     * Activity exclusion categories (mirror from TrainerApplication)
     */
    public const EXCLUSION_CATEGORIES = [
        'water_based' => 'Water-Based Activities',
        'high_intensity' => 'High-Intensity Sports',
        'heights' => 'Heights & Climbing',
        'contact_sports' => 'Contact Sports',
        'outdoor_extreme' => 'Outdoor & Extreme Sports',
        'indoor_technical' => 'Indoor & Technical Activities',
        'special_needs' => 'Special Needs & Adaptive Sports',
        'other' => 'Other Activities',
    ];

    /**
     * Example activities for each category (mirror from TrainerApplication).
     * Activity model has category; optional follow-up: replace with Activity::select('name','category')->get()->groupBy('category') for dynamic display.
     */
    public const CATEGORY_ACTIVITIES = [
        'water_based' => [
            'Swimming',
            'Diving',
            'Water Polo',
            'Kayaking',
            'Canoeing',
            'Paddle Boarding',
            'Surfing',
            'Sailing',
        ],
        'high_intensity' => [
            'Sprinting',
            'CrossFit',
            'HIIT Training',
            'Circuit Training',
            'Boxing',
            'Kickboxing',
            'Marathon Running',
            'Competitive Athletics',
        ],
        'heights' => [
            'Rock Climbing',
            'Bouldering',
            'High Ropes Course',
            'Zip-lining',
            'Abseiling',
            'Tree Climbing',
            'Indoor Climbing Wall',
        ],
        'contact_sports' => [
            'Rugby',
            'American Football',
            'Wrestling',
            'Judo',
            'Karate',
            'Taekwondo',
            'Mixed Martial Arts',
            'Hockey',
        ],
        'outdoor_extreme' => [
            'Mountain Biking',
            'BMX',
            'Skateboarding',
            'Parkour',
            'Trail Running',
            'Orienteering',
            'Survival Skills',
            'Camping Adventures',
        ],
        'indoor_technical' => [
            'Gymnastics',
            'Trampolining',
            'Dance',
            'Cheerleading',
            'Acrobatics',
            'Martial Arts (Technical)',
            'Rhythmic Gymnastics',
        ],
        'special_needs' => [
            'Adaptive PE',
            'Wheelchair Sports',
            'Sensory Activities',
            'Inclusive Dance',
            'Specialized Motor Skills',
            'Therapeutic Exercise',
        ],
        'other' => [
            'Other Specialized Activities',
            'Niche Sports',
            'Cultural Activities',
            'Traditional Games',
        ],
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'role',
        'bio',
        'full_description',
        'image',
        'rating',
        'total_reviews',
        'specialties',
        'excluded_activity_ids', // Activity IDs trainer CANNOT facilitate
        'exclusion_reason',      // Reason for activity limitations
        'certifications',
        'experience_years',
        'availability_notes',
        'home_postcode',
        'travel_radius_km',
        'service_area_postcodes',
        'preferred_age_groups',
        'availability_preferences',
        'auto_accept_sessions',
        'is_active',
        'is_featured',
        'views',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'rating' => 'decimal:2',
        'total_reviews' => 'integer',
        'specialties' => 'array',
        'excluded_activity_ids' => 'array', // Activity IDs trainer cannot facilitate
        'certifications' => 'array',
        'experience_years' => 'integer',
        'travel_radius_km' => 'integer',
        'service_area_postcodes' => 'array',
        'preferred_age_groups' => 'array',
        'availability_preferences' => 'array',
        'auto_accept_sessions' => 'boolean',
        'views' => 'integer',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
    ];

    /**
     * Get the user that owns the trainer profile.
     *
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }


    /**
     * Get the booking schedules assigned to this trainer.
     *
     * @return HasMany
     */
    public function bookingSchedules(): HasMany
    {
        return $this->hasMany(BookingSchedule::class);
    }

    /**
     * Get the trainer applications for this trainer.
     *
     * @return HasMany
     */
    public function trainerApplications(): HasMany
    {
        return $this->hasMany(TrainerApplication::class);
    }

    /**
     * Get the availability records for this trainer.
     *
     * @return HasMany
     */
    public function availability(): HasMany
    {
        return $this->hasMany(TrainerAvailability::class);
    }

    /**
     * Get the emergency contacts for this trainer.
     */
    public function emergencyContacts(): HasMany
    {
        return $this->hasMany(TrainerEmergencyContact::class);
    }

    /**
     * Get pay rates for this trainer (hourly or per-session).
     */
    public function payRates(): HasMany
    {
        return $this->hasMany(TrainerPayRate::class);
    }

    /**
     * Get session payment records (pay after each completed session).
     */
    public function sessionPayments(): HasMany
    {
        return $this->hasMany(TrainerSessionPayment::class);
    }

    /**
     * Get the activities this trainer is qualified for.
     *
     * @return BelongsToMany
     */
    public function activities(): BelongsToMany
    {
        return $this->belongsToMany(Activity::class, 'activity_trainer')
            ->withPivot('is_primary')
            ->withTimestamps()
            ->orderByPivot('is_primary', 'desc');
    }

    /**
     * Scope a query to only include active trainers.
     * 
     * A trainer is considered "active" if:
     * 1. Trainer profile is_active = true
     * 2. Trainer's user account approval_status = 'approved'
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->whereHas('user', function ($q) {
                $q->where('approval_status', 'approved');
            });
    }

    /**
     * Scope a query to only include featured trainers.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope a query to filter by minimum rating.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  float  $minRating
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeMinRating($query, float $minRating)
    {
        return $query->where('rating', '>=', $minRating);
    }

    /**
     * Scope a query to filter by minimum experience years.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  int  $minYears
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeMinExperience($query, int $minYears)
    {
        return $query->where('experience_years', '>=', $minYears);
    }

    /**
     * Check if the trainer has a rating.
     *
     * @return bool
     */
    public function hasRating(): bool
    {
        return $this->total_reviews > 0 && $this->rating > 0;
    }

    /**
     * Check if the trainer is highly rated (4.0 or above).
     *
     * @return bool
     */
    public function isHighlyRated(): bool
    {
        return $this->hasRating() && $this->rating >= 4.0;
    }

    /**
     * Check if the trainer is experienced (5+ years).
     *
     * @return bool
     */
    public function isExperienced(): bool
    {
        return $this->experience_years >= 5;
    }

    /**
     * Get the formatted rating display.
     *
     * @return string
     */
    public function getFormattedRating(): string
    {
        if (!$this->hasRating()) {
            return 'No ratings yet';
        }

        return number_format($this->rating, 1) . ' / 5.0';
    }

    /**
     * Check if the trainer can be assigned to packages.
     *
     * @return bool
     */
    public function canBeAssigned(): bool
    {
        return $this->is_active;
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
     * NEW METHODS: Activity Exclusion Helpers
     */

    /**
     * Check if trainer can perform activities in a given category
     * 
     * @param string $category Category key (e.g., 'water_based')
     * @return bool True if trainer CAN perform, false if excluded
     */
    /**
     * Check if trainer can perform a specific activity
     * 
     * @param string|int $activityId Activity ID to check
     * @return bool True if trainer can perform this activity
     */
    public function canPerformActivity($activityId): bool
    {
        // If no exclusions = can do everything
        if (empty($this->excluded_activity_ids)) {
            return true;
        }

        // Check if activity ID is in exclusion list
        return !in_array((string)$activityId, $this->excluded_activity_ids);
    }

    /**
     * Check if trainer can do all activities (no exclusions)
     * 
     * @return bool True if no exclusions
     */
    public function canDoAllActivities(): bool
    {
        return empty($this->excluded_activity_ids);
    }

    /**
     * Get count of excluded activities
     *
     * @return int Number of activities excluded
     */
    public function getExcludedActivitiesCount(): int
    {
        return count($this->excluded_activity_ids ?? []);
    }

    /**
     * Get list of excluded activity names
     * 
     * @return array Array of activity names
     */
    public function getExcludedActivityNames(): array
    {
        if (empty($this->excluded_activity_ids)) {
            return [];
        }

        return Activity::whereIn('id', $this->excluded_activity_ids)
            ->orderBy('name')
            ->pluck('name')
            ->toArray();
    }

    /**
     * Get excluded activities grouped by category for admin display
     * Returns array with category name and excluded activities in that category
     * 
     * @return array Array of ['category' => string, 'activities' => array]
     */
    public function getExcludedActivitiesGroupedByCategory(): array
    {
        if (empty($this->excluded_activity_ids)) {
            return [];
        }

        // Get excluded activities from database
        $excludedActivities = Activity::whereIn('id', $this->excluded_activity_ids)
            ->orderBy('category')
            ->orderBy('name')
            ->get();

        // Group by category
        $grouped = $excludedActivities->groupBy('category');

        $result = [];
        foreach ($grouped as $categoryKey => $activities) {
            $result[] = [
                'category' => self::EXCLUSION_CATEGORIES[$categoryKey] ?? $categoryKey,
                'activities' => $activities->pluck('name')->toArray(),
            ];
        }

        return $result;
    }
}
