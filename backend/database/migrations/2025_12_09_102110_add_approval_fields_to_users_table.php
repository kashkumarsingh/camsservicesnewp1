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
     * Purpose: Adds approval status and related fields to users table
     * Location: backend/database/migrations/
     * 
     * This migration adds:
     * - approval_status: pending, approved, rejected
     * - approved_at, approved_by: Track when and who approved
     * - rejection_reason, rejected_at: Track rejections
     * - registration_source: Track where registration came from
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Approval status
            $table->enum('approval_status', ['pending', 'approved', 'rejected'])
                ->default('pending')
                ->after('role')
                ->comment('User approval status for booking access');
            
            // Approval tracking
            $table->timestamp('approved_at')->nullable()->after('approval_status');
            $table->foreignId('approved_by')->nullable()->after('approved_at')
                ->constrained('users')->onDelete('set null')
                ->comment('Admin who approved this user');
            
            // Rejection tracking
            $table->text('rejection_reason')->nullable()->after('approved_by');
            $table->timestamp('rejected_at')->nullable()->after('rejection_reason');
            
            // Registration source
            $table->enum('registration_source', ['contact_page', 'direct', 'referral'])
                ->default('direct')
                ->after('rejected_at')
                ->comment('Where the registration originated from');
            
            // Indexes for performance
            $table->index('approval_status', 'idx_users_approval_status');
            $table->index(['approval_status', 'role'], 'idx_users_approval_status_role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('idx_users_approval_status_role');
            $table->dropIndex('idx_users_approval_status');
            $table->dropForeign(['approved_by']);
            $table->dropColumn([
                'approval_status',
                'approved_at',
                'approved_by',
                'rejection_reason',
                'rejected_at',
                'registration_source',
            ]);
        });
    }
};

