<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Add Default Images to Activities
 * 
 * Purpose: Set default activity image for activities missing image_url
 * Location: backend/database/migrations/2026_01_08_000001_add_default_images_to_activities.php
 * 
 * Fixes: Activities without images cause frontend validation errors
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update activities with null or empty image_url
        DB::table('activities')
            ->whereNull('image_url')
            ->orWhere('image_url', '')
            ->update([
                'image_url' => '/images/activities/default-activity.webp'
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Don't revert - default images are acceptable
    }
};
