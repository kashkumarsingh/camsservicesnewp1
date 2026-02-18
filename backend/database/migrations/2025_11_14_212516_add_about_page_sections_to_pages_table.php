<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Adds JSON fields to store structured data for about page sections.
     * 
     * **Normalization Decision (per .cursorrules):**
     * These fields use JSON because:
     * 1. **Non-queryable metadata**: Content is page-specific and not queried independently
     * 2. **Flexible, unbounded structures**: Number of core values, service cards, and badges can vary
     * 3. **Not reusable entities**: Content is specific to the "about" page only
     * 4. **No relationships needed**: Data doesn't need foreign keys or relationships
     * 
     * **JSON Structure:**
     * - mission: {
     *     title: string,
     *     description: string,
     *     image: string (file path),
     *     service_cards: [{ label: string, icon: string }]
     *   }
     * - core_values: [
     *     { icon: string, title: string, description: string, gradient_from: string, gradient_to: string }
     *   ]
     * - safeguarding: {
     *     title: string,
     *     description: string,
     *     image: string (file path),
     *     badges: [{ label: string }]
     *   }
     * 
     * **Future Consideration:**
     * If these need to be queried or reused across pages, normalize into separate tables:
     * - page_core_values (with foreign key to pages)
     * - core_values (lookup table if values are reusable)
     */
    public function up(): void
    {
        // Check if table exists before modifying
        if (!Schema::hasTable('pages')) {
            return;
        }
        
        // Check if columns already exist (idempotent)
        if (Schema::hasColumn('pages', 'mission')) {
            return;
        }
        
        Schema::table('pages', function (Blueprint $table) {
            $table->json('mission')
                ->nullable()
                ->after('content')
                ->comment('Mission section data for about page. JSON structure: {title, description, image, service_cards: [{label, icon}]}');
            
            $table->json('core_values')
                ->nullable()
                ->after('mission')
                ->comment('Core values array for about page. JSON structure: [{icon, title, description, gradient_from, gradient_to}]');
            
            $table->json('safeguarding')
                ->nullable()
                ->after('core_values')
                ->comment('Safeguarding section data for about page. JSON structure: {title, description, image, badges: [{label}]}');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pages', function (Blueprint $table) {
            $table->dropColumn(['mission', 'core_values', 'safeguarding']);
        });
    }
};
