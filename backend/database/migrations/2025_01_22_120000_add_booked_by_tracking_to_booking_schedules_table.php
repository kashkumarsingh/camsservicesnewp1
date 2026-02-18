<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Clean Architecture: Infrastructure/Data Layer
     * Purpose: Add tracking for who booked each session (parent vs trainer)
     * Location: backend/database/migrations/
     * 
     * This migration adds columns to track:
     * - booked_by: Whether session was booked by 'parent' or 'trainer'
     * - booked_by_user_id: Which specific user (parent or trainer) booked it
     * 
     * This supports the requirement that both parents and trainers can book sessions
     * after a package is purchased.
     */
    public function up(): void
    {
        // Only run if booking_schedules table exists
        if (Schema::hasTable('booking_schedules')) {
            Schema::table('booking_schedules', function (Blueprint $table) {
                // Add booked_by column to track if session was booked by parent or trainer
                // Using string + check constraint for PostgreSQL compatibility
                if (!Schema::hasColumn('booking_schedules', 'booked_by')) {
                    $table->string('booked_by', 20)->default('parent')
                        ->comment('Who booked this session: parent or trainer');
                }
                
                // Add CHECK constraint for PostgreSQL compatibility (skip if exists)
                try {
                    DB::statement('ALTER TABLE booking_schedules ADD CONSTRAINT check_booked_by CHECK (booked_by IN (\'parent\', \'trainer\'))');
                } catch (\Exception $e) {
                    // Constraint might already exist, ignore
                }
                
                // Add booked_by_user_id to track which specific user booked it
                if (!Schema::hasColumn('booking_schedules', 'booked_by_user_id')) {
                    $table->foreignId('booked_by_user_id')->nullable()
                        ->constrained('users')->nullOnDelete()
                        ->comment('ID of the user (parent or trainer) who booked this session');
                }
                
                // Add index for querying sessions booked by specific users
                try {
                    $table->index(['booked_by', 'booked_by_user_id'], 'idx_booking_schedules_booked_by');
                } catch (\Exception $e) {
                    // Index might already exist, ignore
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('booking_schedules', function (Blueprint $table) {
            // Drop CHECK constraint (PostgreSQL)
            try {
                DB::statement('ALTER TABLE booking_schedules DROP CONSTRAINT IF EXISTS check_booked_by');
            } catch (\Exception $e) {
                // Constraint might not exist, ignore
            }
            
            $table->dropForeign(['booked_by_user_id']);
            $table->dropIndex('idx_booking_schedules_booked_by');
            $table->dropColumn(['booked_by', 'booked_by_user_id']);
        });
    }
};

