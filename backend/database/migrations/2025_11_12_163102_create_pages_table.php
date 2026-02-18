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
        Schema::create('pages', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->enum('type', [
                'about',
                'privacy-policy',
                'terms-of-service',
                'cancellation-policy',
                'cookie-policy',
                'payment-refund-policy',
                'safeguarding-policy',
                'other'
            ])->default('other');
            $table->longText('content');
            $table->text('summary')->nullable();
            $table->dateTime('last_updated');
            $table->date('effective_date');
            $table->string('version', 20)->default('1.0.0');
            $table->unsignedInteger('views')->default(0);
            $table->boolean('published')->default(true);
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for performance
            $table->index('slug', 'idx_pages_slug');
            $table->index('type', 'idx_pages_type');
            $table->index('published', 'idx_pages_published');
            $table->index('views', 'idx_pages_views');
            
            // Composite indexes for common queries
            $table->index(['type', 'published'], 'idx_pages_type_published');
            $table->index(['published', 'deleted_at'], 'idx_pages_published_not_deleted');
            $table->index(['slug', 'published'], 'idx_pages_slug_published');
            
            // Index for soft-deleted queries
            $table->index('deleted_at', 'idx_pages_deleted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pages');
    }
};
