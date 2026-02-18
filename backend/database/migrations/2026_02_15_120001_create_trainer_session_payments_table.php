<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trainer_session_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_schedule_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('trainer_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('GBP');
            $table->string('rate_type_snapshot')->nullable();
            $table->decimal('rate_amount_snapshot', 12, 2)->nullable();
            $table->decimal('duration_hours_used', 8, 2)->nullable();
            $table->string('status')->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->foreignId('paid_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trainer_session_payments');
    }
};
