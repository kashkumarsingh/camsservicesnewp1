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
        Schema::create('faqs', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('content');
            $table->string('category')->nullable();
            $table->unsignedInteger('views')->default(0);
            $table->boolean('published')->default(true);
            $table->integer('order')->default(0)->comment('For manual ordering in CMS');
            $table->timestamps();
            $table->softDeletes();

            // Indexes for performance
            $table->index('slug', 'idx_faqs_slug');
            $table->index('category', 'idx_faqs_category');
            $table->index('published', 'idx_faqs_published');
            $table->index('order', 'idx_faqs_order');
            $table->index('views', 'idx_faqs_views');
            
            // Composite indexes for common queries
            $table->index(['category', 'published'], 'idx_faqs_category_published');
            $table->index(['published', 'deleted_at'], 'idx_faqs_published_not_deleted');
            $table->index(['category', 'published', 'order'], 'idx_faqs_category_published_order');
            
            // Index for soft-deleted queries
            $table->index('deleted_at', 'idx_faqs_deleted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('faqs');
    }
};
