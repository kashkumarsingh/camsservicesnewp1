<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Trainer absence requests: submitted by trainer, require admin approval.
     * Once approved, dates show as absence (red + scribble) on trainer calendar.
     */
    public function up(): void
    {
        Schema::create('trainer_absence_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trainer_id')->constrained('trainers')->cascadeOnDelete();
            $table->date('date_from');
            $table->date('date_to');
            $table->string('status', 20)->default('pending'); // pending, approved, rejected
            $table->text('reason')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['trainer_id', 'status']);
            $table->index(['date_from', 'date_to']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trainer_absence_requests');
    }
};
