<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Clean Architecture Layer: Infrastructure (Data Persistence)
     * Purpose: Create site_settings table to store Header and Footer configuration
     */
    public function up(): void
    {
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            
            // Contact Information
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('address')->nullable();
            $table->text('full_address')->nullable();
            $table->string('whatsapp_url')->nullable();
            $table->text('map_embed_url')->nullable();
            
            // Social Media Links
            $table->string('facebook_url')->nullable();
            $table->string('twitter_url')->nullable();
            $table->string('instagram_url')->nullable();
            $table->string('linkedin_url')->nullable();
            
            // Company Information
            $table->string('company_name')->default('CAMS Services Ltd.');
            $table->text('company_description')->nullable();
            $table->string('registration_number')->nullable();
            
            // Trust Indicators
            $table->integer('families_count')->default(500);
            $table->integer('years_experience')->default(10);
            $table->decimal('rating', 3, 1)->default(4.9);
            
            // Certifications
            $table->boolean('ofsted_registered')->default(true);
            $table->json('certifications')->nullable(); // Array of certification objects
            
            // Navigation Links (Header)
            $table->json('nav_links')->nullable(); // Array of {href, label} objects
            
            // Footer Quick Links
            $table->json('quick_links')->nullable(); // Array of {href, label} objects
            
            // Logo
            $table->string('logo_path')->default('/logos/cams-services-logo.webp');
            
            // Copyright
            $table->string('copyright_text')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('site_settings');
    }
};
