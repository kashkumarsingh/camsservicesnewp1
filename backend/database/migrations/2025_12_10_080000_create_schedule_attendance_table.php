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
     * Purpose: Creates the schedule_attendance table for Phase 2 schedule management
     * Location: backend/database/migrations/
     * 
     * This migration creates the schedule_attendance table which tracks
     * participant attendance for each booking schedule.
     */
    public function up(): void
    {
        if (Schema::hasTable('schedule_attendance')) {
            return;
        }
        
        Schema::create('schedule_attendance', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_schedule_id')->constrained('booking_schedules')->cascadeOnDelete();
            $table->foreignId('booking_participant_id')->constrained('booking_participants')->cascadeOnDelete();
            $table->boolean('attended')->default(false)->comment('Did participant attend?');
            $table->time('arrival_time')->nullable()->comment('When participant arrived');
            $table->time('departure_time')->nullable()->comment('When participant left');
            $table->text('notes')->nullable()->comment('Attendance notes (e.g., "Arrived late", "Left early")');
            $table->foreignId('marked_by')->nullable()->constrained('users')->nullOnDelete()->comment('Trainer who marked attendance');
            $table->timestamp('marked_at')->nullable()->comment('When attendance was marked');
            $table->timestamps();
            
            // Indexes for performance
            $table->index('booking_schedule_id', 'idx_schedule_attendance_schedule_id');
            $table->index('booking_participant_id', 'idx_schedule_attendance_participant_id');
            $table->index(['booking_schedule_id', 'booking_participant_id'], 'idx_schedule_attendance_schedule_participant');
            
            // Unique constraint: one attendance record per participant per schedule
            $table->unique(['booking_schedule_id', 'booking_participant_id'], 'unique_schedule_participant_attendance');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedule_attendance');
    }
};

