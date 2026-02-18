<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Phase 2B Enhancement: Admin Approval for Auto-Assigned Trainers
     * 
     * This migration adds fields to track auto-assigned trainers and their approval status.
     * 
     * Flow:
     * 1. Parent books session (no trainer preference)
     * 2. System auto-assigns trainer → sets auto_assigned=true, requires_admin_approval=true
     * 3. Admin reviews and approves/changes trainer
     * 4. On approval → approved_at set, requires_admin_approval=false
     * 5. Parent & trainer notified
     */
    public function up(): void
    {
        Schema::table('booking_schedules', function (Blueprint $table) {
            // Track if trainer was auto-assigned by the system
            $table->boolean('auto_assigned')->default(false)->after('trainer_id');
            
            // Track if auto-assigned trainer requires admin approval before notification
            $table->boolean('requires_admin_approval')->default(false)->after('auto_assigned');
            
            // Track when admin approved the auto-assigned trainer
            $table->timestamp('trainer_approved_at')->nullable()->after('requires_admin_approval');
            
            // Track who approved the trainer assignment
            $table->foreignId('trainer_approved_by_user_id')->nullable()->after('trainer_approved_at')->constrained('users');
            
            // Add index for filtering sessions requiring approval
            $table->index(['requires_admin_approval', 'auto_assigned']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('booking_schedules', function (Blueprint $table) {
            $table->dropIndex(['requires_admin_approval', 'auto_assigned']);
            $table->dropForeign(['trainer_approved_by_user_id']);
            $table->dropColumn([
                'auto_assigned',
                'requires_admin_approval',
                'trainer_approved_at',
                'trainer_approved_by_user_id',
            ]);
        });
    }
};
