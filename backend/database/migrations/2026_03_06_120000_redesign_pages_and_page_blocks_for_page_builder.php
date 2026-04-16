<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Complete redesign of pages and page_blocks for the universal page builder.
 * Drops existing tables and recreates with new schema.
 * Run only on fresh install or when you are ready to lose existing page data.
 *
 * Copy to backend/database/migrations/ then: php artisan migrate
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('page_blocks');
        Schema::dropIfExists('pages');

        Schema::create('pages', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('status', 20)->default('draft'); // draft | published
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->string('og_image')->nullable();
            $table->boolean('is_system')->default(false);
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });

        Schema::create('page_blocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('page_id')->constrained('pages')->cascadeOnDelete();
            $table->string('type', 80);
            $table->unsignedInteger('sort_order')->default(0);
            $table->json('settings')->nullable();
            $table->boolean('is_visible')->default(true);
            $table->json('meta')->nullable(); // visibleFrom, visibleUntil, hideOnMobile
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('page_blocks');
        Schema::dropIfExists('pages');
    }
};
