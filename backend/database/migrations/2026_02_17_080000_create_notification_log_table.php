<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_logs', function (Blueprint $table) {
            $table->id();
            $table->string('intent_type', 64)->index();
            $table->string('channel', 32)->index();
            $table->string('entity_type', 64)->index();
            $table->string('entity_id', 64)->index();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->string('recipient_identifier', 255)->nullable();
            $table->string('status', 32)->default('sent')->index();
            $table->text('error_message')->nullable();
            $table->timestamp('sent_at');
            $table->timestamps();
            $table->index(['intent_type', 'entity_type', 'entity_id', 'channel', 'recipient_identifier'], 'notif_log_dedupe_idx');
            $table->index(['user_id', 'channel', 'sent_at'], 'notif_log_rate_limit_idx');
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_logs');
    }
};
