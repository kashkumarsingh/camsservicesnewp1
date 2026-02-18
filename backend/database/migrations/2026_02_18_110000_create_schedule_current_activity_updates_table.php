<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schedule_current_activity_updates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_schedule_id')->constrained('booking_schedules')->cascadeOnDelete();
            $table->string('activity_name');
            $table->string('location')->nullable();
            $table->timestamps();
        });
        Schema::table('schedule_current_activity_updates', function (Blueprint $table) {
            $table->index('booking_schedule_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedule_current_activity_updates');
    }
};
