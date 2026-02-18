<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adds trainer-updatable "current activity" so admin/parent can see
     * "Currently doing [e.g. Horse riding] at [location]" in Latest activity.
     */
    public function up(): void
    {
        if (! Schema::hasTable('booking_schedules')) {
            return;
        }

        Schema::table('booking_schedules', function (Blueprint $table) {
            if (! Schema::hasColumn('booking_schedules', 'current_activity_id')) {
                $table->foreignId('current_activity_id')
                    ->nullable()
                    ->after('location')
                    ->constrained('activities')
                    ->nullOnDelete()
                    ->comment('Trainer-set "doing now" activity for live status (e.g. Latest activity)');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('booking_schedules')) {
            return;
        }

        Schema::table('booking_schedules', function (Blueprint $table) {
            if (Schema::hasColumn('booking_schedules', 'current_activity_id')) {
                $table->dropForeign(['current_activity_id']);
            }
        });
    }
};
