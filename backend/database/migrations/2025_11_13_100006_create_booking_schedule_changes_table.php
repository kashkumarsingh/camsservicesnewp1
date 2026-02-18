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
     * Purpose: Creates the booking_schedule_changes audit table for Phase 1 booking system
     * Location: backend/database/migrations/
     * 
     * This migration creates the booking_schedule_changes table which tracks
     * all reschedule/cancellation changes for booking schedules (audit trail).
     */
    public function up(): void
    {
        // Idempotent check: skip if table already exists
        if (Schema::hasTable('booking_schedule_changes')) {
            return;
        }
        
        // Note: This migration depends on 'booking_schedules' and 'users' tables
        // If those tables don't exist, the foreign key constraints will fail
        // which is the correct behavior - migrations should run in order
        // RefreshDatabase trait ensures migrations run in timestamp order
        
        Schema::create('booking_schedule_changes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_schedule_id')->constrained('booking_schedules')->cascadeOnDelete();
            $table->enum('change_type', ['reschedule', 'cancel', 'complete', 'no_show', 'status_change'])->comment('Type of change');
            $table->enum('old_status', ['scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled'])->nullable();
            $table->enum('new_status', ['scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled'])->nullable();
            $table->date('old_date')->nullable();
            $table->date('new_date')->nullable();
            $table->time('old_start_time')->nullable();
            $table->time('new_start_time')->nullable();
            $table->time('old_end_time')->nullable();
            $table->time('new_end_time')->nullable();
            $table->text('reason')->nullable()->comment('Reason for change');
            $table->foreignId('changed_by_user_id')->nullable()->constrained('users')->nullOnDelete()->comment('Admin/user who made the change');
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->json('metadata')->nullable()->comment('Additional change data');
            $table->timestamps();
            
            // Indexes for performance
            $table->index('booking_schedule_id', 'idx_booking_schedule_changes_schedule_id');
            $table->index('changed_by_user_id', 'idx_booking_schedule_changes_user_id');
            $table->index('change_type', 'idx_booking_schedule_changes_type');
            $table->index('created_at', 'idx_booking_schedule_changes_created_at');
            $table->index(['booking_schedule_id', 'created_at'], 'idx_booking_schedule_changes_schedule_created');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_schedule_changes');
    }
};


