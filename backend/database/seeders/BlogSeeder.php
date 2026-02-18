<?php

namespace Database\Seeders;

use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\BlogTag;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BlogSeeder extends Seeder
{
    /**
     * Seed sample blog content for development environments.
     */
    public function run(): void
    {
        $categories = collect([
            [
                'name' => 'Parent Resources',
                'slug' => 'parent-resources',
                'summary' => 'Guides and practical strategies for families.',
            ],
            [
                'name' => 'Trauma Support',
                'slug' => 'trauma-support',
                'summary' => 'Evidence-based trauma-informed care insights.',
            ],
        ])->mapWithKeys(function (array $category) {
            $model = BlogCategory::updateOrCreate(
                ['slug' => $category['slug']],
                [
                    'name' => $category['name'],
                    'summary' => $category['summary'],
                    'description' => $category['summary'],
                    'is_active' => true,
                ]
            );

            return [$category['slug'] => $model->id];
        });

        $tags = collect([
            ['name' => 'SEN', 'slug' => 'sen'],
            ['name' => 'Parent Guide', 'slug' => 'parent-guide'],
            ['name' => 'Trauma', 'slug' => 'trauma'],
            ['name' => 'Care Approaches', 'slug' => 'care-approaches'],
            ['name' => 'Therapeutic Activities', 'slug' => 'therapeutic-activities'],
        ])->mapWithKeys(function (array $tag) {
            $model = BlogTag::updateOrCreate(
                ['slug' => $tag['slug']],
                ['name' => $tag['name'], 'description' => null, 'is_active' => true]
            );

            return [$tag['slug'] => $model->id];
        });

        $posts = [
            [
                'title' => "Understanding SEN Support: A Parent's Guide",
                'slug' => 'understanding-sen-support-parents-guide',
                'category_slug' => 'parent-resources',
                'excerpt' => 'A comprehensive guide for parents navigating the SEN support system and understanding how to access the right resources for their child.',
                'content' => <<<'MD'
## Understanding SEN Support

Navigating the Special Educational Needs (SEN) support system can be overwhelming for parents. This guide demystifies the process and clarifies your rights so you can advocate for your child with confidence.

### Key Topics We Cover
- Early identification and assessment pathways.
- Collaborating with your SENCO and school teams.
- Funding options, EHCP applications, and local authority responsibilities.
- Practical tips for record keeping and progress tracking.

### Takeaway
You know your child best. With the right information and team beside you, you can secure the specialist support they deserve.
MD,
                'hero_image' => '/images/hero/bg-space.webp',
                'author_name' => 'Dr. Sarah Johnson',
                'author_role' => 'Educational Psychologist',
                'author_avatar_url' => '/images/team/trainner-1.webp',
                'is_featured' => true,
                'tags' => ['sen', 'parent-guide'],
                'published_at' => now()->subDays(5),
            ],
            [
                'title' => 'Trauma-Informed Care: What It Means for Your Child',
                'slug' => 'trauma-informed-care-what-it-means',
                'category_slug' => 'trauma-support',
                'excerpt' => 'Learn about trauma-informed care approaches and how they can support children who have experienced trauma.',
                'content' => <<<'MD'
## Trauma-Informed Care

Trauma-informed practice recognises the widespread impact of trauma and integrates that understanding into every interaction with young people.

### Core Principles
- Safety, trust, and collaboration.
- Empowerment and choice.
- Cultural humility and responsiveness.

### How CAMS Services Applies This
We design predictable routines, train staff in de-escalation, and co-create goals with families so progress feels safe and achievable.
MD,
                'hero_image' => '/images/hero/bg-space.webp',
                'author_name' => 'Michael Chen',
                'author_role' => 'Trauma Specialist',
                'author_avatar_url' => '/images/team/trainner-2.webp',
                'is_featured' => false,
                'tags' => ['trauma', 'care-approaches', 'therapeutic-activities'],
                'published_at' => now()->subDays(2),
            ],
        ];

        foreach ($posts as $postData) {
            $post = BlogPost::updateOrCreate(
                ['slug' => $postData['slug']],
                [
                    'category_id' => $categories[$postData['category_slug']] ?? null,
                    'title' => $postData['title'],
                    'excerpt' => $postData['excerpt'],
                    'content' => $postData['content'],
                    'hero_image' => $postData['hero_image'],
                    'author_name' => $postData['author_name'],
                    'author_role' => $postData['author_role'],
                    'author_avatar_url' => $postData['author_avatar_url'],
                    'is_featured' => $postData['is_featured'],
                    'is_published' => true,
                    'published_at' => $postData['published_at'],
                    'reading_time' => null,
                    'seo' => [
                        'title' => $postData['title'] . ' | CAMS Services Blog',
                        'description' => Str::limit($postData['excerpt'], 150),
                        'og_image' => $postData['hero_image'],
                    ],
                ]
            );

            $tagIds = collect($postData['tags'] ?? [])
                ->map(fn (string $slug) => $tags[$slug] ?? null)
                ->filter()
                ->values();

            if ($tagIds->isNotEmpty()) {
                $post->tags()->sync($tagIds->all());
            }
        }
    }
}

