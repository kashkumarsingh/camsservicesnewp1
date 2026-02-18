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
     * Purpose: Creates the booking_schedule_activities pivot table for Phase 1 booking system
     * Location: backend/database/migrations/
     * 
     * This migration creates the booking_schedule_activities table which links
     * activities to booking schedules (many-to-many relationship via pivot).
     */
    public function up(): void
    {
        // Idempotent check: skip if table already exists
        if (Schema::hasTable('booking_schedule_activities')) {
            return;
        }
        
        // Note: This migration depends on 'booking_schedules' and 'activities' tables
        // If those tables don't exist, the foreign key constraints will fail
        // which is the correct behavior - migrations should run in order
        // RefreshDatabase trait ensures migrations run in timestamp order
        
        Schema::create('booking_schedule_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_schedule_id')->constrained('booking_schedules')->cascadeOnDelete();
            $table->foreignId('activity_id')->constrained('activities')->cascadeOnDelete();
            $table->decimal('duration_hours', 5, 2)->comment('Activity duration within this session');
            $table->unsignedTinyInteger('order')->default(0)->comment('Display order');
            $table->text('notes')->nullable()->comment('Activity-specific notes');
            $table->timestamps();
            
            // Indexes for performance
            $table->index('booking_schedule_id', 'idx_booking_schedule_activities_schedule_id');
            $table->index('activity_id', 'idx_booking_schedule_activities_activity_id');
            $table->index(['booking_schedule_id', 'order'], 'idx_booking_schedule_activities_schedule_order');
            
            // Unique constraint to prevent duplicates
            $table->unique(['booking_schedule_id', 'activity_id'], 'unique_booking_schedule_activity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_schedule_activities');
    }
};


