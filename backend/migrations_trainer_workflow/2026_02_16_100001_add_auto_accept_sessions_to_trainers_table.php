<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * When true, auto-assigned sessions are confirmed immediately (no trainer confirmation step).
     */
    public function up(): void
    {
        Schema::table('trainers', function (Blueprint $table) {
            $table->boolean('auto_accept_sessions')->default(false)->after('availability_preferences');
        });
    }

    public function down(): void
    {
        Schema::table('trainers', function (Blueprint $table) {
            $table->dropColumn('auto_accept_sessions');
        });
    }
};
