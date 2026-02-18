<?php

namespace Database\Seeders;

use App\Models\ExternalReview;
use App\Models\Testimonial;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class TestimonialSeeder extends Seeder
{
    public function run(): void
    {
        $externalReviews = ExternalReview::get()->keyBy('provider_review_id');

        $testimonials = [
            [
                'author_name' => 'Sarah M.',
                'author_role' => 'Parent, SEN Provision',
                'quote' => 'CAMS provided a wraparound plan for our daughter within two weeks. We felt heard, supported, and kept in the loop at all times.',
                'rating' => 5,
                'source_type' => Testimonial::SOURCE_MANUAL,
                'source_label' => 'Parent Feedback',
                'source_url' => null,
                'is_featured' => true,
                'display_order' => 1,
            ],
            [
                'author_name' => 'James T.',
                'author_role' => 'Social Worker, Thurrock Council',
                'quote' => 'Reports are clinically rigorous and always arrive before the court deadline. CAMS has become our gold-standard partner.',
                'rating' => 5,
                'source_type' => Testimonial::SOURCE_GOOGLE,
                'source_label' => 'Google Reviews',
                'source_review_id' => 'google-review-1',
                'source_url' => 'https://maps.google.com/?cid=demo',
                'external_review_id' => optional($externalReviews->get('google-review-1'))->id,
                'is_featured' => true,
                'display_order' => 2,
            ],
            [
                'author_name' => 'Amelia R.',
                'author_role' => 'Designated Safeguarding Lead',
                'quote' => 'Their safeguarding escalation process is the most thorough I have seen. Parents trust them, which makes our job easier.',
                'rating' => 5,
                'source_type' => Testimonial::SOURCE_TRUSTPILOT,
                'source_label' => 'Trustpilot',
                'source_review_id' => 'trustpilot-review-1',
                'source_url' => 'https://uk.trustpilot.com/review/cams-services-demo',
                'external_review_id' => optional($externalReviews->get('trustpilot-review-1'))->id,
                'is_featured' => false,
                'display_order' => 3,
            ],
        ];

        foreach ($testimonials as $testimonial) {
            Testimonial::updateOrCreate(
                ['slug' => Str::slug($testimonial['author_name'])],
                array_merge($testimonial, [
                    'public_id' => $testimonial['public_id'] ?? (string) Str::uuid(),
                    'locale' => 'en-GB',
                    'published' => true,
                    'published_at' => now()->subDays(Arr::random([7, 14, 21])),
                    'badges' => [
                        [
                            'label' => 'Safeguarding First',
                            'icon' => 'ShieldCheck',
                        ],
                    ],
                ])
            );
        }
    }
}

