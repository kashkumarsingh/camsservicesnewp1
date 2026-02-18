<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Clean Architecture: Infrastructure/Data Layer
     * Purpose: Removes the activities JSON column from packages table
     * Location: backend/database/migrations/
     * 
     * This migration removes the `packages.activities` JSON column after
     * full migration to normalized activities table is complete.
     * 
     * IMPORTANT: Only run this migration after:
     * 1. All packages have been migrated to use relationships
     * 2. API is confirmed working with normalized activities
     * 3. Admin forms updated to use relationship selectors
     * 4. All code references updated
     */
    public function up(): void
    {
        if (! Schema::hasTable('packages')) {
            return;
        }

        if (! Schema::hasColumn('packages', 'activities')) {
            return;
        }

        Schema::table('packages', function (Blueprint $table) {
            $table->dropColumn('activities');
        });
    }

    /**
     * Reverse the migrations.
     * 
     * Note: This will NOT restore the JSON data. The JSON column
     * is recreated but will be empty. Data must be restored from
     * backup or recreated from normalized relationships.
     */
    public function down(): void
    {
        if (! Schema::hasTable('packages')) {
            return;
        }

        if (Schema::hasColumn('packages', 'activities')) {
            return;
        }

        Schema::table('packages', function (Blueprint $table) {
            $table->json('activities')->nullable()->after('perks')->comment('Array of activities with trainer assignments (DEPRECATED - use activities relationship)');
        });
    }
};

