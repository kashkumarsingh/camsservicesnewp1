<?php

namespace Database\Seeders;

use App\Models\TrainerApplication;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Cleanup Duplicate Trainer Applications
 * 
 * Clean Architecture: Infrastructure Layer (Data Seeding)
 * Purpose: Removes duplicate trainer applications, keeping only the most recent one per email
 * Location: backend/database/seeders/CleanupDuplicateTrainerApplications.php
 * 
 * This seeder:
 * - Finds all duplicate applications (same email)
 * - Keeps the most recent approved application (or most recent if none approved)
 * - Deletes all other duplicates
 */
class CleanupDuplicateTrainerApplications extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all applications grouped by email
        $applicationsByEmail = TrainerApplication::query()
            ->select('email', DB::raw('COUNT(*) as count'))
            ->groupBy('email')
            ->having('count', '>', 1)
            ->get();

        if ($applicationsByEmail->isEmpty()) {
            $this->command->info('✅ No duplicate applications found.');
            return;
        }

        $this->command->info("Found {$applicationsByEmail->count()} email(s) with duplicate applications");

        $totalDeleted = 0;
        $totalKept = 0;

        foreach ($applicationsByEmail as $emailGroup) {
            $email = $emailGroup->email;
            $count = $emailGroup->count;

            // Get all applications for this email, ordered by:
            // 1. Approved status first
            // 2. Most recent first
            $applications = TrainerApplication::where('email', $email)
                ->orderByRaw("CASE WHEN status = 'approved' THEN 0 ELSE 1 END")
                ->orderBy('created_at', 'desc')
                ->get();

            // Keep the first one (most recent approved, or most recent if none approved)
            $keepApplication = $applications->first();
            $duplicates = $applications->skip(1);

            $this->command->info("📧 {$email}: Keeping application ID {$keepApplication->id} (status: {$keepApplication->status}, created: {$keepApplication->created_at})");
            $totalKept++;

            // Delete all duplicates
            foreach ($duplicates as $duplicate) {
                $this->command->warn("   🗑️  Deleting duplicate application ID {$duplicate->id} (status: {$duplicate->status}, created: {$duplicate->created_at})");
                $duplicate->delete();
                $totalDeleted++;
            }
        }

        $this->command->info('');
        $this->command->info("✅ Cleanup Summary:");
        $this->command->info("   - Kept: {$totalKept} application(s)");
        $this->command->info("   - Deleted: {$totalDeleted} duplicate(s)");
    }
}
