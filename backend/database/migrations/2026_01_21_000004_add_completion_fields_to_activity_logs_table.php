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
     * Purpose: Adds completion tracking fields to activity_logs table
     * Location: backend/database/migrations/
     * 
     * This migration adds fields to track activity completion status,
     * actual hours used, and parent approval workflow for activity logs.
     */
    public function up(): void
    {
        if (!Schema::hasTable('activity_logs')) {
            return;
        }
        
        Schema::table('activity_logs', function (Blueprint $table) {
            // Actual hours used (may differ from duration_minutes)
            $table->decimal('actual_hours_used', 5, 2)
                ->nullable()
                ->after('duration_minutes')
                ->comment('Actual hours used (may differ from scheduled duration)');
            
            // Activity status (more granular than existing status)
            $table->enum('activity_status', ['planned', 'in_progress', 'completed', 'not_completed'])
                ->default('planned')
                ->after('status')
                ->comment('Activity completion status');
            
            // Completion timestamp
            $table->timestamp('activity_completed_at')
                ->nullable()
                ->after('activity_status')
                ->comment('When activity was marked as completed');
            
            // Parent approval workflow
            $table->boolean('requires_parent_approval')
                ->default(false)
                ->after('activity_completed_at')
                ->comment('Does this activity require parent approval?');
            
            $table->timestamp('parent_approved_at')
                ->nullable()
                ->after('requires_parent_approval')
                ->comment('When parent approved this activity');
            
            // Indexes for performance
            $table->index('activity_status', 'idx_activity_logs_activity_status');
            $table->index('activity_completed_at', 'idx_activity_logs_completed_at');
            $table->index('parent_approved_at', 'idx_activity_logs_parent_approved');
            $table->index('requires_parent_approval', 'idx_activity_logs_requires_approval');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('activity_logs')) {
            return;
        }
        
        Schema::table('activity_logs', function (Blueprint $table) {
            $table->dropIndex('idx_activity_logs_activity_status');
            $table->dropIndex('idx_activity_logs_completed_at');
            $table->dropIndex('idx_activity_logs_parent_approved');
            $table->dropIndex('idx_activity_logs_requires_approval');
            
            $table->dropColumn([
                'actual_hours_used',
                'activity_status',
                'activity_completed_at',
                'requires_parent_approval',
                'parent_approved_at',
            ]);
        });
    }
};
