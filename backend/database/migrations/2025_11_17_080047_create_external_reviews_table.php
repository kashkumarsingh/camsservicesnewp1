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
        Schema::create('external_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('review_source_id')
                ->constrained('review_sources')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->string('provider_review_id', 191)
                ->comment('Unique identifier from the remote provider (e.g., Google review ID)');
            $table->string('author_name', 150);
            $table->string('author_avatar_url', 2048)->nullable();
            $table->unsignedTinyInteger('rating')
                ->nullable()
                ->comment('1-5 star rating (nullable for text-only reviews)');
            $table->text('content')
                ->comment('Full review body as provided by the remote platform');
            $table->string('language', 10)
                ->default('en')
                ->comment('BCP 47 language tag for the review (e.g., en, en-GB)');
            $table->string('country_code', 5)
                ->nullable()
                ->comment('ISO 3166-1 alpha-2 country code when supplied by provider');
            $table->timestamp('published_at')
                ->nullable()
                ->comment('When the review was originally published remotely');
            $table->string('permalink', 2048)
                ->nullable()
                ->comment('Public URL to the review on the provider website');
            $table->boolean('is_visible')
                ->default(true)
                ->comment('Allows hiding individual reviews without deleting');
            $table->timestamp('synced_at')
                ->nullable()
                ->comment('Last time this record was refreshed from the provider');
            $table->json('metadata')
                ->nullable()
                ->comment('Non-queryable provider-specific payload (e.g., replies, tags)');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['review_source_id', 'provider_review_id'], 'uq_external_reviews_source_review');
            $table->index(['review_source_id', 'is_visible'], 'idx_external_reviews_source_visible');
            $table->index('published_at', 'idx_external_reviews_published_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('external_reviews');
    }
};
