<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * The 2025_01_22_add_booked_by_tracking migration runs before the
     * create_booking_schedules migration (timestamp order), so the table
     * did not exist when that migration ran and the columns were never added.
     * This migration adds booked_by and booked_by_user_id when they are missing.
     */
    public function up(): void
    {
        if (! Schema::hasTable('booking_schedules')) {
            return;
        }

        Schema::table('booking_schedules', function (Blueprint $table) {
            if (! Schema::hasColumn('booking_schedules', 'booked_by')) {
                $table->string('booked_by', 20)->default('parent')
                    ->after('trainer_id')
                    ->comment('Who booked this session: parent or trainer');
            }
            if (! Schema::hasColumn('booking_schedules', 'booked_by_user_id')) {
                $table->foreignId('booked_by_user_id')->nullable()
                    ->after('booked_by')
                    ->constrained('users')->nullOnDelete()
                    ->comment('ID of the user (parent or trainer) who booked this session');
            }
        });

        // Optional CHECK for allowed values (MySQL 8+; PostgreSQL supported)
        $driver = Schema::getConnection()->getDriverName();
        if (Schema::hasColumn('booking_schedules', 'booked_by')) {
            try {
                if ($driver === 'mysql') {
                    DB::statement("ALTER TABLE booking_schedules ADD CONSTRAINT check_booked_by CHECK (booked_by IN ('parent', 'trainer'))");
                }
                if ($driver === 'pgsql') {
                    DB::statement("ALTER TABLE booking_schedules ADD CONSTRAINT check_booked_by CHECK (booked_by IN ('parent', 'trainer'))");
                }
            } catch (\Exception $e) {
                // Constraint might already exist, ignore
            }
        }

        // Index for querying by who booked
        try {
            Schema::table('booking_schedules', function (Blueprint $table) {
                $table->index(['booked_by', 'booked_by_user_id'], 'idx_booking_schedules_booked_by');
            });
        } catch (\Exception $e) {
            // Index might already exist, ignore
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('booking_schedules')) {
            return;
        }

        try {
            DB::statement('ALTER TABLE booking_schedules DROP CONSTRAINT IF EXISTS check_booked_by');
        } catch (\Exception $e) {
            // Ignore
        }

        Schema::table('booking_schedules', function (Blueprint $table) {
            if (Schema::hasColumn('booking_schedules', 'booked_by_user_id')) {
                $table->dropForeign(['booked_by_user_id']);
            }
            try {
                $table->dropIndex('idx_booking_schedules_booked_by');
            } catch (\Exception $e) {
                // Index might not exist
            }
            $cols = array_filter(
                ['booked_by', 'booked_by_user_id'],
                fn (string $c) => Schema::hasColumn('booking_schedules', $c)
            );
            if ($cols !== []) {
                $table->dropColumn($cols);
            }
        });
    }
};
