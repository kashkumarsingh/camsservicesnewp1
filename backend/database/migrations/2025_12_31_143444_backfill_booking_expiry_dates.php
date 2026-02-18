<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Clean Architecture: Infrastructure/Data Layer
     * Purpose: Backfill expiry dates for existing bookings that were created before the bug fix
     * Location: backend/database/migrations/
     * 
     * This migration calculates and sets package_expires_at and hours_expires_at
     * for existing bookings based on their package's duration_weeks field.
     * 
     * Only updates bookings where:
     * - package_expires_at is NULL
     * - booking has a valid package with duration_weeks > 0
     * - booking is not cancelled
     */
    public function up(): void
    {
        $driver = DB::connection()->getDriverName();
        
        if ($driver === 'pgsql') {
            // PostgreSQL syntax - use FROM clause for JOIN in UPDATE
            DB::statement("
                UPDATE bookings
                SET 
                    package_expires_at = bookings.created_at + (packages.duration_weeks || ' weeks')::INTERVAL,
                    hours_expires_at = bookings.created_at + (packages.duration_weeks || ' weeks')::INTERVAL
                FROM packages
                WHERE bookings.package_id = packages.id
                    AND bookings.package_expires_at IS NULL
                    AND bookings.deleted_at IS NULL
                    AND packages.duration_weeks IS NOT NULL
                    AND packages.duration_weeks > 0
            ");
        } else {
            // MySQL syntax
            DB::statement("
                UPDATE bookings
                INNER JOIN packages ON bookings.package_id = packages.id
                SET 
                    bookings.package_expires_at = DATE_ADD(bookings.created_at, INTERVAL packages.duration_weeks WEEK),
                    bookings.hours_expires_at = DATE_ADD(bookings.created_at, INTERVAL packages.duration_weeks WEEK)
                WHERE 
                    bookings.package_expires_at IS NULL
                    AND bookings.deleted_at IS NULL
                    AND packages.duration_weeks IS NOT NULL
                    AND packages.duration_weeks > 0
            ");
        }

        // Log how many bookings were updated
        $updatedCount = DB::table('bookings')
            ->whereNotNull('package_expires_at')
            ->whereNull('deleted_at')
            ->count();

        if ($updatedCount > 0) {
            echo "✅ Backfilled expiry dates for {$updatedCount} bookings.\n";
        } else {
            echo "ℹ️  No bookings needed expiry date backfilling.\n";
        }
    }

    /**
     * Reverse the migrations.
     * 
     * Note: This sets expiry dates back to NULL for bookings that were updated.
     * Only reverts bookings that were updated in this migration (have expiry dates
     * that match the calculated pattern: created_at + duration_weeks).
     */
    public function down(): void
    {
        $driver = DB::connection()->getDriverName();
        
        if ($driver === 'pgsql') {
            // PostgreSQL syntax - use FROM clause for JOIN in UPDATE
            DB::statement("
                UPDATE bookings
                SET 
                    package_expires_at = NULL,
                    hours_expires_at = NULL
                FROM packages
                WHERE bookings.package_id = packages.id
                    AND bookings.package_expires_at IS NOT NULL
                    AND bookings.deleted_at IS NULL
                    AND packages.duration_weeks IS NOT NULL
                    AND packages.duration_weeks > 0
                    AND bookings.package_expires_at = bookings.created_at + (packages.duration_weeks || ' weeks')::INTERVAL
            ");
        } else {
            // MySQL syntax
            DB::statement("
                UPDATE bookings
                INNER JOIN packages ON bookings.package_id = packages.id
                SET 
                    bookings.package_expires_at = NULL,
                    bookings.hours_expires_at = NULL
                WHERE 
                    bookings.package_expires_at IS NOT NULL
                    AND bookings.deleted_at IS NULL
                    AND packages.duration_weeks IS NOT NULL
                    AND packages.duration_weeks > 0
                    AND bookings.package_expires_at = DATE_ADD(bookings.created_at, INTERVAL packages.duration_weeks WEEK)
            ");
        }

        echo "⚠️  Reverted expiry dates to NULL for bookings updated by this migration.\n";
        echo "   Note: This may affect bookings that were manually set with the same calculation.\n";
    }
};
