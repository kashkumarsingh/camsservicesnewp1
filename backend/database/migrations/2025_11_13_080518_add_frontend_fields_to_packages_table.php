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
     * Purpose: Adds frontend-required fields to packages table
     * Location: backend/database/migrations/
     * 
     * This migration adds:
     * - color: Tailwind gradient string for UI theming
     * - perks: JSON array of package perks
     * - activities: JSON array of activities with trainer assignments
     * - hours_per_week: Calculated hours per week
     * - views: View counter for analytics
     */
    public function up(): void
    {
        // Check if table exists before modifying
        if (!Schema::hasTable('packages')) {
            return;
        }
        
        // Check if columns already exist (idempotent - check first column as indicator)
        if (Schema::hasColumn('packages', 'color')) {
            return;
        }
        
        Schema::table('packages', function (Blueprint $table) {
            $table->string('color', 100)->nullable()->after('image')->comment('Tailwind gradient string for UI theming');
            $table->json('perks')->nullable()->after('features')->comment('Array of package perks');
            $table->json('activities')->nullable()->after('perks')->comment('Array of activities with trainer assignments');
            $table->unsignedTinyInteger('hours_per_week')->nullable()->after('duration_weeks')->comment('Hours per week (calculated: hours / duration_weeks)');
            $table->unsignedInteger('views')->default(0)->after('is_popular')->comment('View counter for analytics');
            
            // Index for views (used in sorting/filtering)
            $table->index('views', 'idx_packages_views');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->dropColumn(['color', 'perks', 'activities', 'hours_per_week', 'views']);
        });
    }
};
