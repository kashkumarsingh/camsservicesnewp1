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
     * Purpose: Recreates the activity_trainer pivot table that was previously dropped
     *          This table is needed for the many-to-many relationship between
     *          activities and trainers (a trainer can be qualified for multiple activities,
     *          and an activity can be taught by multiple trainers).
     * Location: backend/database/migrations/
     * 
     * Note: This migration reintroduces the activity_trainer relationship that was
     *       removed in 2025_12_05_000001_drop_trainer_package_activity_relationships.php
     *       but is now required again for the Activity edit functionality.
     */
    public function up(): void
    {
        // Idempotent check: skip if table already exists
        if (Schema::hasTable('activity_trainer')) {
            return;
        }

        // Dependency check: ensure prerequisite tables exist
        if (!Schema::hasTable('activities')) {
            echo "⚠️  Skipping activity_trainer migration: activities table does not exist yet\n";
            return;
        }
        if (!Schema::hasTable('trainers')) {
            echo "⚠️  Skipping activity_trainer migration: trainers table does not exist yet\n";
            return;
        }

        Schema::create('activity_trainer', function (Blueprint $table) {
            $table->id();
            $table->foreignId('activity_id')
                ->constrained('activities')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();
            $table->foreignId('trainer_id')
                ->constrained('trainers')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();
            $table->boolean('is_primary')->default(false)->comment('Main trainer for this activity');
            $table->timestamps();
            
            // Unique constraint to prevent duplicate assignments
            $table->unique(['activity_id', 'trainer_id'], 'unique_activity_trainer');
            
            // Indexes for performance
            $table->index('activity_id', 'idx_activity_trainer_activity');
            $table->index('trainer_id', 'idx_activity_trainer_trainer');
            
            // Composite index for finding primary trainers per activity
            $table->index(['activity_id', 'is_primary'], 'idx_activity_trainer_primary');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('activity_trainer')) {
            return;
        }

        Schema::drop('activity_trainer');
    }
};
