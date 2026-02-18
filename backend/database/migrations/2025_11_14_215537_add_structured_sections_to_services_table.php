<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Adds JSON fields to store structured data for service page sections.
     * 
     * **Normalization Decision (per .cursorrules):**
     * These fields use JSON because:
     * 1. **Non-queryable metadata**: Content is service-specific and not queried independently
     * 2. **Flexible, unbounded structures**: CTAs and section titles can vary per service
     * 3. **Not reusable entities**: Content is specific to each service only
     * 4. **No relationships needed**: Data doesn't need foreign keys or relationships
     * 
     * **JSON Structure:**
     * - hero: {
     *     primary_cta: { text: string, href: string },
     *     secondary_cta: { text: string, href: string }
     *   }
     * - content_section: {
     *     title: string (e.g., "Our Approach to {Service Title}")
     *   }
     * - cta_section: {
     *     title: string,
     *     subtitle: string,
     *     primary_cta: { text: string, href: string },
     *     secondary_cta: { text: string, href: string }
     *   }
     * 
     * **Future Consideration:**
     * If these need to be queried or reused across services, normalize into separate tables.
     */
    public function up(): void
    {
        // Check if table exists before modifying
        if (!Schema::hasTable('services')) {
            return;
        }
        
        // Check if columns already exist (idempotent)
        if (Schema::hasColumn('services', 'hero')) {
            return;
        }
        
        Schema::table('services', function (Blueprint $table) {
            $table->json('hero')
                ->nullable()
                ->after('body')
                ->comment('Hero section CTAs. JSON structure: {primary_cta: {text, href}, secondary_cta: {text, href}}');
            
            $table->json('content_section')
                ->nullable()
                ->after('hero')
                ->comment('Content section metadata. JSON structure: {title: string}');
            
            $table->json('cta_section')
                ->nullable()
                ->after('content_section')
                ->comment('CTA section content. JSON structure: {title, subtitle, primary_cta: {text, href}, secondary_cta: {text, href}}');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn(['hero', 'content_section', 'cta_section']);
        });
    }
};
