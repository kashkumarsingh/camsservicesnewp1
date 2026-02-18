<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Site Setting Model
 * 
 * Clean Architecture Layer: Domain (Eloquent entity bridging Domain ↔ Infrastructure)
 * 
 * Represents site-wide settings for Header and Footer components.
 * Uses singleton pattern - only one record should exist.
 */
class SiteSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'phone',
        'email',
        'address',
        'full_address',
        'whatsapp_url',
        'map_embed_url',
        'support_emails',
        'support_whatsapp_numbers',
        'social_links',
        'company_name',
        'company_description',
        'registration_number',
        'trust_indicators',
        'ofsted_registered',
        'certifications',
        'nav_links',
        'quick_links',
        'package_benefits',
        'logo_path',
        'copyright_text',
    ];

    protected $casts = [
        'ofsted_registered' => 'boolean',
        'social_links' => 'array',
        'trust_indicators' => 'array',
        'certifications' => 'array',
        'nav_links' => 'array',
        'quick_links' => 'array',
        'package_benefits' => 'array',
        'support_emails' => 'array',
        'support_whatsapp_numbers' => 'array',
    ];

    /**
     * Get the singleton instance (first record or create default)
     */
    public static function instance(): self
    {
        $instance = static::firstOrCreate(
            ['id' => 1],
            static::getDefaults()
        );
        
        // Update with optional fields if they exist in the database schema
        // This handles cases where migrations haven't run yet
        static::updateOptionalFields($instance);
        
        return $instance;
    }

    /**
     * Get default values for new site settings
     * Only includes fields that are guaranteed to exist in the base migration
     */
    protected static function getDefaults(): array
    {
        $defaults = [
            'company_name' => 'CAMS Services Ltd.',
            'trust_indicators' => [
                [
                    'label' => 'Families',
                    'value' => '500+',
                    'icon' => 'users',
                ],
                [
                    'label' => 'Years',
                    'value' => '10+',
                    'icon' => 'clock',
                ],
                [
                    'label' => 'Rating',
                    'value' => '4.9/5',
                    'icon' => 'star',
                ],
            ],
            'ofsted_registered' => true,
            'logo_path' => '/logos/cams-services-logo.webp',
            'nav_links' => [
                ['href' => '/about', 'label' => 'Who We Are'],
                ['href' => '/services', 'label' => 'What We Do'],
                ['href' => '/packages', 'label' => 'Our Packages'],
                ['href' => '/trainers', 'label' => 'Meet Our Team'],
                ['href' => '/blog', 'label' => 'Blog'],
                ['href' => '/contact', 'label' => "Let's Connect"],
            ],
            'quick_links' => [
                ['href' => '/about', 'label' => 'About Us'],
                ['href' => '/services', 'label' => 'Our Services'],
                ['href' => '/packages', 'label' => 'Packages'],
                ['href' => '/trainers', 'label' => 'Our Team'],
                ['href' => '/blog', 'label' => 'Blog & Resources'],
                ['href' => '/faq', 'label' => 'FAQs'],
            ],
            'package_benefits' => [
                [
                    'icon' => 'heart',
                    'title' => 'Personalized Care',
                    'description' => 'Tailored to your child\'s unique needs and goals',
                    'gradient' => 'from-[#0080FF] to-[#00D4FF]',
                ],
                [
                    'icon' => 'trending-up',
                    'title' => 'Proven Results',
                    'description' => '95% of families see improvement within 4 weeks',
                    'gradient' => 'from-[#0080FF] to-[#00D4FF]',
                ],
                [
                    'icon' => 'users',
                    'title' => 'Expert Team',
                    'description' => 'Highly qualified, DBS-checked professionals',
                    'gradient' => 'from-[#00D4FF] to-[#0080FF]',
                ],
                [
                    'icon' => 'clock',
                    'title' => 'Flexible Scheduling',
                    'description' => 'Evenings, weekends, and custom timing available',
                    'gradient' => 'from-[#00D4FF] to-[#0080FF]',
                ],
            ],
        ];
        
        return $defaults;
    }

    /**
     * Update instance with optional fields if they exist in the database schema.
     * Uses try-catch instead of Schema facade to avoid infrastructure dependency in Domain layer.
     * This handles cases where migrations run after the model is first accessed.
     */
    protected static function updateOptionalFields(self $instance): void
    {
        $optionalFields = [];
        
        // Try to set support_emails if empty (gracefully handle if column doesn't exist)
        if (empty($instance->support_emails)) {
            try {
                $optionalFields['support_emails'] = ['support@camsservices.co.uk'];
            } catch (\Exception $e) {
                // Column might not exist yet - ignore gracefully
            }
        }
        
        // Try to set support_whatsapp_numbers if empty (gracefully handle if column doesn't exist)
        if (empty($instance->support_whatsapp_numbers)) {
            try {
                $optionalFields['support_whatsapp_numbers'] = ['+44 20 1234 5678'];
            } catch (\Exception $e) {
                // Column might not exist yet - ignore gracefully
            }
        }
        
        // Update only if there are fields to update
        if (!empty($optionalFields)) {
            try {
                $instance->update($optionalFields);
            } catch (\Exception $e) {
                // Columns might not exist yet - ignore gracefully (migrations will handle defaults)
            }
        }
    }
}
