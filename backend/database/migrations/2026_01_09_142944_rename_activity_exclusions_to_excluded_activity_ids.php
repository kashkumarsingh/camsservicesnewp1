<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Rename activity_exclusions to excluded_activity_ids
     * Data change: from category keys (string[]) to activity IDs (string[])
     * 
     * NOTE: Existing data will be cleared since we're changing the data structure
     * (categories -> activity IDs). Trainers will need to resubmit if they had exclusions.
     */
    public function up(): void
    {
        // Rename column in trainer_applications table
        Schema::table('trainer_applications', function (Blueprint $table) {
            $table->renameColumn('activity_exclusions', 'excluded_activity_ids');
        });

        // Clear existing data since structure changed from categories to IDs
        DB::table('trainer_applications')->update(['excluded_activity_ids' => null]);

        // Rename column in trainers table as well
        Schema::table('trainers', function (Blueprint $table) {
            $table->renameColumn('activity_exclusions', 'excluded_activity_ids');
        });

        // Clear existing data in trainers table too
        DB::table('trainers')->update(['excluded_activity_ids' => null]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Rename back
        Schema::table('trainer_applications', function (Blueprint $table) {
            $table->renameColumn('excluded_activity_ids', 'activity_exclusions');
        });

        Schema::table('trainers', function (Blueprint $table) {
            $table->renameColumn('excluded_activity_ids', 'activity_exclusions');
        });
    }
};
