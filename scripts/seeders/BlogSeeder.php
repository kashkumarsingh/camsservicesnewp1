<?php

namespace Database\Seeders;

use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\BlogTag;
use Illuminate\Database\Seeder;

/**
 * Seeds blog categories, tags, and posts with CAMS-relevant content.
 * Copy to backend/database/seeders/BlogSeeder.php
 * Run: docker compose exec backend php /var/www/html/artisan db:seed --class=BlogSeeder
 */
class BlogSeeder extends Seeder
{
    public function run(): void
    {
        $categories = $this->seedCategories();
        $tags = $this->seedTags();
        $this->seedPosts($categories, $tags);
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

    /** @param array<string, BlogCategory> $categories
     * @param array<string, BlogTag> $tags
     */
    private function seedPosts(array $categories, array $tags): void
    {
        $posts = [
            [
                'title' => 'What Is Trauma-Informed Care and Why It Matters for Your Child',
                'slug' => 'what-is-trauma-informed-care',
                'excerpt' => 'An introduction to trauma-informed practice and how it shapes the support we offer at CAMS Services.',
                'content' => "<p>Trauma-informed care is an approach that recognises the impact of trauma on development, behaviour, and relationships. At CAMS Services, every practitioner is trained to create safety, offer choice, and work at your child's pace.</p><h2>Key principles</h2><p>We focus on safety, trust, collaboration, and empowerment. We never use punitive measures or restraint. Our goal is to help your child feel seen, safe, and supported.</p><h2>What this means in practice</h2><p>Sessions are predictable, consent-based, and adapted to your child's sensory and emotional needs. We work closely with you so strategies are consistent at home and in sessions.</p>",
                'category_slug' => 'sen-inclusion',
                'tag_slugs' => ['trauma-informed', 'families', 'sen'],
                'author_name' => 'CAMS Services Team',
                'author_role' => 'Practice Lead',
                'is_featured' => true,
            ],
            [
                'title' => 'How to Choose the Right SEN Mentor for Your Child',
                'slug' => 'choosing-sen-mentor',
                'excerpt' => 'Practical tips for families looking for a mentor who can support their child\'s unique needs.',
                'content' => "<p>Choosing a mentor is a big decision. At CAMS Services we match families with practitioners based on your child's interests, needs, and goals.</p><h2>What to look for</h2><p>Look for DBS-checked staff, relevant training (SEN, trauma, attachment), and a commitment to working in partnership with you. Ask about session structure, communication, and how progress is reviewed.</p><h2>Our matching process</h2><p>After your free consultation we recommend a mentor and arrange a trial session. You're never locked in — we want the fit to be right.</p>",
                'category_slug' => 'parenting-family',
                'tag_slugs' => ['mentoring', 'sen', 'families'],
                'author_name' => 'CAMS Services Team',
                'author_role' => 'Family Support',
                'is_featured' => true,
            ],
            [
                'title' => 'Safeguarding at CAMS: How We Keep Your Child Safe',
                'slug' => 'safeguarding-at-cams',
                'excerpt' => 'Our safeguarding policies, DBS checks, and training ensure every session is safe and accountable.',
                'content' => "<p>Your child's safety is our priority. Every member of our team is DBS checked, trained in safeguarding, and supervised by a Designated Safeguarding Lead.</p><h2>DBS and training</h2><p>We use the Update Service where possible and renew checks in line with policy. All staff complete safeguarding training and receive regular updates.</p><h2>Reporting and transparency</h2><p>We follow statutory guidance and work with local authorities where needed. We're transparent with families about our processes and your rights.</p>",
                'category_slug' => 'news-updates',
                'tag_slugs' => ['safeguarding', 'families'],
                'author_name' => 'CAMS Services Team',
                'author_role' => 'Safeguarding Lead',
                'is_featured' => false,
            ],
            [
                'title' => 'Understanding SEN Support: A Quick Guide for Parents',
                'slug' => 'understanding-sen-support-guide',
                'excerpt' => 'A short guide to SEN terminology, support types, and how CAMS can help.',
                'content' => "<p>Navigating SEN support can feel overwhelming. This guide explains common terms and how our services fit in.</p><h2>Types of support</h2><p>We offer mentoring, trauma-informed care, and education support. Sessions can be at home, in the community, or at school (by arrangement).</p><h2>Getting started</h2><p>Book a free consultation. We'll discuss your child's needs, our approach, and the right package for you. No obligation.</p>",
                'category_slug' => 'parenting-family',
                'tag_slugs' => ['sen', 'families'],
                'author_name' => 'CAMS Services Team',
                'author_role' => 'Family Support',
                'is_featured' => false,
            ],
        ];

        foreach ($posts as $index => $data) {
            $tagSlugs = $data['tag_slugs'];
            $categorySlug = $data['category_slug'];
            unset($data['tag_slugs'], $data['category_slug']);

            $category = $categories[$categorySlug] ?? null;
            if (! $category) {
                continue;
            }

            $post = BlogPost::updateOrCreate(
                ['slug' => $data['slug']],
                [
                    'category_id' => $category->id,
                    'title' => $data['title'],
                    'excerpt' => $data['excerpt'],
                    'content' => $data['content'],
                    'author_name' => $data['author_name'],
                    'author_role' => $data['author_role'],
                    'is_featured' => $data['is_featured'],
                    'is_published' => true,
                    'published_at' => now()->subDays(count($posts) - $index),
                    'hero_image' => null,
                    'author_avatar_url' => null,
                    'views' => 0,
                    'seo' => null,
                    'hero_metadata' => null,
                    'structured_content' => null,
                ]
            );

            $tagIds = [];
            foreach ($tagSlugs as $order => $tagSlug) {
                $tag = $tags[$tagSlug] ?? null;
                if ($tag) {
                    $tagIds[$tag->id] = ['display_order' => $order];
                }
            }
            if (! empty($tagIds)) {
                $post->tags()->sync($tagIds);
            }
        }
    }
}
