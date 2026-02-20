<?php

namespace Database\Seeders;

use App\Models\Page;
use Illuminate\Database\Seeder;

/**
 * Seeds the home page with the current default section content.
 * Copy to backend/database/seeders/HomePageSeeder.php then run:
 *   cd backend && php artisan db:seed --class=HomePageSeeder
 *
 * Content matches HomePageClient.tsx DEFAULT_* constants.
 */
class HomePageSeeder extends Seeder
{
    public function run(): void
    {
        $sections = [
            ['type' => 'hero', 'data' => [
                'badgeText' => 'Trusted by 500+ Families Since 2014',
                'heading' => "Transform Your Child's Future",
                'subheading' => "Specialist SEN & trauma-informed care that empowers children to thrive",
                'primaryCta' => ['label' => 'Book FREE Consultation', 'href' => '/contact', 'variant' => 'primary'],
                'secondaryCta' => ['label' => 'See How It Works', 'href' => '#how-it-works', 'variant' => 'outline'],
                'backgroundVideoUrl' => '/videos/space-bg-2.mp4',
            ]],
            ['type' => 'how_it_works', 'data' => [
                'title' => 'How It Works',
                'subtitle' => "Getting started is simple. Just three easy steps to transform your child's journey.",
                'steps' => [
                    ['title' => 'Book FREE Consultation', 'description' => "Share your child's needs, strengths, and goals. Get approved to start your journey.", 'icon' => 'phone'],
                    ['title' => 'Purchase Your Package', 'description' => 'Choose the perfect package for your family. Pay once, then book sessions at your pace.', 'icon' => 'calendar'],
                    ['title' => 'Book Sessions & Thrive', 'description' => 'Book sessions from your dashboard when ready. Watch your child progress with evidence-based support.', 'icon' => 'sparkles'],
                ],
            ]],
            ['type' => 'services_highlight', 'data' => [
                'title' => 'Our Specialist Services',
                'subtitle' => "Evidence-based support tailored to your child's unique needs",
                'viewAllLabel' => 'View All Services',
                'viewAllHref' => '/services',
            ]],
            ['type' => 'packages_highlight', 'data' => [
                'title' => 'Flexible Care Packages',
                'subtitle' => 'Choose the perfect package for your family. All include DBS-checked staff, personalized plans, and ongoing support.',
                'viewAllLabel' => 'Compare All Packages',
                'viewAllHref' => '/packages',
            ]],
            ['type' => 'impact_stats', 'data' => [
                'title' => 'Our Impact',
                'subtitle' => "Real results that make a difference in children's lives",
                'stats' => [
                    ['label' => 'Families Supported', 'value' => '500+', 'icon' => 'users'],
                    ['label' => 'DBS-Checked Professionals', 'value' => '100%', 'icon' => 'shield'],
                    ['label' => 'Average Satisfaction', 'value' => '98%', 'icon' => 'star'],
                    ['label' => 'Years of Expertise', 'value' => '10+', 'icon' => 'clock'],
                ],
            ]],
            ['type' => 'testimonials', 'data' => [
                'title' => 'What Families Say',
                'subtitle' => "Don't just take our word for it - hear from the families we've helped",
                'limit' => 6,
            ]],
            ['type' => 'blog', 'data' => [
                'title' => 'Latest from Our Blog',
                'subtitle' => 'Expert insights, tips, and stories to support your parenting journey',
                'limit' => 3,
            ]],
            ['type' => 'cta', 'data' => [
                'title' => "Ready to Transform Your Child's Future?",
                'subtitle' => 'Book your FREE consultation today and discover how we can help your child thrive',
                'primaryCta' => ['label' => 'Book FREE Consultation', 'href' => '/contact'],
                'secondaryCta' => ['label' => 'View All Packages', 'href' => '/packages'],
            ]],
        ];

        Page::updateOrCreate(
            ['slug' => 'home'],
            [
                'title' => 'Home',
                'type' => 'home',
                'content' => '',
                'sections' => $sections,
                'summary' => null,
                'published' => true,
                'version' => '1.0.0',
                'views' => 0,
                'effective_date' => now()->toDateString(),
                'last_updated' => now(),
            ]
        );
    }
}
