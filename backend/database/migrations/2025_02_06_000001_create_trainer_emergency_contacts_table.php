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
        Schema::create('trainer_emergency_contacts', function (Blueprint $table) {
            $table->id();
            // Use unsignedBigInteger here to avoid FK ordering issues during fresh migrations.
            $table->unsignedBigInteger('trainer_id');
            $table->string('name');
            $table->string('relationship')->nullable();
            $table->string('phone');
            $table->string('email')->nullable();
            $table->timestamps();

            $table->index(['trainer_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trainer_emergency_contacts');
    }
};

