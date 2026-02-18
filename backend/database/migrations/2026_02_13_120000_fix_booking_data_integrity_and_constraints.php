<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Fix booking data integrity and enforce NOT NULL constraints.
 *
 * Purpose: Phase 2 of booking list 500 fix – repair existing bad data and prevent
 * future null reference/status so the API and domain layer can rely on clean data.
 *
 * 1. Backfill null or empty reference with CAMS-LEGACY-LEG-{id} (valid BookingReference format).
 * 2. Backfill null status with 'draft' and null payment_status with 'pending'.
 * 3. Enforce NOT NULL on reference, status, payment_status (driver-specific ALTER).
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('bookings')) {
            return;
        }

        $driver = Schema::getConnection()->getDriverName();

        // 1. Fix null or empty reference (per-row; format CAMS-LEGACY-LEG-{id} matches BookingReference VO)
        $nullRefs = DB::table('bookings')
            ->where(function ($q) {
                $q->whereNull('reference')->orWhere('reference', '');
            })
            ->pluck('id');

        foreach ($nullRefs as $id) {
            DB::table('bookings')->where('id', $id)->update([
                'reference' => 'CAMS-LEGACY-LEG-' . str_pad((string) $id, 6, '0', STR_PAD_LEFT),
            ]);
        }

        // 2. Fix null status and payment_status (bulk)
        DB::table('bookings')->whereNull('status')->update(['status' => 'draft']);
        DB::table('bookings')->whereNull('payment_status')->update(['payment_status' => 'pending']);

        // 3. Enforce NOT NULL (skip if driver not supported; data is already fixed)
        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE bookings
                MODIFY COLUMN reference VARCHAR(50) NOT NULL,
                MODIFY COLUMN status ENUM('draft', 'pending', 'confirmed', 'cancelled', 'completed') NOT NULL DEFAULT 'draft',
                MODIFY COLUMN payment_status ENUM('pending', 'partial', 'paid', 'refunded', 'failed') NOT NULL DEFAULT 'pending'");
        }

        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE bookings ALTER COLUMN reference SET NOT NULL');
            DB::statement("ALTER TABLE bookings ALTER COLUMN status SET NOT NULL");
            DB::statement("ALTER TABLE bookings ALTER COLUMN payment_status SET NOT NULL");
        }
    }

    public function down(): void
    {
        // Reverting NOT NULL would require making columns nullable again; we do not
        // restore nulls in data. No-op so rollback is safe and data stays clean.
    }
};
