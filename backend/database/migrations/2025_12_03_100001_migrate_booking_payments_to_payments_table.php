<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Clean Architecture: Infrastructure/Data Layer
     * Purpose: Migrates data from booking_payments to payments table
     * Location: backend/database/migrations/2025_12_03_100001_migrate_booking_payments_to_payments_table.php
     * 
     * This migration:
     * - Copies all data from booking_payments to payments
     * - Sets payable_type to 'App\Models\Booking'
     * - Sets payable_id to booking_id
     * - Preserves all payment data
     */
    public function up(): void
    {
        // Only migrate if booking_payments table exists and payments table exists
        if (!Schema::hasTable('booking_payments') || !Schema::hasTable('payments')) {
            return;
        }

        // Check if migration already ran (idempotent)
        $existingCount = DB::table('payments')
            ->where('payable_type', 'App\Models\Booking')
            ->count();
        
        $sourceCount = DB::table('booking_payments')->count();
        
        if ($existingCount >= $sourceCount && $sourceCount > 0) {
            // Migration already completed
            return;
        }

        // Migrate data from booking_payments to payments
        DB::statement("
            INSERT INTO payments (
                id,
                payable_type,
                payable_id,
                amount,
                currency,
                payment_method,
                payment_provider,
                transaction_id,
                status,
                retry_count,
                last_retry_at,
                failure_reason,
                metadata,
                processed_at,
                failed_at,
                refunded_at,
                created_at,
                updated_at
            )
            SELECT 
                id,
                'App\Models\Booking' as payable_type,
                booking_id as payable_id,
                amount,
                currency,
                payment_method,
                payment_provider,
                transaction_id,
                status,
                retry_count,
                last_retry_at,
                failure_reason,
                metadata,
                processed_at,
                failed_at,
                refunded_at,
                created_at,
                updated_at
            FROM booking_payments
            WHERE NOT EXISTS (
                SELECT 1 FROM payments p 
                WHERE p.id = booking_payments.id 
                AND p.payable_type = 'App\Models\Booking'
                AND p.payable_id = booking_payments.booking_id
            )
        ");

        // Update sequence/auto-increment if using PostgreSQL
        if (DB::getDriverName() === 'pgsql') {
            // Get max ID, defaulting to 0 if table is empty
            $maxId = DB::table('payments')->max('id');
            
            // PostgreSQL sequences must be >= 1, so use COALESCE to handle NULL and ensure minimum of 1
            // If table is empty, set sequence to 1 (next insert will be id=1)
            // If table has data, set sequence to max(id) + 1 (next insert will be max+1)
            $sequenceValue = $maxId ? ($maxId + 1) : 1;
            
            DB::statement("SELECT setval('payments_id_seq', {$sequenceValue}, false)");
        }
    }

    /**
     * Reverse the migrations.
     * 
     * Note: This does NOT restore data to booking_payments.
     * The booking_payments table should be dropped separately after verification.
     */
    public function down(): void
    {
        // Remove migrated payments (only those from bookings)
        DB::table('payments')
            ->where('payable_type', 'App\Models\Booking')
            ->delete();
    }
};

