<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Services Seeder
 *
 * Clean Architecture Layer: Infrastructure (Data Seeding)
 * Purpose: Populate the services table with initial catalogue entries.
 */
class ServicesSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            [
                'title' => 'Trauma-Informed Care',
                'summary' => 'Specialist support for children who have experienced trauma.',
                'description' => 'Our trauma-informed care draws on evidence-based practices to create safe, predictable environments where children feel secure and empowered.',
                'body' => self::markdownSection([
                    'Safety & Trust: We build predictable routines and compassionate relationships.',
                    'Collaboration: Families, carers, and practitioners co-create support plans.',
                    'Empowerment: We teach regulation strategies that help children thrive.',
                ]),
                'icon' => 'Heart',
                'category' => 'Therapeutic Support',
            ],
            [
                'title' => 'SEN Support',
                'summary' => 'Tailored activities for young people with SEN, Autism, ADHD, and anxiety.',
                'description' => 'We design individualised programmes with sensory-friendly environments and skilled staff attuned to each child’s needs.',
                'body' => self::markdownSection([
                    'Personalised Plans: Activities matched to strengths and areas of growth.',
                    'Multi-Sensory Sessions: Carefully curated environments and equipment.',
                    'Skilled Practitioners: Experienced SEN specialists with ongoing training.',
                ]),
                'icon' => 'Users',
                'category' => 'Specialist Education',
            ],
            [
                'title' => 'Mentoring & Activities',
                'summary' => 'Confidence-building mentoring paired with engaging enrichment activities.',
                'description' => 'We partner young people with consistent mentors who spark curiosity, model resilience, and celebrate progress.',
                'body' => self::markdownSection([
                    'Positive Relationships: Mentors provide encouragement, accountability, and fun.',
                    'Life Skills: Sessions focus on communication, independence, and self-regulation.',
                    'Memorable Experiences: Creative arts, sport, STEM, and community projects.',
                ]),
                'icon' => 'Shield',
                'category' => 'Development Programmes',
            ],
            [
                'title' => 'Safeguarding First',
                'summary' => 'DBS-checked professionals with rigorous safeguarding processes.',
                'description' => 'Safety underpins everything we do. We operate robust policies, transparent reporting, and ongoing training.',
                'body' => self::markdownSection([
                    'DBS & Training: Every practitioner is vetted and trained beyond statutory minimums.',
                    'Clear Escalation Routes: Families know exactly how to raise a concern.',
                    'Culture of Vigilance: Safeguarding is embedded in daily practice.',
                ]),
                'icon' => 'Shield',
                'category' => 'Safeguarding',
            ],
        ];

        foreach ($services as $payload) {
            $slug = Str::slug($payload['title']);

            Service::updateOrCreate(
                ['slug' => $slug],
                [
                    'title' => $payload['title'],
                    'summary' => $payload['summary'],
                    'description' => $payload['description'],
                    'body' => $payload['body'],
                    'icon' => $payload['icon'],
                    'category' => $payload['category'],
                    'published' => true,
                    'publish_at' => now(),
                ],
            );
        }
    }

    private static function markdownSection(array $lines): string
    {
        return implode("\n\n", array_map(fn (string $line): string => "- {$line}", $lines));
    }
}


