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
     * Purpose: Defines the junction table for many-to-many relationship
     *          between activities and trainers
     * Location: backend/database/migrations/
     * 
     * This migration creates the activity_trainer pivot table which links
     * activities to trainers (a trainer can be qualified for multiple activities,
     * and an activity can be taught by multiple trainers).
     */
    public function up(): void
    {
        if (Schema::hasTable('activity_trainer')) {
            return;
        }

        if (! Schema::hasTable('activities') || ! Schema::hasTable('trainers')) {
            return;
        }

        Schema::create('activity_trainer', function (Blueprint $table) {
            $table->id();
            $table->foreignId('activity_id')
                ->constrained('activities')
                ->onDelete('cascade')
                ->onUpdate('cascade');
            $table->foreignId('trainer_id')
                ->constrained('trainers')
                ->onDelete('cascade')
                ->onUpdate('cascade');
            $table->boolean('is_primary')->default(false)->comment('Main trainer for this activity');
            $table->timestamps();
            
            // Unique constraint to prevent duplicate assignments
            $table->unique(['activity_id', 'trainer_id'], 'unique_activity_trainer');
            
            // Indexes for performance (foreign keys are auto-indexed, but explicit for clarity)
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
        if (! Schema::hasTable('activity_trainer')) {
            return;
        }

        Schema::drop('activity_trainer');
    }
};

