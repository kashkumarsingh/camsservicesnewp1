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
        Schema::create('blog_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')
                ->nullable()
                ->constrained('blog_categories')
                ->nullOnDelete();
            $table->string('title', 200);
            $table->string('slug', 220)->unique();
            $table->string('hero_image')->nullable();
            $table->string('excerpt', 500);
            $table->longText('content');
            $table->string('author_name', 150);
            $table->string('author_role', 150)->nullable();
            $table->string('author_avatar_url')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_published')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamp('scheduled_publish_at')->nullable();
            $table->unsignedInteger('reading_time')->default(0);
            $table->unsignedBigInteger('views')->default(0);
            $table->json('seo')->nullable();
            $table->json('hero_metadata')->nullable();
            $table->json('structured_content')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['is_published', 'published_at']);
            $table->index('is_featured');
            $table->index('category_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blog_posts');
    }
};

