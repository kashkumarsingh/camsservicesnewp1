<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\Package;
use App\Models\Activity;
use App\Models\Trainer;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Clean Architecture: Infrastructure/Data Layer
     * Purpose: Migrates activities from JSON in packages table to normalized activities table
     * Location: backend/database/migrations/
     * 
     * This migration:
     * 1. Extracts unique activities from packages.activities JSON
     * 2. Creates Activity records
     * 3. Creates Package-Activity relationships
     * 4. Creates Activity-Trainer relationships
     */
    public function up(): void
    {
        // Only run if activities table exists and packages table has data
        if (!Schema::hasTable('activities') || !Schema::hasTable('packages')) {
            return;
        }

        // Use transaction for data integrity
        DB::beginTransaction();
        
        try {
            $activitiesMap = []; // Map old activity IDs to new Activity models
            $processedActivities = []; // Track processed activities by name to avoid duplicates

            // Get all packages with activities
            $packages = Package::whereNotNull('activities')
                ->where('activities', '!=', '[]')
                ->where('activities', '!=', 'null')
                ->get();

            foreach ($packages as $package) {
                $activities = $package->activities ?? [];
                
                if (!is_array($activities) || empty($activities)) {
                    continue;
                }

                foreach ($activities as $index => $activityData) {
                    // Skip if activity data is invalid
                    if (!isset($activityData['name']) || empty($activityData['name'])) {
                        continue;
                    }

                    $activityName = trim($activityData['name']);
                    $activityKey = strtolower($activityName);

                    // Check if we've already processed this activity
                    if (!isset($processedActivities[$activityKey])) {
                        // Create new Activity record
                        $slug = Str::slug($activityName);
                        
                        // Ensure slug is unique
                        $originalSlug = $slug;
                        $counter = 1;
                        while (Activity::where('slug', $slug)->exists()) {
                            $slug = $originalSlug . '-' . $counter;
                            $counter++;
                        }

                        $activity = Activity::create([
                            'name' => $activityName,
                            'slug' => $slug,
                            'description' => $activityData['description'] ?? null,
                            'image_url' => $activityData['imageUrl'] ?? null,
                            'duration' => $activityData['duration'] ?? 1.0,
                            'difficulty_level' => null, // Can be set later
                            'age_group_min' => null,
                            'age_group_max' => null,
                            'is_active' => true,
                        ]);

                        $processedActivities[$activityKey] = $activity;
                        
                        // Store mapping from old ID to new Activity
                        if (isset($activityData['id'])) {
                            $activitiesMap[$activityData['id']] = $activity;
                        }
                    } else {
                        $activity = $processedActivities[$activityKey];
                        
                        // Store mapping from old ID to new Activity
                        if (isset($activityData['id'])) {
                            $activitiesMap[$activityData['id']] = $activity;
                        }
                    }

                    // Create Package-Activity relationship
                    $package->activities()->syncWithoutDetaching([
                        $activity->id => ['order' => $index]
                    ]);

                    // Create Activity-Trainer relationships
                    if (isset($activityData['trainerIds']) && is_array($activityData['trainerIds'])) {
                        foreach ($activityData['trainerIds'] as $trainerIndex => $trainerId) {
                            $trainer = Trainer::find($trainerId);
                            if ($trainer) {
                                // First trainer is primary
                                $activity->trainers()->syncWithoutDetaching([
                                    $trainer->id => ['is_primary' => $trainerIndex === 0]
                                ]);
                            }
                        }
                    }
                }
            }
            
            // Commit transaction if all operations succeeded
            DB::commit();
        } catch (\Exception $e) {
            // Rollback on any error
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Reverse the migrations.
     * 
     * Note: This does NOT restore JSON activities as that would be complex
     * and potentially lose data. The activities JSON column remains in packages
     * for backward compatibility during migration period.
     */
    public function down(): void
    {
        // Optionally, you could delete all activities and relationships here
        // But we'll keep them for safety during rollback
        // DB::table('activity_trainer')->truncate();
        // DB::table('package_activity')->truncate();
        // Activity::truncate();
    }
};

