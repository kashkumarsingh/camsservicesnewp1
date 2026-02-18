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
     * Purpose: Creates the booking_audit_logs table for complete audit trail
     * Location: backend/database/migrations/
     * 
     * This migration creates the booking_audit_logs table which stores
     * a complete audit trail of all changes to bookings, including
     * field-level changes, who made them, and why, for compliance and debugging.
     */
    public function up(): void
    {
        if (Schema::hasTable('booking_audit_logs')) {
            return;
        }
        
        Schema::create('booking_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')
                ->constrained('bookings')
                ->cascadeOnDelete()
                ->comment('Booking this audit log belongs to');
            
            // Change details
            $table->string('action', 50)->comment('Action type: created, updated, price_changed, status_changed, etc.');
            $table->string('field_name', 100)->nullable()->comment('Field that changed (NULL for create/delete)');
            $table->text('old_value')->nullable()->comment('Previous value (NULL for create)');
            $table->text('new_value')->nullable()->comment('New value (NULL for delete)');
            
            // Who made the change
            $table->foreignId('changed_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete()
                ->comment('User who made the change (NULL for system)');
            
            // Context
            $table->text('reason')->nullable()->comment('Reason for change');
            $table->string('ip_address', 45)->nullable()->comment('IP address of requester');
            $table->text('user_agent')->nullable()->comment('User agent of requester');
            
            // Metadata (JSON for flexibility)
            $table->json('metadata')->nullable()->comment('Additional context (request data, etc.)');
            
            $table->timestamp('created_at')->comment('When change occurred');
            
            // Indexes for performance
            $table->index('booking_id', 'idx_booking_audit_logs_booking_id');
            $table->index('changed_by_user_id', 'idx_booking_audit_logs_user_id');
            $table->index('action', 'idx_booking_audit_logs_action');
            $table->index('field_name', 'idx_booking_audit_logs_field');
            $table->index('created_at', 'idx_booking_audit_logs_created');
            $table->index(['booking_id', 'created_at'], 'idx_booking_audit_logs_booking_created');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_audit_logs');
    }
};
