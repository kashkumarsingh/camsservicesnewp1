<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TrainerApplication extends Model
{
    use HasFactory;

    public const STATUS_SUBMITTED = 'submitted';
    public const STATUS_UNDER_REVIEW = 'under_review';
    public const STATUS_INFORMATION_REQUESTED = 'information_requested';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';

    /**
     * Activity exclusion categories
     * These match the frontend form categories
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
     * Example activities for each category. Activity model has category; optional: replace with dynamic query for display.
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

    protected $fillable = [
        'trainer_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'postcode',
        'address_line_one',
        'address_line_two',
        'city',
        'county',
        'travel_radius_km',
        'service_area_postcodes',
        'availability_preferences',
        'excluded_activity_ids', // Activity IDs trainer CANNOT facilitate
        'exclusion_reason',      // Reason for activity limitations
        'preferred_age_groups',
        'experience_years',
        'bio',
        'certifications',
        'has_dbs_check',
        'dbs_issued_at',
        'dbs_expires_at',
        'insurance_provider',
        'insurance_expires_at',
        'desired_hourly_rate',
        'attachments',
        'status',
        'reviewed_by',
        'reviewed_at',
        'review_notes',
        'admin_request_message',
        'admin_requested_at',
        'trainer_response_message',
        'trainer_response_at',
    ];

    protected $casts = [
        'service_area_postcodes' => 'array',
        'availability_preferences' => 'array',
        'excluded_activity_ids' => 'array', // Activity IDs trainer cannot facilitate
        'preferred_age_groups' => 'array',
        'certifications' => 'array',
        'has_dbs_check' => 'boolean',
        'dbs_issued_at' => 'date',
        'dbs_expires_at' => 'date',
        'insurance_expires_at' => 'date',
        'desired_hourly_rate' => 'decimal:2',
        'attachments' => 'array',
        'reviewed_at' => 'datetime',
        'admin_requested_at' => 'datetime',
        'trainer_response_at' => 'datetime',
    ];

    protected $appends = [
        'full_name',
    ];

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function trainer(): BelongsTo
    {
        return $this->belongsTo(Trainer::class);
    }

    /**
     * Get the activities that this trainer cannot facilitate
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function excludedActivities()
    {
        // This is a pseudo-relationship since we store IDs in JSON
        // Use whereIn to get the actual Activity models
        if (empty($this->excluded_activity_ids)) {
            return Activity::whereIn('id', []); // Empty query
        }
        return Activity::whereIn('id', $this->excluded_activity_ids);
    }

    public function fullName(): string
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }

    public function getFullNameAttribute(): string
    {
        return $this->fullName();
    }

    public function scopePending($query)
    {
        return $query->whereIn('status', [
            self::STATUS_SUBMITTED,
            self::STATUS_UNDER_REVIEW,
        ]);
    }

    /**
     * Check if trainer can perform activities in a given category
     * 
     * @param string $category Category key (e.g., 'water_based')
     * @return bool True if trainer CAN perform, false if excluded
     */
    public function canPerformActivity(string $category): bool
    {
        // If no exclusions = can do everything
        if (empty($this->activity_exclusions)) {
            return true;
        }

        // Check if category is in exclusion list
        return !in_array($category, $this->activity_exclusions);
    }

    /**
     * Get count of excluded activity categories
     * 
     * @return int Number of categories excluded
     */
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
     * Check if trainer can do all activities (no exclusions)
     *
     * @return bool True if no exclusions
     */
    public function canDoAllActivities(): bool
    {
        return empty($this->excluded_activity_ids);
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

    public function approve(User $reviewer, ?string $notes = null, bool $createUserAccount = true): Trainer
    {
        return DB::transaction(function () use ($reviewer, $notes, $createUserAccount) {
            $trainer = $this->trainer;
            $user = null;
            $temporaryPassword = null;

            // Create or get user account if requested
            if ($createUserAccount && !$trainer?->user_id) {
                // Check if user already exists with this email
                $existingUser = \App\Models\User::where('email', $this->email)->first();
                
                if ($existingUser) {
                    // User exists - link to it
                    $user = $existingUser;
                    // Update user role if needed
                    if ($existingUser->role !== 'trainer') {
                        $existingUser->update([
                            'role' => 'trainer',
                            'approval_status' => 'approved',
                            'approved_at' => now(),
                        ]);
                    }
                } else {
                    // Create new user account
                    $temporaryPassword = Str::random(12); // Generate password for email
                    $userData = [
                        'name' => $this->fullName(),
                        'email' => $this->email,
                        'password' => Hash::make($temporaryPassword),
                        'role' => 'trainer',
                        'approval_status' => 'approved',
                        'approved_at' => now(),
                        'email_verified_at' => now(), // Auto-verify since they applied
                    ];
                    
                    // Add optional fields if they exist
                    if ($this->phone) {
                        $userData['phone'] = $this->phone;
                    }
                    if ($this->postcode) {
                        $userData['postcode'] = $this->postcode;
                    }
                    if ($this->address_line_one) {
                        $userData['address'] = $this->address_line_one;
                    }
                    
                    $user = \App\Models\User::create($userData);
                }
            }

            if (!$trainer) {
                $trainer = Trainer::create([
                    'user_id' => $user?->id, // Link to user if created
                    'name' => $this->fullName(),
                    'slug' => Str::slug($this->fullName()) . '-' . Str::lower(Str::random(4)),
                    'role' => 'Activity Coach',
                    'bio' => $this->bio ?? 'Trainer at CAMS Services',
                    'full_description' => $this->bio,
                    'image' => null,
                    'rating' => 0,
                    'total_reviews' => 0,
                    'excluded_activity_ids' => $this->excluded_activity_ids ?? [], // Activity IDs trainer cannot facilitate
                    'exclusion_reason' => $this->exclusion_reason, // Reason for limitations
                    'certifications' => $this->certifications ?? [],
                    'experience_years' => $this->experience_years,
                    'availability_notes' => $this->availability_preferences
                        ? implode(', ', array_map(
                            fn ($slot) => is_array($slot) ? implode(' ', $slot) : $slot,
                            $this->availability_preferences
                        ))
                        : null,
                    'is_active' => true,
                    'is_featured' => false,
                    'views' => 0,
                    'home_postcode' => $this->postcode,
                    'travel_radius_km' => $this->travel_radius_km,
                    'service_area_postcodes' => $this->service_area_postcodes,
                    'preferred_age_groups' => $this->preferred_age_groups,
                    'availability_preferences' => $this->availability_preferences,
                ]);
            } else {
                // Update existing trainer and link to user if created
                $trainer->update([
                    'user_id' => $user?->id ?? $trainer->user_id, // Link to user if created, keep existing if not
                    'excluded_activity_ids' => $this->excluded_activity_ids ?? $trainer->excluded_activity_ids, // Activity IDs trainer cannot facilitate
                    'exclusion_reason' => $this->exclusion_reason ?? $trainer->exclusion_reason, // Reason for limitations
                    'certifications' => $this->certifications ?? $trainer->certifications,
                    'experience_years' => $this->experience_years ?? $trainer->experience_years,
                    'home_postcode' => $this->postcode,
                    'travel_radius_km' => $this->travel_radius_km,
                    'service_area_postcodes' => $this->service_area_postcodes,
                    'preferred_age_groups' => $this->preferred_age_groups,
                    'availability_preferences' => $this->availability_preferences,
                ]);
            }

            $this->update([
                'trainer_id' => $trainer->id,
                'status' => self::STATUS_APPROVED,
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
                'review_notes' => $notes,
            ]);

            app(\App\Contracts\Notifications\INotificationDispatcher::class)
                ->dispatch(\App\Services\Notifications\NotificationIntentFactory::trainerApplicationApproved(
                    $this,
                    $user?->email,
                    $temporaryPassword
                ));

            return $trainer;
        });
    }

    public function reject(User $reviewer, ?string $reason = null): void
    {
        $this->update([
            'status' => self::STATUS_REJECTED,
            'reviewed_by' => $reviewer->id,
            'reviewed_at' => now(),
            'review_notes' => $reason,
        ]);

        app(\App\Contracts\Notifications\INotificationDispatcher::class)
            ->dispatch(\App\Services\Notifications\NotificationIntentFactory::trainerApplicationRejected($this, $reason));
    }

    /**
     * Admin requests more information from the applicant. Sends email with link to respond.
     */
    public function requestInformation(User $reviewer, string $message): void
    {
        $allowedStatuses = [
            self::STATUS_SUBMITTED,
            self::STATUS_UNDER_REVIEW,
        ];
        if (!in_array($this->status, $allowedStatuses, true)) {
            throw new \InvalidArgumentException('Application is not in a state that allows requesting information.');
        }

        $this->update([
            'status' => self::STATUS_INFORMATION_REQUESTED,
            'admin_request_message' => $message,
            'admin_requested_at' => now(),
            'trainer_response_message' => null,
            'trainer_response_at' => null,
        ]);

        app(\App\Contracts\Notifications\INotificationDispatcher::class)
            ->dispatch(\App\Services\Notifications\NotificationIntentFactory::trainerApplicationInformationRequested($this, $message));
    }

    /**
     * Applicant submits a response to an information request. Moves status back to submitted.
     */
    public function submitResponse(string $message): void
    {
        if ($this->status !== self::STATUS_INFORMATION_REQUESTED) {
            throw new \InvalidArgumentException('Application is not awaiting a response.');
        }

        $this->update([
            'trainer_response_message' => $message,
            'trainer_response_at' => now(),
            'status' => self::STATUS_SUBMITTED,
        ]);
    }
}
