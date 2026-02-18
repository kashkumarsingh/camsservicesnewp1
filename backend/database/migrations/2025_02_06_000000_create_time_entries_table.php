<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('time_entries', function (Blueprint $table) {
            $table->id();
            // Use unsignedBigInteger columns here to avoid hard FK ordering
            // issues during fresh migrations. Trainer and booking schedule
            // records are still linked at the application level.
            $table->unsignedBigInteger('trainer_id');
            $table->unsignedBigInteger('booking_schedule_id');
            $table->enum('type', ['clock_in', 'clock_out']);
            $table->timestamp('recorded_at');
            $table->string('source', 50)->default('trainer_app'); // e.g. trainer_app, admin_panel, import
            $table->string('notes', 255)->nullable();
            $table->timestamps();

            $table->index(['trainer_id', 'recorded_at']);
            $table->index(['booking_schedule_id', 'recorded_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('time_entries');
    }
};

