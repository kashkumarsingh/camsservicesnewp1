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
     * Purpose: Adds activity calculation fields to packages table
     * Location: backend/database/migrations/
     * 
     * This migration adds fields for automatic activity calculation:
     * - hours_per_activity: Default hours per activity (default: 3.0)
     * - calculated_activities: Auto-calculated total activities
     * - allow_activity_override: Allow trainers to override activity count
     */
    public function up(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            // Activity calculation settings
            $table->decimal('hours_per_activity', 5, 2)
                ->default(3.0)
                ->after('hours_per_week')
                ->comment('Default: 3 hours = 1 activity');
            
            $table->integer('calculated_activities')
                ->nullable()
                ->after('hours_per_activity')
                ->comment('Auto-calculated total activities based on hours_per_activity');
            
            $table->boolean('allow_activity_override')
                ->default(true)
                ->after('calculated_activities')
                ->comment('Allow trainers to override activity count per session');
            
            // Index for activity calculation queries
            $table->index('calculated_activities', 'idx_packages_calculated_activities');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->dropIndex('idx_packages_calculated_activities');
            $table->dropColumn([
                'hours_per_activity',
                'calculated_activities',
                'allow_activity_override',
            ]);
        });
    }
};

