<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Clean Architecture: Infrastructure/Data Layer
     * Purpose: Drops the legacy booking_payments table after migration
     * Location: backend/database/migrations/2025_12_03_100002_drop_booking_payments_table.php
     * 
     * WARNING: This migration should only be run AFTER:
     * 1. Data migration is complete
     * 2. All code has been updated to use Payment domain
     * 3. All tests pass
     * 4. Production verification is complete
     */
    public function up(): void
    {
        // Only drop if table exists and we're sure migration is complete
        // Add a safety check: only drop if payments table has data
        if (Schema::hasTable('booking_payments')) {
            $paymentsCount = Schema::hasTable('payments') 
                ? \Illuminate\Support\Facades\DB::table('payments')->where('payable_type', 'App\Models\Booking')->count()
                : 0;
            
            $bookingPaymentsCount = \Illuminate\Support\Facades\DB::table('booking_payments')->count();
            
            // Only drop if payments table has at least as many records
            // This is a safety check to prevent accidental data loss
            if ($paymentsCount >= $bookingPaymentsCount || $bookingPaymentsCount === 0) {
                Schema::dropIfExists('booking_payments');
            } else {
                // Log warning but don't fail migration
                \Log::warning('Cannot drop booking_payments table: payment count mismatch', [
                    'payments_count' => $paymentsCount,
                    'booking_payments_count' => $bookingPaymentsCount,
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     * 
     * Note: This does NOT recreate booking_payments table.
     * If rollback is needed, restore from backup.
     */
    public function down(): void
    {
        // Cannot automatically recreate booking_payments table
        // Data structure may have changed
        // Manual restoration from backup required
    }
};

