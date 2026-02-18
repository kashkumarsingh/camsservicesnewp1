<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Clean Architecture Layer: Infrastructure (Data Persistence)
     * Purpose: Create the services table to store CMS-managed service catalog entries
     */
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('title', 160)->index()->comment('Display title for the service');
            $table->string('slug', 160)->unique()->comment('URL-friendly identifier');
            $table->string('summary', 255)->nullable()->comment('Short summary for list views');
            $table->text('description')->comment('Primary description used on service detail pages');
            $table->text('body')->nullable()->comment('Rich content (Markdown) for detailed sections');
            $table->string('icon', 60)->nullable()->comment('Optional icon identifier used in UI');
            $table->string('category', 80)->nullable()->comment('Optional grouping or taxonomy label');
            $table->unsignedInteger('views')->default(0)->comment('View counter for analytics');
            $table->boolean('published')->default(true)->comment('Publication flag for frontend visibility');
            $table->timestamp('publish_at')->nullable()->comment('Scheduled publish date/time');
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for performance
            $table->index('slug', 'idx_services_slug');
            $table->index('title', 'idx_services_title');
            $table->index('category', 'idx_services_category');
            $table->index('published', 'idx_services_published');
            $table->index('views', 'idx_services_views');
            
            // Composite indexes for common queries
            $table->index(['published', 'deleted_at'], 'idx_services_published_not_deleted');
            $table->index(['category', 'published'], 'idx_services_category_published');
            $table->index(['published', 'publish_at'], 'idx_services_publish_schedule');
            
            // Index for soft-deleted queries
            $table->index('deleted_at', 'idx_services_deleted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};


