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
     * Purpose: Creates the bookings table for Phase 1 booking system
     * Location: backend/database/migrations/
     * 
     * This migration creates the core bookings table which stores
     * booking-level information including guest and logged-in user bookings.
     */
    public function up(): void
    {
        // Idempotent check: skip if table already exists
        if (Schema::hasTable('bookings')) {
            return;
        }
        
        // Note: This migration depends on 'users' and 'packages' tables
        // If those tables don't exist, the foreign key constraints will fail
        // which is the correct behavior - migrations should run in order
        // RefreshDatabase trait ensures migrations run in timestamp order
        
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 50)->unique()->comment('Unique booking reference e.g., CAMS-IG95BT-GEN-1234');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete()->comment('NULL = guest booking, NOT NULL = logged-in user');
            $table->boolean('is_guest_booking')->default(true)->comment('Track guest vs user bookings');
            $table->string('guest_email', 255)->nullable()->comment('For guest bookings (to link later)');
            $table->string('guest_phone', 32)->nullable()->comment('For guest bookings');
            $table->foreignId('package_id')->constrained('packages')->restrictOnDelete();
            $table->enum('status', ['draft', 'pending', 'confirmed', 'cancelled', 'completed'])->default('draft')->comment('Booking status');
            $table->enum('payment_status', ['pending', 'partial', 'paid', 'refunded', 'failed'])->default('pending')->comment('Payment status');
            $table->string('parent_first_name', 100);
            $table->string('parent_last_name', 100);
            $table->string('parent_email', 255);
            $table->string('parent_phone', 32);
            $table->text('parent_address')->nullable();
            $table->string('parent_postcode', 20)->nullable();
            $table->string('parent_county', 100)->nullable();
            $table->string('emergency_contact', 255)->nullable();
            $table->decimal('total_hours', 8, 2)->comment('Total hours in package');
            $table->decimal('booked_hours', 8, 2)->default(0)->comment('Hours actually booked in sessions');
            $table->decimal('used_hours', 8, 2)->default(0)->comment('Hours actually used (completed sessions)');
            $table->decimal('remaining_hours', 8, 2)->default(0)->comment('Calculated: total_hours - used_hours');
            $table->decimal('total_price', 10, 2)->comment('Total booking price');
            $table->decimal('paid_amount', 10, 2)->default(0)->comment('Amount paid so far');
            $table->decimal('discount_amount', 10, 2)->default(0)->comment('Admin-applied discount');
            $table->text('discount_reason')->nullable()->comment('Why discount was applied');
            $table->enum('payment_plan', ['full', 'installment'])->nullable()->comment('Payment structure');
            $table->unsignedTinyInteger('installment_count')->nullable()->comment('Number of installments');
            $table->date('next_payment_due_at')->nullable()->comment('When next payment is due');
            $table->date('start_date')->nullable()->comment('Optional booking start date');
            $table->date('package_expires_at')->nullable()->comment('When package expires');
            $table->date('hours_expires_at')->nullable()->comment('When unused hours expire');
            $table->boolean('allow_hour_rollover')->default(false)->comment('Can unused hours roll to next package?');
            $table->boolean('created_by_admin')->default(false)->comment('Was booking created by admin?');
            $table->text('admin_notes')->nullable()->comment('Admin-only notes');
            $table->text('notes')->nullable()->comment('Internal/admin notes');
            $table->text('cancellation_reason')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->string('ip_address', 45)->nullable()->comment('For fraud prevention');
            $table->text('user_agent')->nullable()->comment('For analytics');
            $table->json('calculated_fields')->nullable()->comment('Cached computed values (metrics, etc.)');
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for performance
            $table->index('reference', 'idx_bookings_reference');
            $table->index('user_id', 'idx_bookings_user_id');
            $table->index(['user_id', 'is_guest_booking'], 'idx_bookings_user_guest');
            $table->index('guest_email', 'idx_bookings_guest_email');
            $table->index('package_id', 'idx_bookings_package_id');
            $table->index('status', 'idx_bookings_status');
            $table->index('payment_status', 'idx_bookings_payment_status');
            $table->index('parent_email', 'idx_bookings_parent_email');
            $table->index('parent_phone', 'idx_bookings_parent_phone');
            $table->index('parent_postcode', 'idx_bookings_parent_postcode');
            $table->index('hours_expires_at', 'idx_bookings_hours_expires');
            $table->index('next_payment_due_at', 'idx_bookings_next_payment');
            $table->index('created_at', 'idx_bookings_created_at');
            $table->index('deleted_at', 'idx_bookings_deleted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};


