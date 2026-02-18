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
     * Purpose: Creates the booking_payments table for Phase 1 booking system
     * Location: backend/database/migrations/
     * 
     * This migration creates the booking_payments table which tracks
     * payment transactions for bookings (supports partial payments, refunds).
     */
    public function up(): void
    {
        // Idempotent check: skip if table already exists
        if (Schema::hasTable('booking_payments')) {
            return;
        }
        
        // Note: This migration depends on 'bookings' table
        // If the table doesn't exist, the foreign key constraint will fail
        // which is the correct behavior - migrations should run in order
        // RefreshDatabase trait ensures migrations run in timestamp order
        
        Schema::create('booking_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->decimal('amount', 10, 2)->comment('Payment amount (positive for payments, negative for refunds)');
            $table->string('currency', 3)->default('GBP');
            $table->enum('payment_method', ['paypal', 'stripe', 'bank_transfer', 'cash', 'other'])->comment('Payment method');
            $table->string('payment_provider', 100)->nullable()->comment('e.g., PayPal, Stripe');
            $table->string('transaction_id', 255)->nullable()->comment('External transaction ID');
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'])->default('pending')->comment('Payment status');
            $table->unsignedTinyInteger('retry_count')->default(0)->comment('Number of retry attempts');
            $table->timestamp('last_retry_at')->nullable()->comment('Last retry timestamp');
            $table->text('failure_reason')->nullable()->comment('Why payment failed');
            $table->json('metadata')->nullable()->comment('Additional payment data');
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->timestamps();
            
            // Indexes for performance
            $table->index('booking_id', 'idx_booking_payments_booking_id');
            $table->index('transaction_id', 'idx_booking_payments_transaction_id');
            $table->index('status', 'idx_booking_payments_status');
            $table->index(['booking_id', 'status'], 'idx_booking_payments_booking_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_payments');
    }
};


