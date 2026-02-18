<?php

namespace Database\Seeders;

use App\Models\FAQ;
use Illuminate\Database\Seeder;

/**
 * FAQs Seeder
 * 
 * Clean Architecture Layer: Infrastructure (Seeding)
 * Purpose: Populates initial FAQ data for development and testing.
 */
class FAQsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faqs = [
            [
                'title' => 'What services does CAMS provide?',
                'slug' => 'what-services-does-cams-provide',
                'content' => 'CAMS provides comprehensive support services including Trauma-Informed Care, SEN Support, Mentoring & Activities, and Safeguarding First. Each service is tailored to meet the unique needs of children and families.',
                'category' => 'General',
                'order' => 1,
                'published' => true,
            ],
            [
                'title' => 'How do I book a package?',
                'slug' => 'how-do-i-book-a-package',
                'content' => 'You can book a package by visiting our Packages page, selecting the package that best fits your needs, and filling out the booking form. Our team will contact you within 24 hours to confirm your booking.',
                'category' => 'Packages',
                'order' => 2,
                'published' => true,
            ],
            [
                'title' => 'What age groups do you support?',
                'slug' => 'what-age-groups-do-you-support',
                'content' => 'We support children and young people from early years through to young adulthood. Our services are tailored to different age groups, and we work closely with families to ensure age-appropriate support.',
                'category' => 'General',
                'order' => 3,
                'published' => true,
            ],
            [
                'title' => 'Are your trainers qualified?',
                'slug' => 'are-your-trainers-qualified',
                'content' => 'Yes, all our trainers are fully qualified and undergo regular training and DBS checks. They have expertise in trauma-informed care, SEN support, and safeguarding. You can view trainer profiles and qualifications on our Trainers page.',
                'category' => 'Trainers',
                'order' => 4,
                'published' => true,
            ],
            [
                'title' => 'What is your cancellation policy?',
                'slug' => 'what-is-your-cancellation-policy',
                'content' => 'We understand that circumstances can change. Please refer to our Cancellation Policy page for detailed information about cancellation terms, refunds, and rescheduling options.',
                'category' => 'Policies',
                'order' => 5,
                'published' => true,
            ],
            [
                'title' => 'How do you ensure child safety?',
                'slug' => 'how-do-you-ensure-child-safety',
                'content' => 'Child safety is our top priority. All staff undergo comprehensive DBS checks, and we follow strict safeguarding protocols. Please see our Safeguarding Policy for detailed information about our safety measures.',
                'category' => 'Safeguarding',
                'order' => 6,
                'published' => true,
            ],
        ];

        foreach ($faqs as $faq) {
            FAQ::updateOrCreate(
                ['slug' => $faq['slug']],
                $faq
            );
        }
    }
}
