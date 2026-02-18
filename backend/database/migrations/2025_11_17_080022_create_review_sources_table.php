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
        Schema::create('review_sources', function (Blueprint $table) {
            $table->id();
            $table->enum('provider', ['google', 'trustpilot', 'other'])
                ->default('google')
                ->comment('Identifies the remote review provider');
            $table->string('display_name', 150)
                ->comment('Human readable label shown in admin and API responses');
            $table->string('location_id', 191)
                ->nullable()
                ->comment('Remote location / business identifier (e.g., Google Place ID, Trustpilot Business Unit ID)');
            $table->text('api_key')
                ->nullable()
                ->comment('Encrypted API key for the provider (stored encrypted via application logic)');
            $table->text('api_secret')
                ->nullable()
                ->comment('Encrypted API secret / client secret (if required by provider)');
            $table->text('webhook_secret')
                ->nullable()
                ->comment('Optional secret used to validate incoming webhooks from providers');
            $table->unsignedSmallInteger('sync_frequency_minutes')
                ->default(360)
                ->comment('Desired sync interval in minutes (default 6 hours)');
            $table->timestamp('last_synced_at')
                ->nullable()
                ->comment('Timestamp of the most recent successful sync');
            $table->timestamp('last_sync_attempt_at')
                ->nullable()
                ->comment('Timestamp of the last attempted sync (successful or failed)');
            $table->unsignedInteger('last_sync_review_count')
                ->default(0)
                ->comment('How many reviews were ingested during the last successful sync');
            $table->boolean('is_active')
                ->default(true)
                ->comment('When false, sync jobs skip this source');
            $table->json('settings')
                ->nullable()
                ->comment('Provider-specific settings (non-queryable metadata)');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['provider', 'location_id'], 'uq_review_sources_provider_location');
            $table->index('is_active', 'idx_review_sources_active');
            $table->index('last_synced_at', 'idx_review_sources_last_synced');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('review_sources');
    }
};
