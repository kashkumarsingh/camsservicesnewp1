<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

/**
 * Seeds services (list and detail content) with CAMS-relevant offerings.
 * Copy to backend/database/seeders/ServicesSeeder.php
 * Run: docker compose exec backend php /var/www/html/artisan db:seed --class=ServicesSeeder
 */
class ServicesSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            [
                'title' => 'SEN Mentoring & Support',
                'slug' => 'sen-mentoring-support',
                'summary' => 'One-to-one mentoring tailored to your child\'s strengths and needs, delivered by DBS-checked, trauma-informed practitioners.',
                'description' => 'Our SEN mentoring programme pairs your child with a skilled mentor who understands sensory needs, communication differences, and the importance of predictable routines.',
                'body' => "<h2>What We Offer</h2><p>One-to-one sessions designed around your child's interests and goals. We use evidence-based approaches and work closely with families and schools to ensure consistency.</p><h2>Who It's For</h2><p>Children and young people with special educational needs, including autism, ADHD, and learning differences. We adapt every session to the individual.</p><h2>Outcomes</h2><p>Improved confidence, communication, and engagement. Regular reviews and session notes keep you informed of progress.</p>",
                'category' => 'Mentoring',
                'icon' => 'users',
                'hero' => [
                    'primary_cta' => ['text' => 'Book a consultation', 'href' => '/contact'],
                    'secondary_cta' => ['text' => 'View packages', 'href' => '/packages'],
                ],
                'content_section' => ['title' => 'How SEN mentoring works'],
                'cta_section' => [
                    'title' => 'Ready to get started?',
                    'subtitle' => 'Book a free consultation to discuss your child\'s needs.',
                    'primary_cta' => ['text' => 'Contact us', 'href' => '/contact'],
                ],
            ],
            [
                'title' => 'Trauma-Informed Care',
                'slug' => 'trauma-informed-care',
                'summary' => 'Safe, relational support for children who have experienced trauma. Our team is trained in attachment-aware and trauma-informed practice.',
                'description' => 'We provide a calm, predictable environment and use approaches that support regulation and build trust.',
                'body' => "<h2>Our Approach</h2><p>Trauma-informed care means we prioritise safety, choice, and collaboration. We never use restraint or punitive measures and work at your child's pace.</p><h2>Practitioner Training</h2><p>All our practitioners complete accredited trauma and attachment training and receive regular supervision.</p><h2>Working With Families</h2><p>We work alongside parents and carers to align strategies at home and in sessions.</p>",
                'category' => 'Therapeutic',
                'icon' => 'heart',
                'hero' => [
                    'primary_cta' => ['text' => 'Book a consultation', 'href' => '/contact'],
                ],
                'content_section' => ['title' => 'Understanding trauma-informed support'],
                'cta_section' => [
                    'title' => 'Discuss your child\'s needs',
                    'primary_cta' => ['text' => 'Get in touch', 'href' => '/contact'],
                ],
            ],
            [
                'title' => 'Home & Community-Based Sessions',
                'slug' => 'home-community-sessions',
                'summary' => 'Flexible sessions at home, in the community, or online — wherever your child feels most comfortable and safe.',
                'description' => 'We bring support to you. Sessions can take place at home, in a local park, or via secure video call.',
                'body' => "<h2>Where We Work</h2><p>Home visits, community settings (libraries, youth centres, outdoor spaces), and online sessions. We follow your child's preferences and your family's schedule.</p><h2>Flexibility</h2><p>Book sessions in blocks or as needed. We work around school, appointments, and family life.</p><h2>Safety</h2><p>All staff are DBS checked and we carry out risk assessments for each setting.</p>",
                'category' => 'Delivery',
                'icon' => 'home',
                'hero' => [
                    'primary_cta' => ['text' => 'Book a consultation', 'href' => '/contact'],
                    'secondary_cta' => ['text' => 'View all services', 'href' => '/services'],
                ],
                'content_section' => ['title' => 'Session locations and options'],
                'cta_section' => [
                    'title' => 'Find the right setting',
                    'subtitle' => 'We\'ll help you choose the best option for your child.',
                    'primary_cta' => ['text' => 'Contact us', 'href' => '/contact'],
                ],
            ],
            [
                'title' => 'School & Education Support',
                'slug' => 'school-education-support',
                'summary' => 'In-school or education-focused support to help your child engage, learn, and thrive in educational settings.',
                'description' => 'We work with schools and families to provide consistent, evidence-based support during the school day or around education goals.',
                'body' => "<h2>What We Offer</h2><p>In-school mentoring, transition support, and liaison with teachers and SENCOs. We can also support home learning and exam preparation where appropriate.</p><h2>Partnership</h2><p>We communicate regularly with school staff (with your consent) so strategies are aligned.</p><h2>Outcomes</h2><p>Improved attendance, engagement, and wellbeing at school.</p>",
                'category' => 'Education',
                'icon' => 'book-open',
                'hero' => [
                    'primary_cta' => ['text' => 'Book a consultation', 'href' => '/contact'],
                ],
                'content_section' => ['title' => 'Education support that fits'],
                'cta_section' => [
                    'title' => 'Support for school',
                    'primary_cta' => ['text' => 'Contact us', 'href' => '/contact'],
                ],
            ],
        ];

        foreach ($services as $data) {
            Service::updateOrCreate(
                ['slug' => $data['slug']],
                array_merge($data, [
                    'views' => 0,
                    'published' => true,
                    'publish_at' => null,
                ])
            );
        }
    }
}
