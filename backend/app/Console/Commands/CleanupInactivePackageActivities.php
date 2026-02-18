<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Cleanup Inactive Package Activities Command
 * 
 * Clean Architecture: Infrastructure Layer (CLI Command)
 * Purpose: Remove inactive/missing activity relationships from packages
 * Location: backend/app/Console/Commands/CleanupInactivePackageActivities.php
 * 
 * Usage: php artisan cleanup:package-activities
 */
class CleanupInactivePackageActivities extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cleanup:package-activities {--dry-run : Show what would be deleted without actually deleting}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Remove inactive or missing activities from package relationships';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Checking for inactive/missing activities in package relationships...');
        $this->newLine();

        // Find activity IDs in package_activity that don't exist in activities table
        $missingActivities = DB::table('package_activity')
            ->leftJoin('activities', 'package_activity.activity_id', '=', 'activities.id')
            ->whereNull('activities.id')
            ->select('package_activity.package_id', 'package_activity.activity_id')
            ->get();

        // Find activity IDs in package_activity where activity is inactive
        $inactiveActivities = DB::table('package_activity')
            ->join('activities', 'package_activity.activity_id', '=', 'activities.id')
            ->where('activities.is_active', false)
            ->select(
                'package_activity.package_id',
                'package_activity.activity_id',
                'activities.name as activity_name',
                'activities.is_active'
            )
            ->get();

        $totalIssues = $missingActivities->count() + $inactiveActivities->count();

        if ($totalIssues === 0) {
            $this->info('✅ No inactive or missing activities found in package relationships!');
            return 0;
        }

        // Display findings
        if ($missingActivities->count() > 0) {
            $this->warn('📋 Missing Activities (not in activities table):');
            $this->table(
                ['Package ID', 'Activity ID', 'Status'],
                $missingActivities->map(fn($rel) => [
                    $rel->package_id,
                    $rel->activity_id,
                    'Missing from database'
                ])->toArray()
            );
            $this->newLine();
        }

        if ($inactiveActivities->count() > 0) {
            $this->warn('📋 Inactive Activities:');
            $this->table(
                ['Package ID', 'Activity ID', 'Activity Name', 'Status'],
                $inactiveActivities->map(fn($rel) => [
                    $rel->package_id,
                    $rel->activity_id,
                    $rel->activity_name,
                    'Inactive'
                ])->toArray()
            );
            $this->newLine();
        }

        $this->info("Total issues found: {$totalIssues}");
        $this->newLine();

        // If dry-run, just show what would be deleted
        if ($this->option('dry-run')) {
            $this->comment('🔍 DRY RUN - No changes made.');
            $this->comment("Would delete {$totalIssues} package-activity relationships.");
            return 0;
        }

        // Ask for confirmation
        if (!$this->confirm('Do you want to remove these relationships?', true)) {
            $this->comment('Cancelled. No changes made.');
            return 0;
        }

        // Delete missing activities from package_activity
        $deletedMissing = 0;
        foreach ($missingActivities as $rel) {
            DB::table('package_activity')
                ->where('package_id', $rel->package_id)
                ->where('activity_id', $rel->activity_id)
                ->delete();
            $deletedMissing++;
        }

        // Delete inactive activities from package_activity
        $deletedInactive = 0;
        foreach ($inactiveActivities as $rel) {
            DB::table('package_activity')
                ->where('package_id', $rel->package_id)
                ->where('activity_id', $rel->activity_id)
                ->delete();
            $deletedInactive++;
        }

        $totalDeleted = $deletedMissing + $deletedInactive;

        $this->newLine();
        $this->info('✅ Cleanup complete!');
        $this->info("   - Removed {$deletedMissing} missing activity relationships");
        $this->info("   - Removed {$deletedInactive} inactive activity relationships");
        $this->info("   - Total removed: {$totalDeleted}");

        return 0;
    }
}
