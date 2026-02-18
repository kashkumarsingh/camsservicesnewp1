<?php

namespace Database\Seeders;

use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\BlogTag;
use App\Models\Child;
use App\Models\Package;
use App\Models\Service;
use App\Models\Trainer;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class LocalDemoSeeder extends Seeder
{
    /**
     * Seed a small, realistic demo dataset for local/admin dashboards.
     *
     * - 1 super admin user
     * - 1 parent user
     * - 1 trainer user + trainer profile
     * - 1 child linked to parent
     * - Demo packages, services, blog content and activities
     */
    public function run(): void
    {
        DB::transaction(function () {
            // Ensure core roles exist (in addition to ChildPermissionsSeeder)
            $superAdminRole = Role::firstOrCreate(['name' => 'super_admin']);
            $parentRole = Role::firstOrCreate(['name' => 'parent']);
            $trainerRole = Role::firstOrCreate(['name' => 'trainer']);

            // --- Admin user (for /dashboard/admin) ---
            $admin = User::firstOrCreate(
                ['email' => 'admin@example.com'],
                [
                    'name' => 'Demo Admin',
                    'password' => bcrypt('password'),
                    'phone' => '07000000000',
                    'address' => '1 Admin Street',
                    'postcode' => 'AB1 2CD',
                    'role' => 'super_admin',
                    'approval_status' => User::STATUS_APPROVED,
                ]
            );
            if (!$admin->hasRole($superAdminRole->name)) {
                $admin->assignRole($superAdminRole);
            }

            // --- Parent user ---
            $parent = User::firstOrCreate(
                ['email' => 'parent@example.com'],
                [
                    'name' => 'Demo Parent',
                    'password' => bcrypt('password'),
                    'phone' => '07000000001',
                    'address' => '10 Parent Lane',
                    'postcode' => 'AB1 2CD',
                    'role' => 'parent',
                    'approval_status' => User::STATUS_APPROVED,
                ]
            );
            if (!$parent->hasRole($parentRole->name)) {
                $parent->assignRole($parentRole);
            }

            // --- Trainer user + profile ---
            $trainerUser = User::firstOrCreate(
                ['email' => 'trainer@example.com'],
                [
                    'name' => 'Demo Trainer',
                    'password' => bcrypt('password'),
                    'phone' => '07000000002',
                    'address' => '5 Trainer Road',
                    'postcode' => 'AB1 2CD',
                    'role' => 'trainer',
                    'approval_status' => User::STATUS_APPROVED,
                ]
            );
            if (!$trainerUser->hasRole($trainerRole->name)) {
                $trainerUser->assignRole($trainerRole);
            }

            $trainer = Trainer::firstOrCreate(
                ['user_id' => $trainerUser->id],
                [
                    'name' => $trainerUser->name,
                    'slug' => Str::slug($trainerUser->name) ?: 'demo-trainer',
                    'role' => 'trainer',
                    'bio' => 'Demo trainer profile for local testing.',
                    'full_description' => 'Experienced demo trainer used for local dashboard development.',
                    'home_postcode' => $trainerUser->postcode,
                    'is_active' => true,
                    'is_featured' => true,
                ]
            );

            // --- Child linked to parent ---
            $child = Child::firstOrCreate(
                [
                    'user_id' => $parent->id,
                    'name' => 'Demo Child',
                ],
                [
                    'age' => 10,
                    'date_of_birth' => now()->subYears(10)->toDateString(),
                    'gender' => 'other',
                    'address' => $parent->address,
                    'postcode' => $parent->postcode,
                    'city' => 'Demo City',
                    'region' => 'Demo Region',
                    'approval_status' => Child::STATUS_APPROVED,
                ]
            );

            // --- Packages (5 sample records) ---
            if (Package::count() < 5) {
                // Create deterministic demo packages instead of using the factory
                // so we avoid schema mismatches and keep content predictable.
                $demoPackages = [
                    [
                        'name' => 'Starter Activity Package',
                        'slug' => 'starter-activity-package',
                        'description' => 'A gentle introduction package for new families (demo data).',
                        'price' => 120.00,
                        'hours' => 6,
                        'duration_weeks' => 3,
                        'features' => ['Warm-up games', 'Introductory skills', 'End-of-session recap'],
                        'what_to_expect' => 'Fun, low-pressure sessions to help children build confidence.',
                        'requirements' => ['Comfortable clothing', 'Water bottle'],
                        'image' => null,
                        'is_active' => true,
                        'is_popular' => true,
                    ],
                    [
                        'name' => 'After-School Booster',
                        'slug' => 'after-school-booster',
                        'description' => 'Weekly after-school sessions to boost confidence and fitness.',
                        'price' => 240.00,
                        'hours' => 12,
                        'duration_weeks' => 6,
                        'features' => ['Structured drills', 'Small group activities', 'Weekly progress updates'],
                        'what_to_expect' => 'Structured, coach-led activities each week after school.',
                        'requirements' => ['PE kit', 'Trainers', 'Water bottle'],
                        'image' => null,
                        'is_active' => true,
                        'is_popular' => false,
                    ],
                    [
                        'name' => 'Weekend Adventure Club',
                        'slug' => 'weekend-adventure-club',
                        'description' => 'Longer weekend sessions with mixed activities (demo).',
                        'price' => 300.00,
                        'hours' => 15,
                        'duration_weeks' => 5,
                        'features' => ['Outdoor games', 'Team challenges', 'Confidence building'],
                        'what_to_expect' => 'Longer sessions with a mix of outdoor and indoor activities.',
                        'requirements' => ['Weather-appropriate clothing'],
                        'image' => null,
                        'is_active' => true,
                        'is_popular' => true,
                    ],
                    [
                        'name' => 'Holiday Activity Bundle',
                        'slug' => 'holiday-activity-bundle',
                        'description' => 'Intensive holiday package for families needing extra cover.',
                        'price' => 450.00,
                        'hours' => 30,
                        'duration_weeks' => 3,
                        'features' => ['Daily sessions', 'Mixed activities', 'Flexible scheduling'],
                        'what_to_expect' => 'Daily sessions during school holidays with flexible timing.',
                        'requirements' => ['Snacks', 'Water bottle', 'Sun protection when needed'],
                        'image' => null,
                        'is_active' => true,
                        'is_popular' => false,
                    ],
                    [
                        'name' => 'Intensive Skills Programme',
                        'slug' => 'intensive-skills-programme',
                        'description' => 'Focused programme for older children building specific skills.',
                        'price' => 380.00,
                        'hours' => 20,
                        'duration_weeks' => 4,
                        'features' => ['Small group coaching', 'Personal goals', 'Progress tracking'],
                        'what_to_expect' => 'Higher-intensity sessions with clear, trackable goals.',
                        'requirements' => ['Good baseline fitness', 'Commitment to attend all sessions'],
                        'image' => null,
                        'is_active' => true,
                        'is_popular' => false,
                    ],
                ];

                foreach ($demoPackages as $pkg) {
                    Package::firstOrCreate(
                        ['slug' => $pkg['slug']],
                        $pkg
                    );
                }
            }
            /** @var Package|null $primaryPackage */
            $primaryPackage = Package::first();

            // --- Standard activities (approx. 50 demo records for booking UX) ---
            if (\App\Models\Activity::count() < 40) {
                $activityDefinitions = [
                    // Warm-ups & icebreakers
                    ['name' => 'Name Circle Warm-Up', 'category' => 'warm-up', 'duration' => 0.5],
                    ['name' => 'Traffic Lights Game', 'category' => 'warm-up', 'duration' => 0.5],
                    ['name' => 'Mirror Movements', 'category' => 'warm-up', 'duration' => 0.5],
                    ['name' => 'Follow the Leader', 'category' => 'warm-up', 'duration' => 0.5],
                    ['name' => 'Balance and Freeze', 'category' => 'warm-up', 'duration' => 0.5],
                    // Core movement skills
                    ['name' => 'Agility Ladder Basics', 'category' => 'movement', 'duration' => 0.75],
                    ['name' => 'Cone Weave Drills', 'category' => 'movement', 'duration' => 0.75],
                    ['name' => 'Jump and Land Safely', 'category' => 'movement', 'duration' => 0.75],
                    ['name' => 'Speed and Stop Races', 'category' => 'movement', 'duration' => 0.75],
                    ['name' => 'Single-Leg Balance Challenges', 'category' => 'movement', 'duration' => 0.5],
                    // Ball skills
                    ['name' => 'Rolling and Catching', 'category' => 'ball skills', 'duration' => 0.75],
                    ['name' => 'Target Throwing', 'category' => 'ball skills', 'duration' => 0.75],
                    ['name' => 'Partner Passing', 'category' => 'ball skills', 'duration' => 0.75],
                    ['name' => 'Dribbling Around Cones', 'category' => 'ball skills', 'duration' => 0.75],
                    ['name' => 'Bounce and Catch Circuits', 'category' => 'ball skills', 'duration' => 0.75],
                    // Team games
                    ['name' => 'Small-Sided Team Game', 'category' => 'team games', 'duration' => 1.0],
                    ['name' => 'Relay Races', 'category' => 'team games', 'duration' => 0.75],
                    ['name' => 'Capture the Flag', 'category' => 'team games', 'duration' => 1.0],
                    ['name' => 'Treasure Hunt Challenge', 'category' => 'team games', 'duration' => 1.0],
                    ['name' => 'Traffic Cone Towers', 'category' => 'team games', 'duration' => 0.75],
                    // Strength and conditioning (child-friendly)
                    ['name' => 'Core Strength Circuit', 'category' => 'conditioning', 'duration' => 0.75],
                    ['name' => 'Animal Movement Trail', 'category' => 'conditioning', 'duration' => 0.75],
                    ['name' => 'Balance Beam Practice', 'category' => 'conditioning', 'duration' => 0.75],
                    ['name' => 'Mini Obstacle Course', 'category' => 'conditioning', 'duration' => 1.0],
                    ['name' => 'Stretch and Flex Session', 'category' => 'conditioning', 'duration' => 0.5],
                    // Confidence and communication
                    ['name' => 'Partner Trust Walk', 'category' => 'confidence', 'duration' => 0.5],
                    ['name' => 'Team Problem-Solving Game', 'category' => 'confidence', 'duration' => 0.75],
                    ['name' => 'Show and Tell Skill Share', 'category' => 'confidence', 'duration' => 0.5],
                    ['name' => 'Positive Feedback Circle', 'category' => 'confidence', 'duration' => 0.5],
                    ['name' => 'Goal Setting Check-In', 'category' => 'confidence', 'duration' => 0.5],
                    // Outdoor / adventure style
                    ['name' => 'Nature Trail Walk', 'category' => 'outdoor', 'duration' => 1.0],
                    ['name' => 'Park Circuit Challenge', 'category' => 'outdoor', 'duration' => 1.0],
                    ['name' => 'Mini Orienteering Game', 'category' => 'outdoor', 'duration' => 1.0],
                    ['name' => 'Shadow Tag', 'category' => 'outdoor', 'duration' => 0.75],
                    ['name' => 'Outdoor Relay Stations', 'category' => 'outdoor', 'duration' => 1.0],
                    // Calm down and reflection
                    ['name' => 'Cool-Down Stretching', 'category' => 'cool-down', 'duration' => 0.5],
                    ['name' => 'Breathing and Relaxation', 'category' => 'cool-down', 'duration' => 0.5],
                    ['name' => 'Session Reflection Circle', 'category' => 'cool-down', 'duration' => 0.5],
                    ['name' => 'Gratitude Round', 'category' => 'cool-down', 'duration' => 0.5],
                    ['name' => 'Mindful Movement', 'category' => 'cool-down', 'duration' => 0.5],
                    // Extended projects / longer blocks
                    ['name' => 'Skill Focus Project – Week 1', 'category' => 'project', 'duration' => 1.0],
                    ['name' => 'Skill Focus Project – Week 2', 'category' => 'project', 'duration' => 1.0],
                    ['name' => 'Skill Focus Project – Week 3', 'category' => 'project', 'duration' => 1.0],
                    ['name' => 'End-of-Block Showcase', 'category' => 'project', 'duration' => 1.5],
                    ['name' => 'Family Participation Session', 'category' => 'project', 'duration' => 1.5],
                ];

                foreach ($activityDefinitions as $definition) {
                    $name = $definition['name'];
                    $slug = Str::slug($name);

                    \App\Models\Activity::firstOrCreate(
                        ['slug' => $slug],
                        [
                            'name' => $name,
                            'category' => $definition['category'],
                            'description' => 'Demo standard activity seeded for local testing of the booking and admin dashboards.',
                            'duration' => $definition['duration'],
                            'is_active' => true,
                        ]
                    );
                }
            }

            // --- Services (5 sample published services) ---
            if (Service::count() === 0) {
                $serviceDefinitions = [
                    ['title' => 'After-School Activity Support', 'category' => 'support'],
                    ['title' => 'Weekend Adventure Sessions', 'category' => 'weekend'],
                    ['title' => 'Holiday Camp Coverage', 'category' => 'holiday'],
                    ['title' => 'One-to-One Coaching', 'category' => 'coaching'],
                    ['title' => 'Exam Revision Support', 'category' => 'education'],
                ];

                foreach ($serviceDefinitions as $serviceDef) {
                    $title = $serviceDef['title'];
                    Service::create([
                        'title' => $title,
                        'slug' => Str::slug($title),
                        'summary' => 'Demo service for local admin/testing.',
                        'description' => 'Structured description for ' . $title . ' (demo content).',
                        'body' => '<p>This is demo HTML content for <strong>' . e($title) . '</strong>.</p>',
                        'hero' => [
                            'primary_cta' => [
                                'text' => 'Enquire now',
                                'href' => '/contact',
                            ],
                        ],
                        'content_section' => [
                            'title' => $title . ' – What to expect',
                        ],
                        'cta_section' => [
                            'title' => 'Ready to get started?',
                            'subtitle' => 'This is demo data, safe to discard.',
                            'primary_cta' => [
                                'text' => 'Contact us',
                                'href' => '/contact',
                            ],
                        ],
                        'icon' => 'star',
                        'category' => $serviceDef['category'],
                        'views' => 0,
                        'published' => true,
                        'publish_at' => now()->subDay(),
                    ]);
                }
            }

            // --- Blog categories/tags/posts (5 posts) ---
            $category = BlogCategory::firstOrCreate(
                ['slug' => 'news-updates'],
                [
                    'name' => 'News & Updates',
                    'summary' => 'Platform news and feature updates.',
                    'description' => 'Demo blog category for local content.',
                    'is_active' => true,
                    'display_order' => 1,
                ]
            );

            $tag = BlogTag::firstOrCreate(
                ['slug' => 'demo'],
                [
                    'name' => 'Demo',
                    'description' => 'Demo tag for seeded posts.',
                    'is_active' => true,
                ]
            );

            if (BlogPost::count() < 5) {
                for ($i = 1; $i <= 5; $i++) {
                    $title = "Demo blog post {$i}";
                    $post = BlogPost::create([
                        'category_id' => $category->id,
                        'title' => $title,
                        'slug' => Str::slug($title),
                        'hero_image' => null,
                        'excerpt' => 'This is a short demo excerpt for blog post ' . $i . '.',
                        'content' => '<p>This is demo blog content for post ' . $i . '.</p>',
                        'author_name' => 'Demo Author',
                        'author_role' => 'Content Lead',
                        'author_avatar_url' => null,
                        'is_featured' => $i === 1,
                        'is_published' => true,
                        'published_at' => now()->subDays($i),
                        'scheduled_publish_at' => null,
                        'reading_time' => 3,
                        'views' => 0,
                        'seo' => [
                            'title' => $title,
                            'description' => 'SEO description for ' . $title,
                        ],
                        'hero_metadata' => null,
                        'structured_content' => null,
                    ]);

                    $post->tags()->syncWithoutDetaching([$tag->id => ['display_order' => 1]]);
                }
            }

            // No booking data is seeded here anymore.
        });
    }
}

