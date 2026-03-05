<?php

namespace Database\Seeders;

use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\BlogTag;
use Illuminate\Database\Seeder;

/**
 * Seeds blog categories and tags. Does not seed demo posts.
 * Removes any existing demo blog posts (by known slugs) when run.
 * Copy to backend/database/seeders/BlogSeeder.php
 * Run: docker compose exec backend php /var/www/html/artisan db:seed --class=BlogSeeder
 */
class BlogSeeder extends Seeder
{
    /** Slugs of demo/placeholder posts that should be removed when the seeder runs. */
    private const DEMO_POST_SLUGS = [
        'what-is-trauma-informed-care',
        'choosing-sen-mentor',
        'safeguarding-at-cams',
        'understanding-sen-support-guide',
    ];

    public function run(): void
    {
        $this->removeDemoPosts();
        $categories = $this->seedCategories();
        $tags = $this->seedTags();
    }

    /** Delete demo blog posts from the database so they do not appear on the site. */
    private function removeDemoPosts(): void
    {
        BlogPost::whereIn('slug', self::DEMO_POST_SLUGS)->delete();
    }

    /** @return array<string, BlogCategory> slug => model */
    private function seedCategories(): array
    {
        $items = [
            [
                'name' => 'SEN & Inclusion',
                'slug' => 'sen-inclusion',
                'summary' => 'Articles on special educational needs, inclusion, and supporting neurodivergent children.',
                'description' => 'Expert insights and practical tips for families and professionals.',
                'is_active' => true,
                'display_order' => 1,
            ],
            [
                'name' => 'Parenting & Family',
                'slug' => 'parenting-family',
                'summary' => 'Supporting parents and carers with trauma-informed and attachment-aware guidance.',
                'description' => 'Resources for family wellbeing and connection.',
                'is_active' => true,
                'display_order' => 2,
            ],
            [
                'name' => 'News & Updates',
                'slug' => 'news-updates',
                'summary' => 'CAMS Services news, policy updates, and service information.',
                'description' => 'Stay up to date with our latest news.',
                'is_active' => true,
                'display_order' => 3,
            ],
        ];

        $out = [];
        foreach ($items as $item) {
            $cat = BlogCategory::updateOrCreate(
                ['slug' => $item['slug']],
                $item
            );
            $out[$item['slug']] = $cat;
        }
        return $out;
    }

    /** @return array<string, BlogTag> slug => model */
    private function seedTags(): array
    {
        $items = [
            ['name' => 'SEN', 'slug' => 'sen', 'description' => 'Special educational needs', 'is_active' => true],
            ['name' => 'Trauma-informed', 'slug' => 'trauma-informed', 'description' => 'Trauma-informed practice', 'is_active' => true],
            ['name' => 'Families', 'slug' => 'families', 'description' => 'For families and carers', 'is_active' => true],
            ['name' => 'Mentoring', 'slug' => 'mentoring', 'description' => 'Mentoring and 1:1 support', 'is_active' => true],
            ['name' => 'Safeguarding', 'slug' => 'safeguarding', 'description' => 'Safeguarding and safety', 'is_active' => true],
        ];

        $out = [];
        foreach ($items as $item) {
            $tag = BlogTag::updateOrCreate(
                ['slug' => $item['slug']],
                $item
            );
            $out[$item['slug']] = $tag;
        }
        return $out;
    }

}
