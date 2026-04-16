<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Copy this file to database/migrations/ and run: php artisan migrate
 * Creates payment_gateway_settings table for admin-configured Stripe, PayPal, etc.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_gateway_settings', function (Blueprint $table) {
            $table->id();
            $table->string('gateway', 64)->unique()->comment('e.g. stripe, paypal');
            $table->string('display_name', 128);
            $table->text('secret_key')->nullable();
            $table->string('public_key', 512)->nullable();
            $table->text('webhook_secret')->nullable();
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);
            $table->json('settings')->nullable()->comment('Gateway-specific extra config');
            $table->timestamps();
        });

        Schema::table('payment_gateway_settings', function (Blueprint $table) {
            $table->index('is_default');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_gateway_settings');
    }
};
