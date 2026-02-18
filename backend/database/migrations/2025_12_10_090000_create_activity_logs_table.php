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
     * Purpose: Creates the activity_logs table for Phase 3 activity logging
     * Location: backend/database/migrations/
     * 
     * This migration creates the activity_logs table which allows trainers
     * to log daily activities with assigned children, including photos,
     * progress notes, and milestones.
     */
    public function up(): void
    {
        if (Schema::hasTable('activity_logs')) {
            return;
        }
        
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trainer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('child_id')->constrained('children')->cascadeOnDelete();
            $table->foreignId('booking_id')->nullable()->constrained('bookings')->nullOnDelete()->comment('Optional: link to specific booking');
            $table->foreignId('booking_schedule_id')->nullable()->constrained('booking_schedules')->nullOnDelete()->comment('Optional: link to specific schedule');
            $table->string('activity_name', 255)->comment('Name of the activity');
            $table->text('description')->nullable()->comment('Activity description');
            $table->text('notes')->nullable()->comment('Trainer notes and observations');
            $table->text('behavioral_observations')->nullable()->comment('Behavioral notes');
            $table->text('achievements')->nullable()->comment('Achievements and milestones');
            $table->text('challenges')->nullable()->comment('Challenges faced');
            $table->enum('status', ['in_progress', 'completed', 'needs_attention'])->default('in_progress')->comment('Activity status');
            $table->date('activity_date')->comment('Date of the activity');
            $table->time('start_time')->nullable()->comment('Activity start time');
            $table->time('end_time')->nullable()->comment('Activity end time');
            $table->decimal('duration_minutes', 6, 2)->nullable()->comment('Activity duration in minutes');
            $table->json('photos')->nullable()->comment('Array of photo URLs/paths');
            $table->json('videos')->nullable()->comment('Array of video URLs/paths');
            $table->boolean('consent_photography')->default(false)->comment('Photography consent obtained');
            $table->boolean('milestone_achieved')->default(false)->comment('Did child achieve a milestone?');
            $table->string('milestone_name', 255)->nullable()->comment('Name of milestone if achieved');
            $table->text('milestone_description')->nullable()->comment('Milestone description');
            $table->boolean('is_editable')->default(true)->comment('Can this log be edited? (false after 24 hours)');
            $table->timestamp('editable_until')->nullable()->comment('When editing expires (24 hours after creation)');
            $table->timestamps();
            
            // Indexes for performance
            $table->index('trainer_id', 'idx_activity_logs_trainer_id');
            $table->index('child_id', 'idx_activity_logs_child_id');
            $table->index('booking_id', 'idx_activity_logs_booking_id');
            $table->index('booking_schedule_id', 'idx_activity_logs_schedule_id');
            $table->index('activity_date', 'idx_activity_logs_date');
            $table->index(['trainer_id', 'child_id'], 'idx_activity_logs_trainer_child');
            $table->index(['child_id', 'activity_date'], 'idx_activity_logs_child_date');
            $table->index('status', 'idx_activity_logs_status');
            $table->index('milestone_achieved', 'idx_activity_logs_milestone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};

