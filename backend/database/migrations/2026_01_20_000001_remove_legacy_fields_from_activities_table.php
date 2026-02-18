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
     * Purpose: Removes unwanted fields from activities table
     * Location: backend/database/migrations/
     * 
     * This migration removes:
     * - difficulty_level (not needed in table)
     * - age_group_min (not needed in table)
     * - age_group_max (not needed in table)
     */
    public function up(): void
    {
        Schema::table('activities', function (Blueprint $table) {
            // Drop columns (indexes will be dropped automatically with columns in PostgreSQL)
            if (Schema::hasColumn('activities', 'difficulty_level')) {
                $table->dropColumn('difficulty_level');
            }
            if (Schema::hasColumn('activities', 'age_group_min')) {
                $table->dropColumn('age_group_min');
            }
            if (Schema::hasColumn('activities', 'age_group_max')) {
                $table->dropColumn('age_group_max');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('activities', function (Blueprint $table) {
            if (! Schema::hasColumn('activities', 'difficulty_level')) {
                $table->string('difficulty_level', 50)->nullable();
                $table->index('difficulty_level');
            }
            if (! Schema::hasColumn('activities', 'age_group_min')) {
                $table->unsignedTinyInteger('age_group_min')->nullable()->comment('Minimum age');
            }
            if (! Schema::hasColumn('activities', 'age_group_max')) {
                $table->unsignedTinyInteger('age_group_max')->nullable()->comment('Maximum age');
                $table->index(['age_group_min', 'age_group_max']);
            }
        });
    }
};
