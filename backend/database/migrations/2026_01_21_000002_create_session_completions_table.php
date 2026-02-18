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
     * Purpose: Creates the session_completions table for clear completion workflow
     * Location: backend/database/migrations/
     * 
     * This migration creates the session_completions table which stores
     * completion details for sessions, including actual times, summaries,
     * and parent approval workflow for transparency.
     */
    public function up(): void
    {
        if (Schema::hasTable('session_completions')) {
            return;
        }
        
        Schema::create('session_completions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_schedule_id')
                ->unique()
                ->constrained('booking_schedules')
                ->cascadeOnDelete()
                ->comment('One completion record per session');
            
            // Actual session times
            $table->time('actual_start_time')->nullable()->comment('When session actually started');
            $table->time('actual_end_time')->nullable()->comment('When session actually ended');
            $table->decimal('actual_duration_hours', 5, 2)->nullable()->comment('Actual duration in hours');
            
            // Session summary and feedback
            $table->text('session_summary')->nullable()->comment('Overall session summary');
            $table->text('highlights')->nullable()->comment('Key highlights and achievements');
            $table->text('areas_for_improvement')->nullable()->comment('Areas that need improvement');
            
            // Approval workflow
            $table->timestamp('trainer_approved_at')->nullable()->comment('When trainer marked as complete');
            $table->timestamp('parent_notified_at')->nullable()->comment('When parent was notified of completion');
            $table->timestamp('parent_approved_at')->nullable()->comment('When parent approved the session');
            
            // Dispute handling
            $table->text('dispute_reason')->nullable()->comment('Reason for dispute (if any)');
            $table->enum('dispute_status', ['none', 'pending', 'resolved', 'refund_issued'])
                ->default('none')
                ->comment('Dispute status');
            
            $table->timestamps();
            
            // Indexes for performance
            $table->index('booking_schedule_id', 'idx_session_completions_schedule_id');
            $table->index('parent_approved_at', 'idx_session_completions_parent_approved');
            $table->index('dispute_status', 'idx_session_completions_dispute_status');
            $table->index('trainer_approved_at', 'idx_session_completions_trainer_approved');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('session_completions');
    }
};
