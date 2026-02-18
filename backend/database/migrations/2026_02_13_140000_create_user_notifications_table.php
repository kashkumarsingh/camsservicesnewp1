<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Centralised dashboard notifications for parents, trainers, and admin.
 * Used for in-app notification bell (e.g. "Trainer assigned to your session").
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type', 64)->comment('e.g. trainer_assigned, booking_confirmed');
            $table->string('title');
            $table->text('message');
            $table->string('link', 512)->nullable()->comment('Frontend path to open when clicked');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });

        Schema::table('user_notifications', function (Blueprint $table) {
            $table->index(['user_id', 'read_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_notifications');
    }
};
