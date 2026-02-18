<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Clean Architecture: Infrastructure/Data Layer
     * Purpose: Creates many-to-many relationship between packages and testimonials
     * 
     * This allows:
     * - Packages to have package-specific testimonials
     * - Testimonials to be associated with multiple packages
     * - Ordering of testimonials per package
     */
    public function up(): void
    {
        // Idempotent check: skip if table already exists
        if (Schema::hasTable('package_testimonial')) {
            return;
        }
        Schema::create('package_testimonial', function (Blueprint $table) {
            $table->id();
            $table->foreignId('package_id')
                ->constrained('packages')
                ->onDelete('cascade')
                ->onUpdate('cascade');
            $table->foreignId('testimonial_id')
                ->constrained('testimonials')
                ->onDelete('cascade')
                ->onUpdate('cascade');
            $table->unsignedTinyInteger('order')
                ->default(0)
                ->comment('Order of testimonial within package');
            $table->timestamps();
            
            // Unique constraint to prevent duplicate associations
            $table->unique(['package_id', 'testimonial_id'], 'unique_package_testimonial');
            
            // Indexes for performance
            $table->index('package_id', 'idx_package_testimonial_package');
            $table->index('testimonial_id', 'idx_package_testimonial_testimonial');
            $table->index(['package_id', 'order'], 'idx_package_testimonial_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('package_testimonial');
    }
};

