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
     * Purpose: Creates the trainer_notes table for Phase 2 schedule management
     * Location: backend/database/migrations/
     * 
     * This migration creates the trainer_notes table which allows trainers
     * to add notes to bookings and schedules.
     */
    public function up(): void
    {
        if (Schema::hasTable('trainer_notes')) {
            return;
        }
        
        Schema::create('trainer_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trainer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->foreignId('booking_schedule_id')->nullable()->constrained('booking_schedules')->nullOnDelete()->comment('If note is for specific schedule');
            $table->text('note')->comment('Note content');
            $table->enum('type', ['general', 'incident', 'feedback', 'attendance'])->default('general')->comment('Note type');
            $table->boolean('is_private')->default(false)->comment('Private notes (not visible to parents)');
            $table->timestamps();
            
            // Indexes for performance
            $table->index('trainer_id', 'idx_trainer_notes_trainer_id');
            $table->index('booking_id', 'idx_trainer_notes_booking_id');
            $table->index('booking_schedule_id', 'idx_trainer_notes_schedule_id');
            $table->index(['trainer_id', 'booking_id'], 'idx_trainer_notes_trainer_booking');
            $table->index('type', 'idx_trainer_notes_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trainer_notes');
    }
};

