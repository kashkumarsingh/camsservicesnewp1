<?php

namespace App\Console\Commands;

use App\Models\Activity;
use App\Models\Package;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Diagnose Package Activities Command
 * 
 * Purpose: Show which activity IDs are linked to packages and whether they exist/are active
 */
class DiagnosePackageActivities extends Command
{
    protected $signature = 'diagnose:package-activities {package_id? : Specific package ID to check}';
    protected $description = 'Diagnose activity relationships for packages';

    public function handle()
    {
        $packageId = $this->argument('package_id');

        if ($packageId) {
            $this->diagnosePackage($packageId);
        } else {
            $this->diagnoseAllPackages();
        }
    }

    private function diagnoseAllPackages()
    {
        $this->info('🔍 Diagnosing all packages...');
        $this->newLine();

        $packages = Package::with('activities')->get();

        foreach ($packages as $package) {
            $this->diagnosePackage($package->id);
            $this->newLine();
        }
    }

    private function diagnosePackage($packageId)
    {
        $package = Package::find($packageId);

        if (!$package) {
            $this->error("Package {$packageId} not found!");
            return;
        }

        $this->info("📦 Package: {$package->name} (ID: {$package->id})");

        // Get activity IDs from pivot table
        $pivotActivityIds = DB::table('package_activity')
            ->where('package_id', $package->id)
            ->pluck('activity_id')
            ->toArray();

        $this->comment("   Activity IDs in pivot table: " . implode(', ', $pivotActivityIds));
        $this->comment("   Total in pivot: " . count($pivotActivityIds));

        // Check each activity ID
        $existingIds = [];
        $activeIds = [];
        $inactiveIds = [];
        $missingIds = [];

        foreach ($pivotActivityIds as $activityId) {
            $activity = Activity::find($activityId);

            if (!$activity) {
                $missingIds[] = $activityId;
                $this->error("   ❌ Activity ID {$activityId}: MISSING (does not exist)");
            } else {
                $existingIds[] = $activityId;
                if ($activity->is_active) {
                    $activeIds[] = $activityId;
                    $this->info("   ✅ Activity ID {$activityId}: {$activity->name} (ACTIVE)");
                } else {
                    $inactiveIds[] = $activityId;
                    $this->warn("   ⚠️  Activity ID {$activityId}: {$activity->name} (INACTIVE)");
                }
            }
        }

        $this->newLine();
        $this->table(
            ['Status', 'Count', 'IDs'],
            [
                ['Total in pivot', count($pivotActivityIds), implode(', ', $pivotActivityIds)],
                ['Existing', count($existingIds), implode(', ', $existingIds)],
                ['Active', count($activeIds), implode(', ', $activeIds)],
                ['Inactive', count($inactiveIds), implode(', ', $inactiveIds)],
                ['Missing', count($missingIds), implode(', ', $missingIds)],
            ]
        );

        if (count($inactiveIds) > 0 || count($missingIds) > 0) {
            $this->newLine();
            $this->warn('⚠️  Issues found! Run: php artisan cleanup:package-activities');
        }
    }
}
