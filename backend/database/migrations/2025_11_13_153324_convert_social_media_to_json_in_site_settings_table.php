<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Clean Architecture Layer: Infrastructure (Data Persistence)
     * Purpose: Convert individual social media columns to a JSON array for flexibility
     */
    public function up(): void
    {
        // Check if table exists before modifying
        if (!Schema::hasTable('site_settings')) {
            return;
        }
        
        // Check if column already exists (idempotent)
        if (Schema::hasColumn('site_settings', 'social_links')) {
            return;
        }
        
        // Add new JSON column
        Schema::table('site_settings', function (Blueprint $table) {
            $table->json('social_links')->nullable()->after('map_embed_url');
        });

        // Migrate existing data to JSON format
        DB::table('site_settings')->get()->each(function ($setting) {
            $socialLinks = [];
            
            if ($setting->facebook_url) {
                $socialLinks[] = [
                    'platform' => 'Facebook',
                    'url' => $setting->facebook_url,
                    'icon' => 'facebook',
                ];
            }
            
            if ($setting->twitter_url) {
                $socialLinks[] = [
                    'platform' => 'Twitter/X',
                    'url' => $setting->twitter_url,
                    'icon' => 'twitter',
                ];
            }
            
            if ($setting->instagram_url) {
                $socialLinks[] = [
                    'platform' => 'Instagram',
                    'url' => $setting->instagram_url,
                    'icon' => 'instagram',
                ];
            }
            
            if ($setting->linkedin_url) {
                $socialLinks[] = [
                    'platform' => 'LinkedIn',
                    'url' => $setting->linkedin_url,
                    'icon' => 'linkedin',
                ];
            }

            DB::table('site_settings')
                ->where('id', $setting->id)
                ->update(['social_links' => json_encode($socialLinks)]);
        });

        // Drop old columns
        Schema::table('site_settings', function (Blueprint $table) {
            $table->dropColumn([
                'facebook_url',
                'twitter_url',
                'instagram_url',
                'linkedin_url',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Add back individual columns
        Schema::table('site_settings', function (Blueprint $table) {
            $table->string('facebook_url')->nullable()->after('map_embed_url');
            $table->string('twitter_url')->nullable();
            $table->string('instagram_url')->nullable();
            $table->string('linkedin_url')->nullable();
        });

        // Migrate JSON data back to individual columns
        DB::table('site_settings')->get()->each(function ($setting) {
            $socialLinks = json_decode($setting->social_links ?? '[]', true);
            $update = [];

            foreach ($socialLinks as $link) {
                $platform = strtolower($link['platform'] ?? '');
                if (str_contains($platform, 'facebook')) {
                    $update['facebook_url'] = $link['url'];
                } elseif (str_contains($platform, 'twitter') || str_contains($platform, 'x')) {
                    $update['twitter_url'] = $link['url'];
                } elseif (str_contains($platform, 'instagram')) {
                    $update['instagram_url'] = $link['url'];
                } elseif (str_contains($platform, 'linkedin')) {
                    $update['linkedin_url'] = $link['url'];
                }
            }

            if (!empty($update)) {
                DB::table('site_settings')
                    ->where('id', $setting->id)
                    ->update($update);
            }
        });

        // Drop JSON column
        Schema::table('site_settings', function (Blueprint $table) {
            $table->dropColumn('social_links');
        });
    }
};
