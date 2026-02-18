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
     * Purpose: Adds activity assignment tracking to booking_schedule_activities table
     * Location: backend/database/migrations/
     * 
     * This migration adds fields for:
     * - Activity assignment workflow status
     * - Trainer who assigned the activity
     * - Assignment and confirmation timestamps
     */
    public function up(): void
    {
        Schema::table('booking_schedule_activities', function (Blueprint $table) {
            // Activity assignment workflow
            $table->enum('assignment_status', ['draft', 'assigned', 'confirmed'])
                ->default('draft')
                ->after('notes')
                ->comment('Activity assignment status');
            
            $table->foreignId('assigned_by')
                ->nullable()
                ->after('assignment_status')
                ->constrained('users')
                ->nullOnDelete()
                ->comment('Trainer who assigned this activity');
            
            $table->timestamp('assigned_at')
                ->nullable()
                ->after('assigned_by')
                ->comment('When activity was assigned');
            
            $table->timestamp('confirmed_at')
                ->nullable()
                ->after('assigned_at')
                ->comment('When activity was confirmed (triggers parent notification)');
            
            // Indexes for activity assignment queries
            $table->index('assignment_status', 'idx_booking_schedule_activities_status');
            $table->index('assigned_by', 'idx_booking_schedule_activities_assigned_by');
            $table->index('confirmed_at', 'idx_booking_schedule_activities_confirmed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('booking_schedule_activities', function (Blueprint $table) {
            $table->dropIndex('idx_booking_schedule_activities_status');
            $table->dropIndex('idx_booking_schedule_activities_assigned_by');
            $table->dropIndex('idx_booking_schedule_activities_confirmed_at');
            $table->dropForeign(['assigned_by']);
            $table->dropColumn([
                'assignment_status',
                'assigned_by',
                'assigned_at',
                'confirmed_at',
            ]);
        });
    }
};

