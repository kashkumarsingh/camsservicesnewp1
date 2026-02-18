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
     * Purpose: Creates the payments table with polymorphic relationship
     * Location: backend/database/migrations/2025_12_03_100000_create_payments_table.php
     * 
     * This migration creates the payments table which:
     * - Uses polymorphic relationship (payable_type, payable_id)
     * - Can be used for bookings, subscriptions, or other entities
     * - Is independent of Booking domain
     * - Maintains separation of concerns
     */
    public function up(): void
    {
        // Idempotent check: skip if table already exists
        if (Schema::hasTable('payments')) {
            return;
        }
        
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            
            // Polymorphic relationship (allows payments for any entity)
            $table->string('payable_type')->nullable()->comment('e.g., App\Models\Booking');
            $table->unsignedBigInteger('payable_id')->nullable()->comment('ID of the payable entity');
            
            // Payment details
            $table->decimal('amount', 10, 2)->comment('Payment amount (positive for payments, negative for refunds)');
            $table->string('currency', 3)->default('GBP');
            $table->string('payment_method', 50)->default('other')->comment('stripe, paypal, bank_transfer, cash, other');
            $table->string('payment_provider', 100)->nullable()->comment('e.g., Stripe, PayPal');
            $table->string('transaction_id', 255)->nullable()->unique()->comment('External transaction ID (e.g., Stripe payment intent ID)');
            
            // Payment status
            $table->string('status', 50)->default('pending')->comment('pending, processing, completed, failed, cancelled, refunded');
            
            // Retry logic
            $table->unsignedTinyInteger('retry_count')->default(0)->comment('Number of retry attempts');
            $table->timestamp('last_retry_at')->nullable()->comment('Last retry timestamp');
            
            // Failure tracking
            $table->text('failure_reason')->nullable()->comment('Why payment failed');
            $table->timestamp('failed_at')->nullable();
            
            // Processing timestamps
            $table->timestamp('processed_at')->nullable()->comment('When payment was successfully processed');
            $table->timestamp('refunded_at')->nullable()->comment('When payment was refunded');
            
            // Additional data
            $table->json('metadata')->nullable()->comment('Additional payment data (e.g., Stripe metadata)');
            
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['payable_type', 'payable_id'], 'idx_payments_payable');
            $table->index('transaction_id', 'idx_payments_transaction_id');
            $table->index('status', 'idx_payments_status');
            $table->index(['payable_type', 'payable_id', 'status'], 'idx_payments_payable_status');
            $table->index('created_at', 'idx_payments_created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};

