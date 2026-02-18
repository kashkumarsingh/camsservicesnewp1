<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\Package;
use App\Models\Trainer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * Sample Data Seeder
 * 
 * Clean Architecture: Infrastructure/Data Layer
 * Purpose: Creates sample data for testing and development
 * Location: backend/database/seeders/SampleDataSeeder.php
 * 
 * This seeder creates:
 * - Sample trainers matching frontend structure
 * - Sample packages matching frontend structure
 * - Many-to-many relationships between packages and trainers
 */
class SampleDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get any available trainers (from approved trainer applications)
        $availableTrainers = Trainer::where('is_active', true)->get();
        $trainerMap = $availableTrainers->keyBy('slug');

        if ($availableTrainers->isEmpty()) {
            $this->command->warn('⚠️  No active trainers found. Activities will be created without trainer associations.');
            $this->command->info('   💡 Tip: Approve trainer applications in the admin dashboard to create trainers.');
        } else {
            $this->command->info('✅ Found ' . $availableTrainers->count() . ' active trainer(s) for activity associations.');
        }

        // Create Activities (normalized records)
        // Expanded to ~10 activities so each package has a richer activity list for testing.
        $activitiesConfig = [
            'creative-play' => [
                'name' => 'Creative Play',
                'description' => 'Engaging activities designed to stimulate imagination and artistic expression.',
                'image_url' => '/images/activities/creative-play.webp',
                'duration' => 1.0,
                'trainer_slugs' => ['sarah-johnson', 'emma-williams'],
            ],
            'outdoor-exploration' => [
                'name' => 'Outdoor Exploration',
                'description' => 'Guided adventures in nature, fostering curiosity and physical activity.',
                'image_url' => '/images/activities/outdoor-exploration.webp',
                'duration' => 1.5,
                'trainer_slugs' => ['michael-chen', 'sarah-johnson'],
            ],
            'sensory-activities' => [
                'name' => 'Sensory Activities',
                'description' => 'Calming and stimulating activities focused on sensory integration and regulation.',
                'image_url' => '/images/activities/sensory-activities.webp',
                'duration' => 0.5,
                'trainer_slugs' => ['sarah-johnson', 'emma-williams'],
            ],
            'skill-building-games' => [
                'name' => 'Skill-Building Games',
                'description' => 'Fun and educational games to develop cognitive and social skills.',
                'image_url' => '/images/activities/skill-building-games.webp',
                'duration' => 1.5,
                'trainer_slugs' => ['michael-chen', 'emma-williams'],
            ],
            'calm-sensory-room' => [
                'name' => 'Calm Sensory Room',
                'description' => 'Low-arousal sensory time with weighted blankets, soft lighting, and calming music.',
                'image_url' => '/images/activities/calm-sensory-room.webp',
                'duration' => 1.0,
                'trainer_slugs' => ['sarah-johnson'],
            ],
            'social-skills-group' => [
                'name' => 'Social Skills Group',
                'description' => 'Small-group activities to practice turn-taking, sharing, and communication.',
                'image_url' => '/images/activities/social-skills-group.webp',
                'duration' => 1.0,
                'trainer_slugs' => ['michael-chen', 'emma-williams'],
            ],
            'movement-breaks' => [
                'name' => 'Movement Breaks',
                'description' => 'Structured movement and regulation breaks to support focus and body awareness.',
                'image_url' => '/images/activities/movement-breaks.webp',
                'duration' => 0.5,
                'trainer_slugs' => ['sarah-johnson', 'michael-chen'],
            ],
            'homework-support' => [
                'name' => 'Homework Support',
                'description' => 'Quiet, structured time to complete homework with mentor support and encouragement.',
                'image_url' => '/images/activities/homework-support.webp',
                'duration' => 1.0,
                'trainer_slugs' => ['michael-chen'],
            ],
            'community-outing' => [
                'name' => 'Community Outing',
                'description' => 'Supported trips to parks, shops or museums to build confidence in the community.',
                'image_url' => '/images/activities/community-outing.webp',
                'duration' => 2.0,
                'trainer_slugs' => ['sarah-johnson', 'emma-williams'],
            ],
            'indoor-board-games' => [
                'name' => 'Indoor Board Games',
                'description' => 'Turn-based games that support emotional regulation and flexible thinking.',
                'image_url' => '/images/activities/indoor-board-games.webp',
                'duration' => 1.0,
                'trainer_slugs' => ['emma-williams'],
            ],
        ];

        $activities = [];
        foreach ($activitiesConfig as $slug => $config) {
            $activity = Activity::updateOrCreate(
                ['slug' => $slug],
                [
                    'name' => $config['name'],
                    'description' => $config['description'],
                    'image_url' => $config['image_url'],
                    'duration' => $config['duration'],
                    'difficulty_level' => 'beginner',
                    'age_group_min' => 5,
                    'age_group_max' => 12,
                    'is_active' => true,
                ]
            );

            // Associate trainers with activities (if trainers exist)
            // NOTE: trainer_slugs are ignored - we use any available trainers instead
            // This allows SampleDataSeeder to work without fake trainers
            if ($availableTrainers->isNotEmpty()) {
                $trainerSync = [];
                foreach ($availableTrainers->take(2) as $index => $trainer) {
                    $trainerSync[$trainer->id] = ['is_primary' => $index === 0];
                }
                $activity->trainers()->sync($trainerSync);
            }

            $activities[$slug] = $activity;
        }

        // Create Sample Package (Mars Package - matching frontend)
        $package1 = Package::updateOrCreate(
            ['slug' => 'mars'],
            $this->packagePayload([
                'name' => 'Mars',
                'description' => 'Blast off on an amazing adventure to Mars! This package is perfect for young explorers ready to discover new skills and make friends. Get ready for exciting missions, creative challenges, and a super supportive crew to guide you every step of the way!',
                'price' => 135.00,
                'hours' => 18,
                'duration_weeks' => 6,
                'hours_per_week' => 3,
                'age_group' => '5-12 years',
                'difficulty_level' => 'beginner',
                'max_participants' => 12,
                'spots_remaining' => 5,
                'total_spots' => 12,
                'features' => [
                    'Dedicated trained staff',
                    'Activity costs included',
                    'Healthy snacks provided',
                    'Written session reports',
                    'Flexible scheduling',
                ],
                'perks' => [
                    'Healthy Snacks Provided',
                    'Certificate of Completion',
                ],
                'what_to_expect' => 'Children will engage in a variety of activities including creative play, outdoor exploration, and sensory activities. Each session is designed to be fun, engaging, and supportive, helping children build confidence and social skills.',
                'requirements' => [
                    'Comfortable clothing for activities',
                    'Water bottle',
                    'Any specific medical information if applicable',
                ],
                'image' => '/images/packages/mars.jpg',
                'color' => 'from-red-500 to-orange-500',
                'is_active' => true,
                'is_popular' => true,
                'views' => 0,
            ])
        );

        // Create Sample Package (Earth Package - matching frontend)
        $package2 = Package::updateOrCreate(
            ['slug' => 'earth'],
            $this->packagePayload([
                'name' => 'Earth',
                'description' => 'The Earth package offers an extended level of support with more hours and a wider range of activities. It is ideal for children who require more intensive support to thrive.',
                'price' => 265.00,
                'hours' => 36,
                'duration_weeks' => 6,
                'hours_per_week' => 6,
                'age_group' => '5-12 years',
                'difficulty_level' => 'intermediate',
                'max_participants' => 10,
                'spots_remaining' => 3,
                'total_spots' => 10,
                'features' => [
                    'Extended support hours',
                    'Wider range of activities',
                    'Smaller group sizes',
                    'Personalized attention',
                    'Progress tracking',
                ],
                'perks' => [
                    'All Mars features',
                    'Extended support time',
                    'Multiple activities',
                    'Progress tracking',
                    'Priority booking',
                ],
                'what_to_expect' => 'This extended package provides more intensive support with additional hours per week. Children will benefit from a wider variety of activities and more personalized attention from our experienced trainers.',
                'requirements' => [
                    'Comfortable clothing for various activities',
                    'Water bottle',
                    'Medical information form completed',
                ],
                'image' => '/images/packages/earth.jpg',
                'color' => 'from-blue-500 to-green-500',
                'is_active' => true,
                'is_popular' => false,
                'views' => 0,
            ])
        );

        // Create Sample Package (Venus Package - matching frontend)
        $package3 = Package::updateOrCreate(
            ['slug' => 'venus'],
            $this->packagePayload([
                'name' => 'Venus',
                'description' => 'The Venus package provides a balanced approach with moderate hours and diverse activities. Perfect for families looking for comprehensive support without overwhelming schedules.',
                'price' => 200.00,
                'hours' => 27,
                'duration_weeks' => 6,
                'hours_per_week' => 4.5,
                'age_group' => '5-12 years',
                'difficulty_level' => 'beginner',
                'max_participants' => 11,
                'spots_remaining' => 4,
                'total_spots' => 11,
                'features' => [
                    'Balanced support hours',
                    'Diverse activity range',
                    'Small group sizes',
                    'Regular progress updates',
                    'Flexible scheduling',
                ],
                'perks' => [
                    'All Mars features',
                    'Additional activity options',
                    'Progress reports',
                    'Parent consultation included',
                ],
                'what_to_expect' => 'The Venus package offers a balanced mix of activities and support hours. Children will participate in creative play, outdoor exploration, and sensory activities, with regular progress updates and parent consultations.',
                'requirements' => [
                    'Comfortable clothing for activities',
                    'Water bottle',
                    'Completed registration form',
                ],
                'image' => '/images/packages/venus.jpg',
                'color' => 'from-purple-500 to-pink-500',
                'is_active' => true,
                'is_popular' => true,
                'views' => 0,
            ])
        );

        // Fix Saturn package if it exists (ensure it has required fields)
        $saturnPackage = Package::where('slug', 'saturn')->first();
        if ($saturnPackage) {
            $saturnUpdate = [
                'perks' => $saturnPackage->perks ?: [
                    'All Earth features',
                    'Comprehensive support',
                    'Specialized activities',
                    'Detailed progress reports',
                    'Dedicated coordinator',
                ],
                'color' => $saturnPackage->color ?: 'from-yellow-500 to-orange-500',
            ];

            $saturnPackage->update($saturnUpdate);
        }

        // Create Many-to-Many Relationships
        // Note: Trainers are associated with activities, not packages directly (package_trainer table was dropped)
        if ($availableTrainers->isNotEmpty()) {
            $trainerIds = $availableTrainers->pluck('id')->toArray();
            
            // Mars package: Associate with activities
            $package1->activities()->sync([
                $activities['creative-play']->id => ['order' => 0],
                $activities['outdoor-exploration']->id => ['order' => 1],
                $activities['sensory-activities']->id => ['order' => 2],
                $activities['skill-building-games']->id => ['order' => 3],
                $activities['calm-sensory-room']->id => ['order' => 4],
                $activities['movement-breaks']->id => ['order' => 5],
                $activities['indoor-board-games']->id => ['order' => 6],
            ]);
            
            // Earth package: Associate with activities
            $package2->activities()->sync([
                $activities['creative-play']->id => ['order' => 0],
                $activities['outdoor-exploration']->id => ['order' => 1],
                $activities['sensory-activities']->id => ['order' => 2],
                $activities['social-skills-group']->id => ['order' => 3],
                $activities['homework-support']->id => ['order' => 4],
                $activities['movement-breaks']->id => ['order' => 5],
                $activities['community-outing']->id => ['order' => 6],
            ]);
            
            // Venus package: Associate with activities
            $package3->activities()->sync([
                $activities['creative-play']->id => ['order' => 0],
                $activities['outdoor-exploration']->id => ['order' => 1],
                $activities['sensory-activities']->id => ['order' => 2],
                $activities['skill-building-games']->id => ['order' => 3],
                $activities['social-skills-group']->id => ['order' => 4],
                $activities['calm-sensory-room']->id => ['order' => 5],
                $activities['community-outing']->id => ['order' => 6],
                $activities['indoor-board-games']->id => ['order' => 7],
            ]);
        } else {
            // If no trainers, just create package-activity relationships
            $package1->activities()->sync([
                $activities['creative-play']->id => ['order' => 0],
                $activities['outdoor-exploration']->id => ['order' => 1],
                $activities['sensory-activities']->id => ['order' => 2],
                $activities['skill-building-games']->id => ['order' => 3],
                $activities['calm-sensory-room']->id => ['order' => 4],
                $activities['movement-breaks']->id => ['order' => 5],
                $activities['indoor-board-games']->id => ['order' => 6],
            ]);
            
            $package2->activities()->sync([
                $activities['creative-play']->id => ['order' => 0],
                $activities['outdoor-exploration']->id => ['order' => 1],
                $activities['sensory-activities']->id => ['order' => 2],
                $activities['social-skills-group']->id => ['order' => 3],
                $activities['homework-support']->id => ['order' => 4],
                $activities['movement-breaks']->id => ['order' => 5],
                $activities['community-outing']->id => ['order' => 6],
            ]);
            
            $package3->activities()->sync([
                $activities['creative-play']->id => ['order' => 0],
                $activities['outdoor-exploration']->id => ['order' => 1],
                $activities['sensory-activities']->id => ['order' => 2],
                $activities['skill-building-games']->id => ['order' => 3],
                $activities['social-skills-group']->id => ['order' => 4],
                $activities['calm-sensory-room']->id => ['order' => 5],
                $activities['community-outing']->id => ['order' => 6],
                $activities['indoor-board-games']->id => ['order' => 7],
            ]);
        }

        $this->command->info('✅ Sample data created successfully!');
        $this->command->info('   - ' . count($activities) . ' Activities created');
        $this->command->info('   - 3 Packages created (Mars, Earth, Venus)');
        $this->command->info('   - Saturn package fixed (if exists)');
        if ($availableTrainers->isNotEmpty()) {
            $this->command->info('   - Package-Trainer relationships established (' . $availableTrainers->count() . ' trainer(s))');
        } else {
            $this->command->info('   - ⚠️  No trainers found - Package-Trainer relationships skipped');
        }
        $this->command->info('   - Package-Activity relationships established');
    }

    private function packagePayload(array $payload): array
    {
        if (Schema::hasColumn('packages', 'hours_per_week')) {
            if (! array_key_exists('hours_per_week', $payload) || $payload['hours_per_week'] === null) {
                $payload['hours_per_week'] = $this->calculateHoursPerWeek(
                    $payload['hours'] ?? null,
                    $payload['duration_weeks'] ?? null,
                );
            } else {
                $payload['hours_per_week'] = round((float) $payload['hours_per_week'], 1);
            }
        } else {
            unset($payload['hours_per_week']);
        }

        return $payload;
    }

    private function calculateHoursPerWeek(?int $hours, ?int $durationWeeks): ?float
    {
        if (empty($hours) || empty($durationWeeks)) {
            return null;
        }

        return round($hours / $durationWeeks, 1);
    }
}
