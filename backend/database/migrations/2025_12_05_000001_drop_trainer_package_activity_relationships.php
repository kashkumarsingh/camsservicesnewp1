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
     * Purpose: Remove trainer-package and trainer-activity relationships
     *          as per business decision that trainers don't have direct
     *          relationships with packages and activities
     * Location: backend/database/migrations/
     * 
     * This migration drops the pivot tables:
     * - package_trainer (trainer-package relationships)
     * - activity_trainer (trainer-activity relationships)
     * 
     * Note: If needed in the future, these relationships can be reintroduced.
     */
    public function up(): void
    {
        // Drop package_trainer pivot table if it exists
        if (Schema::hasTable('package_trainer')) {
            Schema::dropIfExists('package_trainer');
        }
        
        // Drop activity_trainer pivot table if it exists
        if (Schema::hasTable('activity_trainer')) {
            Schema::dropIfExists('activity_trainer');
        }
    }

    /**
     * Reverse the migrations.
     * 
     * Note: This migration does not recreate the tables as the original
     * migrations should be used if relationships need to be reintroduced.
     */
    public function down(): void
    {
        // This migration intentionally does not recreate tables
        // Use the original migrations if relationships need to be restored:
        // - 2025_11_13_072430_create_package_trainer_table.php
        // - 2025_01_16_000003_create_activity_trainer_table.php
    }
};
