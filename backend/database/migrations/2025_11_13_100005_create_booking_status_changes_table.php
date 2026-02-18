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
     * Purpose: Creates the booking_status_changes audit table for Phase 1 booking system
     * Location: backend/database/migrations/
     * 
     * This migration creates the booking_status_changes table which tracks
     * all status changes for bookings (audit trail).
     */
    public function up(): void
    {
        // Idempotent check: skip if table already exists
        if (Schema::hasTable('booking_status_changes')) {
            return;
        }
        
        // Note: This migration depends on 'bookings' and 'users' tables
        // If those tables don't exist, the foreign key constraints will fail
        // which is the correct behavior - migrations should run in order
        // RefreshDatabase trait ensures migrations run in timestamp order
        
        Schema::create('booking_status_changes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->enum('old_status', ['draft', 'pending', 'confirmed', 'cancelled', 'completed'])->nullable();
            $table->enum('new_status', ['draft', 'pending', 'confirmed', 'cancelled', 'completed']);
            $table->enum('old_payment_status', ['pending', 'partial', 'paid', 'refunded', 'failed'])->nullable();
            $table->enum('new_payment_status', ['pending', 'partial', 'paid', 'refunded', 'failed'])->nullable();
            $table->text('reason')->nullable()->comment('Reason for status change');
            $table->foreignId('changed_by_user_id')->nullable()->constrained('users')->nullOnDelete()->comment('Admin/user who made the change');
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->json('metadata')->nullable()->comment('Additional change data');
            $table->timestamps();
            
            // Indexes for performance
            $table->index('booking_id', 'idx_booking_status_changes_booking_id');
            $table->index('changed_by_user_id', 'idx_booking_status_changes_user_id');
            $table->index('created_at', 'idx_booking_status_changes_created_at');
            $table->index(['booking_id', 'created_at'], 'idx_booking_status_changes_booking_created');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_status_changes');
    }
};


