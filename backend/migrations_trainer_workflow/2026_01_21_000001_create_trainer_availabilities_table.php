<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Trainer availability (weekly or specific date) for admin schedule and auto-assign.
     * Run: cp migrations_trainer_workflow/2026_01_21_000001_create_trainer_availabilities_table.php database/migrations/
     * then: php artisan migrate
     */
    public function up(): void
    {
        Schema::create('trainer_availabilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trainer_id')->constrained('trainers')->cascadeOnDelete();
            $table->unsignedTinyInteger('day_of_week')->nullable()->comment('0=Sunday, 6=Saturday; null when specific_date set');
            $table->string('start_time', 5)->nullable();
            $table->string('end_time', 5)->nullable();
            $table->date('specific_date')->nullable();
            $table->boolean('is_available')->default(true);
            $table->string('reason')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trainer_availabilities');
    }
};
