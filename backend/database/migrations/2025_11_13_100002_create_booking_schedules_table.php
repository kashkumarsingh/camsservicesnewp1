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
     * Purpose: Creates the booking_schedules table for Phase 1 booking system
     * Location: backend/database/migrations/
     * 
     * This migration creates the booking_schedules table which stores
     * individual sessions/schedules within a booking (one-to-many relationship).
     */
    public function up(): void
    {
        // Idempotent check: skip if table already exists
        if (Schema::hasTable('booking_schedules')) {
            return;
        }
        
        // Note: This migration depends on 'bookings' and 'trainers' tables
        // If those tables don't exist, the foreign key constraints will fail
        // which is the correct behavior - migrations should run in order
        // RefreshDatabase trait ensures migrations run in timestamp order
        
        Schema::create('booking_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->date('date')->comment('Session date');
            $table->time('start_time')->comment('Session start time e.g., 09:00:00');
            $table->time('end_time')->comment('Session end time e.g., 12:00:00');
            $table->foreignId('trainer_id')->nullable()->constrained('trainers')->nullOnDelete();
            $table->decimal('duration_hours', 5, 2)->comment('Calculated duration');
            $table->decimal('actual_duration_hours', 5, 2)->nullable()->comment('Actual duration (if different)');
            $table->string('mode_key', 50)->nullable()->comment('e.g., single-day-event, school-run');
            $table->text('itinerary_notes')->nullable()->comment('Mode-specific itinerary data (JSON)');
            $table->enum('status', ['scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled'])->default('scheduled')->comment('Session status');
            $table->date('original_date')->nullable()->comment('Original date before reschedule');
            $table->time('original_start_time')->nullable()->comment('Original time before reschedule');
            $table->time('actual_start_time')->nullable()->comment('Actual start time');
            $table->time('actual_end_time')->nullable()->comment('Actual end time');
            $table->timestamp('rescheduled_at')->nullable()->comment('When rescheduled');
            $table->text('reschedule_reason')->nullable()->comment('Why rescheduled');
            $table->text('cancellation_reason')->nullable()->comment('Why cancelled');
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->unsignedTinyInteger('order')->default(0)->comment('Display order');
            $table->timestamps();
            
            // Indexes for performance
            $table->index('booking_id', 'idx_booking_schedules_booking_id');
            $table->index('date', 'idx_booking_schedules_date');
            $table->index('trainer_id', 'idx_booking_schedules_trainer_id');
            $table->index('status', 'idx_booking_schedules_status');
            $table->index(['booking_id', 'date'], 'idx_booking_schedules_booking_date');
            $table->index(['trainer_id', 'date'], 'idx_booking_schedules_trainer_date');
            $table->index(['trainer_id', 'date', 'start_time', 'end_time'], 'idx_booking_schedules_trainer_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_schedules');
    }
};


