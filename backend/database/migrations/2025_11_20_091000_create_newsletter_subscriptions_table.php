<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Layer: Infrastructure (Persistence)
     * Purpose: Track newsletter subscriptions/unsubscriptions flowing from
     *          the contact form and other lead capture touchpoints.
     */
    public function up(): void
    {
        Schema::create('newsletter_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->string('email', 255)->unique();
            $table->string('name', 200)->nullable();
            $table->boolean('active')->default(true);
            $table->timestamp('subscribed_at');
            $table->timestamp('unsubscribed_at')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->string('source', 255)->nullable();
            $table->timestamps();

            $table->index('active', 'idx_newsletter_subscriptions_active');
            $table->index('subscribed_at', 'idx_newsletter_subscriptions_subscribed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('newsletter_subscriptions');
    }
};

