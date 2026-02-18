<?php

namespace Database\Seeders;

use App\Models\Trainer;
use App\Models\TrainerApplication;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Retroactively Create Trainers From Approved Applications
 * 
 * Clean Architecture: Infrastructure Layer (Data Seeding)
 * Purpose: Creates Trainer records from approved TrainerApplications that don't have trainer_id set
 * Location: backend/database/seeders/RetroactivelyCreateTrainersFromApplications.php
 * 
 * This seeder:
 * - Finds all approved applications without trainer_id
 * - Groups by email to avoid duplicates
 * - Creates one Trainer per unique email
 * - Links all applications for that email to the created trainer
 */
class RetroactivelyCreateTrainersFromApplications extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get admin user for reviewer (or use first user if no admin)
        $admin = User::where('role', 'admin')->first() ?? User::first();
        
        if (!$admin) {
            $this->command->error('❌ No users found. Cannot create trainers.');
            return;
        }

        // Get all approved applications without trainer_id, grouped by email
        $applicationsByEmail = TrainerApplication::where('status', TrainerApplication::STATUS_APPROVED)
            ->whereNull('trainer_id')
            ->get()
            ->groupBy('email');

        $this->command->info("Found {$applicationsByEmail->count()} unique emails with approved applications (no trainer_id)");

        $created = 0;
        $updated = 0;
        $skipped = 0;

        foreach ($applicationsByEmail as $email => $applications) {
            // Use the most recent application as the source of truth
            $latestApplication = $applications->sortByDesc('created_at')->first();

            // Check if a trainer already exists for this email
            $existingTrainer = Trainer::where('name', $latestApplication->fullName())
                ->orWhere('slug', 'like', Str::slug($latestApplication->fullName()) . '%')
                ->first();

            if ($existingTrainer) {
                $this->command->warn("⚠️  Trainer already exists for {$email}: {$existingTrainer->name} (ID: {$existingTrainer->id})");
                $skipped++;
                
                // Link all applications to existing trainer
                foreach ($applications as $app) {
                    if (!$app->trainer_id) {
                        $app->update(['trainer_id' => $existingTrainer->id]);
                        $updated++;
                    }
                }
                continue;
            }

            // Create new trainer from application
            try {
                $trainer = Trainer::create([
                    'user_id' => null,
                    'name' => $latestApplication->fullName(),
                    'slug' => Str::slug($latestApplication->fullName()) . '-' . Str::lower(Str::random(4)),
                    'role' => 'Activity Coach',
                    'bio' => $latestApplication->bio ?? 'Trainer at CAMS Services',
                    'full_description' => $latestApplication->bio,
                    'image' => null,
                    'rating' => 0,
                    'total_reviews' => 0,
                    'specialties' => $latestApplication->activity_specialties ?? [],
                    'certifications' => $latestApplication->certifications ?? [],
                    'experience_years' => $latestApplication->experience_years ?? 0,
                    'availability_notes' => $latestApplication->availability_preferences
                        ? implode(', ', array_map(
                            fn ($slot) => is_array($slot) ? implode(' ', $slot) : $slot,
                            $latestApplication->availability_preferences
                        ))
                        : null,
                    'is_active' => true,
                    'is_featured' => false,
                    'views' => 0,
                    'home_postcode' => $latestApplication->postcode,
                    'travel_radius_km' => $latestApplication->travel_radius_km ?? 10,
                    'service_area_postcodes' => $latestApplication->service_area_postcodes ?? [],
                    'preferred_age_groups' => $latestApplication->preferred_age_groups ?? [],
                    'availability_preferences' => $latestApplication->availability_preferences ?? [],
                ]);

                $this->command->info("✅ Created trainer: {$trainer->name} (ID: {$trainer->id}) from {$email}");
                $created++;

                // Link all applications for this email to the new trainer
                foreach ($applications as $app) {
                    $app->update([
                        'trainer_id' => $trainer->id,
                        'reviewed_by' => $admin->id,
                        'reviewed_at' => $app->reviewed_at ?? now(),
                    ]);
                    $updated++;
                }
            } catch (\Exception $e) {
                $this->command->error("❌ Failed to create trainer for {$email}: {$e->getMessage()}");
                $skipped++;
            }
        }

        $this->command->info('');
        $this->command->info("✅ Summary:");
        $this->command->info("   - Created {$created} new trainer(s)");
        $this->command->info("   - Updated {$updated} application(s) with trainer_id");
        $this->command->info("   - Skipped {$skipped} email(s)");
    }
}
