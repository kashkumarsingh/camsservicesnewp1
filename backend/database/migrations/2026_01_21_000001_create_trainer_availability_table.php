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
     * Purpose: Creates the trainer_availability table for easy trainer scheduling queries
     * Location: backend/database/migrations/
     * 
     * This migration creates the trainer_availability table which stores
     * trainer availability patterns (weekly recurring or specific dates)
     * to enable efficient scheduling queries without complex calculations.
     */
    public function up(): void
    {
        if (Schema::hasTable('trainer_availability')) {
            return;
        }
        
        Schema::create('trainer_availability', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trainer_id')->constrained('trainers')->cascadeOnDelete()->comment('Trainer this availability belongs to');
            
            // Weekly recurring availability (day_of_week: 0=Sunday, 1=Monday, ..., 6=Saturday)
            $table->tinyInteger('day_of_week')->nullable()->comment('Day of week (0-6, NULL for specific dates)');
            $table->time('start_time')->nullable()->comment('Available start time');
            $table->time('end_time')->nullable()->comment('Available end time');
            
            // Specific date availability (overrides weekly pattern)
            $table->date('specific_date')->nullable()->comment('Specific date (NULL for recurring weekly)');
            $table->boolean('is_available')->default(true)->comment('Is trainer available on this day/time?');
            $table->string('reason', 255)->nullable()->comment('Reason for unavailability (e.g., "Holiday", "Training course")');
            
            $table->timestamps();
            
            // Indexes for performance
            $table->index('trainer_id', 'idx_trainer_availability_trainer_id');
            $table->index(['trainer_id', 'day_of_week'], 'idx_trainer_availability_trainer_day');
            $table->index(['trainer_id', 'specific_date'], 'idx_trainer_availability_trainer_date');
            $table->index('specific_date', 'idx_trainer_availability_date');
            $table->index('is_available', 'idx_trainer_availability_available');
            
            // Unique constraint: one record per trainer per day_of_week OR specific_date
            $table->unique(['trainer_id', 'day_of_week', 'specific_date'], 'unique_trainer_availability');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trainer_availability');
    }
};
