<?php

namespace App\Console\Commands;

use App\Models\Trainer;
use App\Models\TrainerApplication;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Fix Approved Trainer Applications
 * 
 * This command fixes approved trainer applications that were approved
 * before the column name fix (activity_exclusions → excluded_activity_ids)
 * and creates their corresponding Trainer records.
 */
class FixApprovedTrainerApplications extends Command
{
    protected $signature = 'trainers:fix-approved-applications';

    protected $description = 'Fix approved trainer applications and create missing trainer records';

    public function handle(): int
    {
        $this->info('🔍 Searching for approved applications without trainers...');

        // Find approved applications without trainer_id
        $brokenApplications = TrainerApplication::where('status', TrainerApplication::STATUS_APPROVED)
            ->whereNull('trainer_id')
            ->get();

        if ($brokenApplications->isEmpty()) {
            $this->info('✅ All approved applications already have trainers!');
            return self::SUCCESS;
        }

        $this->warn("Found {$brokenApplications->count()} approved application(s) without trainers.");
        $this->newLine();

        $fixed = 0;
        $failed = 0;

        foreach ($brokenApplications as $application) {
            try {
                DB::transaction(function () use ($application, &$fixed) {
                    $this->info("Processing: {$application->fullName()} (ID: {$application->id})");

                    // Create trainer record
                    $trainer = Trainer::create([
                        'user_id' => null, // Will be linked if user exists
                        'name' => $application->fullName(),
                        'slug' => Str::slug($application->fullName()) . '-' . Str::lower(Str::random(4)),
                        'role' => 'Activity Coach',
                        'bio' => $application->bio ?? 'Trainer at CAMS Services',
                        'full_description' => $application->bio,
                        'image' => null,
                        'rating' => 0,
                        'total_reviews' => 0,
                        'excluded_activity_ids' => $application->excluded_activity_ids ?? [],
                        'exclusion_reason' => $application->exclusion_reason,
                        'certifications' => $application->certifications ?? [],
                        'experience_years' => $application->experience_years,
                        'availability_notes' => $application->availability_preferences
                            ? implode(', ', array_map(
                                fn ($slot) => is_array($slot) ? implode(' ', $slot) : $slot,
                                $application->availability_preferences
                            ))
                            : null,
                        'is_active' => true,
                        'is_featured' => false,
                        'views' => 0,
                        'home_postcode' => $application->postcode,
                        'travel_radius_km' => $application->travel_radius_km,
                        'service_area_postcodes' => $application->service_area_postcodes,
                        'preferred_age_groups' => $application->preferred_age_groups,
                        'availability_preferences' => $application->availability_preferences,
                    ]);

                    // Link application to trainer
                    $application->update(['trainer_id' => $trainer->id]);

                    $this->info("  ✅ Created trainer: {$trainer->name} (ID: {$trainer->id})");
                    $fixed++;
                });
            } catch (\Exception $e) {
                $this->error("  ❌ Failed: {$e->getMessage()}");
                $failed++;
            }

            $this->newLine();
        }

        $this->newLine();
        $this->info('─────────────────────────────────────────');
        $this->info('📊 Summary:');
        $this->info("✅ Fixed: {$fixed}");
        if ($failed > 0) {
            $this->error("❌ Failed: {$failed}");
        }
        $this->info('─────────────────────────────────────────');

        return self::SUCCESS;
    }
}
