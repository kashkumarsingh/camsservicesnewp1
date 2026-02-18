<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * PostgreSQL-compatible: Handles existing data by adding nullable column,
     * backfilling with default value, then making it NOT NULL.
     */
    public function up(): void
    {
        // Check if column already exists (idempotent)
        if (Schema::hasColumn('activities', 'category')) {
            return;
        }

        // Step 1: Add category field as nullable first (for existing rows)
        // Note: PostgreSQL doesn't support ->after(), so column will be added at end
        Schema::table("activities", function (Blueprint $table) {
            $table->string("category", 50)->nullable();
        });

        // Step 2: Backfill existing rows with default category
        DB::table('activities')
            ->whereNull('category')
            ->update(['category' => 'other']);

        // Step 3: Make it NOT NULL with default (PostgreSQL-compatible)
        if (DB::getDriverName() === 'pgsql') {
            // PostgreSQL: Use raw SQL to set default and NOT NULL
            DB::statement("ALTER TABLE activities ALTER COLUMN category SET DEFAULT 'other'");
            DB::statement("ALTER TABLE activities ALTER COLUMN category SET NOT NULL");
        } else {
            // MySQL: Use Laravel's change() method
            Schema::table("activities", function (Blueprint $table) {
                $table->string("category", 50)->default('other')->nullable(false)->change();
            });
        }

        // Step 4: Add index after column is created and populated
        Schema::table("activities", function (Blueprint $table) {
            $table->index("category");
        });
        
        // Categories:
        // - water_based: Swimming, Diving, Water Polo, etc.
        // - high_intensity: Sprinting, CrossFit, HIIT, etc.
        // - heights: Rock Climbing, Bouldering, etc.
        // - contact_sports: Rugby, Wrestling, Judo, etc.
        // - outdoor_extreme: Mountain Biking, BMX, etc.
        // - indoor_technical: Gymnastics, Dance, etc.
        // - special_needs: Adaptive PE, Wheelchair Sports, etc.
        // - other: General/multi-sport activities (default)
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table("activities", function (Blueprint $table) {
            $table->dropColumn("category");
        });
    }
};
