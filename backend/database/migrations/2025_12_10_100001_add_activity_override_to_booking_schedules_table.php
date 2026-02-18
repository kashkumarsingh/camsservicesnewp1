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
     * Purpose: Adds activity override and assignment tracking to booking_schedules table
     * Location: backend/database/migrations/
     * 
     * This migration adds fields for:
     * - Activity count per session (calculated or overridden)
     * - Activity override flag and reason
     * - Activity assignment workflow status
     * - Activity confirmation timestamp
     */
    public function up(): void
    {
        Schema::table('booking_schedules', function (Blueprint $table) {
            // Activity override settings
            $table->integer('activity_count')
                ->default(1)
                ->after('duration_hours')
                ->comment('Number of activities for this session (default: calculated, can be overridden)');
            
            $table->boolean('is_activity_override')
                ->default(false)
                ->after('activity_count')
                ->comment('True if trainer manually overrode the activity count');
            
            $table->text('activity_override_reason')
                ->nullable()
                ->after('is_activity_override')
                ->comment('Reason for override (required if override is true)');
            
            // Activity assignment status
            $table->enum('activity_status', ['pending', 'assigned', 'confirmed', 'completed'])
                ->default('pending')
                ->after('activity_override_reason')
                ->comment('Activity assignment workflow status');
            
            $table->timestamp('activity_confirmed_at')
                ->nullable()
                ->after('activity_status')
                ->comment('When trainer confirmed activity assignment (triggers parent notification)');
            
            // Indexes for activity queries
            $table->index('activity_status', 'idx_booking_schedules_activity_status');
            $table->index('activity_confirmed_at', 'idx_booking_schedules_activity_confirmed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('booking_schedules', function (Blueprint $table) {
            $table->dropIndex('idx_booking_schedules_activity_status');
            $table->dropIndex('idx_booking_schedules_activity_confirmed_at');
            $table->dropColumn([
                'activity_count',
                'is_activity_override',
                'activity_override_reason',
                'activity_status',
                'activity_confirmed_at',
            ]);
        });
    }
};

