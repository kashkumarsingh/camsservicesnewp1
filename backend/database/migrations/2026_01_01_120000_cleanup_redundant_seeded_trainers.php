<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * Cleanup Redundant Seeded Trainers
 * 
 * Clean Architecture: Infrastructure/Data Layer
 * Purpose: Remove fake/test trainers created by TrainerSeeder
 * Location: backend/database/migrations/2026_01_01_120000_cleanup_redundant_seeded_trainers.php
 * 
 * This migration removes:
 * - Sarah Johnson (slug: sarah-johnson)
 * - Michael Chen (slug: michael-chen)
 * - Emma Williams (slug: emma-williams)
 * 
 * These are fake trainers from TrainerSeeder that are no longer needed.
 * Real trainers should come from approved TrainerApplications.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Only delete if they have no bookings/sessions assigned
        // Check for any booking_schedules referencing these trainers
        $fakeTrainerSlugs = ['sarah-johnson', 'michael-chen', 'emma-williams'];
        
        foreach ($fakeTrainerSlugs as $slug) {
            $trainer = DB::table('trainers')->where('slug', $slug)->first();
            
            if (!$trainer) {
                continue; // Already deleted
            }
            
            // Check if trainer has any assigned sessions
            $hasSessions = DB::table('booking_schedules')
                ->where('trainer_id', $trainer->id)
                ->exists();
            
            // Check if trainer has any activity associations (activity_trainer recreated in 2026_01_22)
            $hasActivities = Schema::hasTable('activity_trainer')
                ? DB::table('activity_trainer')->where('trainer_id', $trainer->id)->exists()
                : false;

            // package_trainer was dropped in 2025_12_05; trainers are no longer linked to packages directly
            $hasPackages = false;

            if (!$hasSessions && !$hasActivities && !$hasPackages) {
                // Safe to delete - no relationships
                DB::table('trainers')->where('id', $trainer->id)->delete();
            } else {
                // Has relationships - just deactivate instead
                DB::table('trainers')
                    ->where('id', $trainer->id)
                    ->update(['is_active' => false]);
            }
        }
    }

    /**
     * Reverse the migrations.
     * 
     * NOTE: We don't restore fake trainers - they should come from seeders if needed
     */
    public function down(): void
    {
        // Do nothing - we don't want to restore fake trainers
        // If needed, run TrainerSeeder again
    }
};
