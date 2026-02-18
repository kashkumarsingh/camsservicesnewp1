<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adds optional session location/venue for display in parent dashboard (e.g. "Next up" strip).
     */
    public function up(): void
    {
        if (! Schema::hasTable('booking_schedules')) {
            return;
        }

        Schema::table('booking_schedules', function (Blueprint $table) {
            if (! Schema::hasColumn('booking_schedules', 'location')) {
                $table->string('location', 255)->nullable()->after('itinerary_notes')
                    ->comment('Session location or venue (e.g. address or place name)');
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
            if (Schema::hasColumn('booking_schedules', 'location')) {
                $table->dropColumn('location');
            }
        });
    }
};
