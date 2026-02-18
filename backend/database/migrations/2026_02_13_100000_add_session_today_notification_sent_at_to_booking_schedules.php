<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Add session-today notification tracking to booking_schedules.
 *
 * Purpose: So we send the "session today" signal (in-app + email) once per schedule on the day.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('booking_schedules')) {
            return;
        }

        Schema::table('booking_schedules', function (Blueprint $table) {
            if (! Schema::hasColumn('booking_schedules', 'session_today_notification_sent_at')) {
                $table->timestamp('session_today_notification_sent_at')->nullable()->after('reminder_sent_at');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('booking_schedules')) {
            return;
        }

        Schema::table('booking_schedules', function (Blueprint $table) {
            if (Schema::hasColumn('booking_schedules', 'session_today_notification_sent_at')) {
                $table->dropColumn('session_today_notification_sent_at');
            }
        });
    }
};
