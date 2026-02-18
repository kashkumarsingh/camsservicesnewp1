<?php

namespace Database\Seeders;

use App\Models\SiteSetting;
use Illuminate\Database\Seeder;

/**
 * Site Settings Seeder
 * 
 * Clean Architecture Layer: Infrastructure (Seeding)
 * Purpose: Populates initial site settings for Header and Footer.
 */
class SiteSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        SiteSetting::updateOrCreate(
            ['id' => 1],
            [
                // Contact Information
                'phone' => '+44 (0) 123 456 7890',
                'email' => 'info@camsservices.co.uk',
                'address' => 'Buckhurst Hill, England',
                'full_address' => '123 Example Street, Buckhurst Hill, England, IG9 1AB',
                'whatsapp_url' => 'https://wa.me/441234567890',
                'map_embed_url' => 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2475.0000000000005!2d0.03000000000000000!3d51.62000000000000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTHCsDM3JzEyLjAiTiAwwrAwMSc0OC4wIkU!5e0!3m2!1sen!2suk!4v1678912345678!5m2!1sen!2suk',
                
                // Social Media Links
                'social_links' => [
                    [
                        'platform' => 'Facebook',
                        'url' => 'https://facebook.com/camsservices',
                        'icon' => 'facebook',
                    ],
                    [
                        'platform' => 'Twitter',
                        'url' => 'https://twitter.com/camsservices',
                        'icon' => 'twitter',
                    ],
                    [
                        'platform' => 'Instagram',
                        'url' => 'https://instagram.com/camsservices',
                        'icon' => 'instagram',
                    ],
                    [
                        'platform' => 'LinkedIn',
                        'url' => 'https://linkedin.com/company/camsservices',
                        'icon' => 'linkedin',
                    ],
                ],
                
                // Company Information
                'company_name' => 'CAMS Services Ltd.',
                'company_description' => 'Empowering children and young people with specialist SEN support, trauma-informed care, and life-changing mentoring programs.',
                'registration_number' => '12345678',
                
                // Trust Indicators
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
                
                // Certifications
                'ofsted_registered' => true,
                'certifications' => [],
                
                // Navigation Links (Header)
                'nav_links' => [
                    ['href' => '/about', 'label' => 'Who We Are'],
                    ['href' => '/services', 'label' => 'What We Do'],
                    ['href' => '/packages', 'label' => 'Our Packages'],
                    ['href' => '/trainers', 'label' => 'Meet Our Team'],
                    ['href' => '/blog', 'label' => 'Blog'],
                    ['href' => '/contact', 'label' => "Let's Connect"],
                ],
                
                // Footer Quick Links
                'quick_links' => [
                    ['href' => '/about', 'label' => 'About Us'],
                    ['href' => '/services', 'label' => 'Our Services'],
                    ['href' => '/packages', 'label' => 'Packages'],
                    ['href' => '/trainers', 'label' => 'Our Team'],
                    ['href' => '/blog', 'label' => 'Blog & Resources'],
                    ['href' => '/faq', 'label' => 'FAQs'],
                ],
                
                // Logo
                'logo_path' => '/logos/cams-services-logo.webp',
                
                // Copyright
                'copyright_text' => null, // Will use default: "© {year} CAMS Services Ltd. All rights reserved."
            ]
        );
    }
}
