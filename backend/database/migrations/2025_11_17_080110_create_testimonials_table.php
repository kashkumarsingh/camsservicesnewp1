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
        Schema::create('testimonials', function (Blueprint $table) {
            $table->id();
            $table->uuid('public_id')
                ->unique()
                ->comment('Public UUID exposed to frontend clients');
            $table->string('slug', 191)
                ->unique()
                ->comment('SEO-friendly identifier used by frontend routes');
            $table->string('author_name', 150);
            $table->string('author_role', 150)->nullable();
            $table->string('author_avatar_url', 2048)->nullable();
            $table->text('quote');
            $table->unsignedTinyInteger('rating')
                ->nullable()
                ->comment('1-5 star rating (nullable for testimonials without ratings)');
            $table->enum('source_type', ['manual', 'google', 'trustpilot', 'other'])
                ->default('manual')
                ->comment('Origin of the testimonial - manual CMS, Google Review, Trustpilot, etc.');
            $table->foreignId('external_review_id')
                ->nullable()
                ->constrained('external_reviews')
                ->nullOnDelete()
                ->cascadeOnUpdate()
                ->comment('Back-reference to the external review when testimonial is promoted from remote source');
            $table->string('source_review_id', 191)
                ->nullable()
                ->comment('Remote review identifier (duplicated for quick lookup)');
            $table->string('source_url', 2048)
                ->nullable()
                ->comment('Public facing link to the review on Google / Trustpilot');
            $table->string('source_label', 120)
                ->nullable()
                ->comment('Short label displayed on UI badges (e.g., "Google Reviews")');
            $table->string('locale', 10)
                ->default('en-GB')
                ->comment('BCP 47 locale code for this testimonial');
            $table->boolean('is_featured')
                ->default(false)
                ->comment('Controls whether testimonial appears in hero/priority sections');
            $table->unsignedTinyInteger('display_order')
                ->default(0)
                ->comment('Lower numbers surface earlier in curated lists');
            $table->boolean('published')
                ->default(true)
                ->comment('Soft publish toggle for CMS visibility');
            $table->timestamp('published_at')->nullable();
            $table->timestamp('featured_at')->nullable();
            $table->json('badges')
                ->nullable()
                ->comment('Optional badge metadata (non-queryable array of label/icon entries)');
            $table->json('metadata')
                ->nullable()
                ->comment('Provider-specific metadata (non-queryable)');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['source_type', 'is_featured'], 'idx_testimonials_source_featured');
            $table->index(['is_featured', 'display_order'], 'idx_testimonials_featured_order');
            $table->index(['published', 'display_order'], 'idx_testimonials_published_order');
            $table->index('published_at', 'idx_testimonials_published_at');
            $table->index('locale', 'idx_testimonials_locale');
            $table->unique(['source_type', 'source_review_id'], 'uq_testimonials_source_review_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('testimonials');
    }
};
