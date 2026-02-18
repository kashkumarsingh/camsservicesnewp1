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
     * Purpose: Convert fixed trust indicator columns to flexible JSON array
     */
    public function up(): void
    {
        // Check if table exists before modifying
        if (!Schema::hasTable('site_settings')) {
            return;
        }
        
        // Check if column already exists (idempotent)
        if (Schema::hasColumn('site_settings', 'trust_indicators')) {
            return;
        }
        
        Schema::table('site_settings', function (Blueprint $table) {
            // Add new JSON column for trust indicators
            $table->json('trust_indicators')->nullable()->after('registration_number');
        });

        // Migrate existing data to JSON format
        DB::table('site_settings')->get()->each(function ($setting) {
            $trustIndicators = [];
            
            if ($setting->families_count) {
                $trustIndicators[] = [
                    'label' => 'Families',
                    'value' => (string) $setting->families_count,
                    'icon' => 'users',
                ];
            }
            
            if ($setting->years_experience) {
                $trustIndicators[] = [
                    'label' => 'Years',
                    'value' => (string) $setting->years_experience,
                    'icon' => 'clock',
                ];
            }
            
            if ($setting->rating) {
                $trustIndicators[] = [
                    'label' => 'Rating',
                    'value' => (string) $setting->rating,
                    'icon' => 'star',
                ];
            }

            DB::table('site_settings')
                ->where('id', $setting->id)
                ->update(['trust_indicators' => json_encode($trustIndicators)]);
        });

        // Drop old columns
        Schema::table('site_settings', function (Blueprint $table) {
            $table->dropColumn(['families_count', 'years_experience', 'rating']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('site_settings', function (Blueprint $table) {
            // Restore old columns
            $table->integer('families_count')->default(500)->after('registration_number');
            $table->integer('years_experience')->default(10)->after('families_count');
            $table->decimal('rating', 3, 1)->default(4.9)->after('years_experience');
        });

        // Migrate JSON data back to columns (if possible)
        DB::table('site_settings')->get()->each(function ($setting) {
            $indicators = json_decode($setting->trust_indicators, true) ?? [];
            
            $familiesCount = null;
            $yearsExperience = null;
            $rating = null;

            foreach ($indicators as $indicator) {
                $label = strtolower($indicator['label'] ?? '');
                if (str_contains($label, 'famil')) {
                    $familiesCount = (int) ($indicator['value'] ?? 500);
                } elseif (str_contains($label, 'year')) {
                    $yearsExperience = (int) ($indicator['value'] ?? 10);
                } elseif (str_contains($label, 'rating')) {
                    $rating = (float) ($indicator['value'] ?? 4.9);
                }
            }

            DB::table('site_settings')
                ->where('id', $setting->id)
                ->update([
                    'families_count' => $familiesCount ?? 500,
                    'years_experience' => $yearsExperience ?? 10,
                    'rating' => $rating ?? 4.9,
                ]);
        });

        Schema::table('site_settings', function (Blueprint $table) {
            $table->dropColumn('trust_indicators');
        });
    }
};
