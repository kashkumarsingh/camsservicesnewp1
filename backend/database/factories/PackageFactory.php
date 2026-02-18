<?php

namespace Database\Factories;

use App\Models\Package;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Package Factory
 * 
 * Clean Architecture: Infrastructure Layer (Testing)
 * Purpose: Creates test instances of Package model
 * Location: backend/database/factories/PackageFactory.php
 */
class PackageFactory extends Factory
{
    protected $model = Package::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->words(3, true);
        $slug = \Illuminate\Support\Str::slug($name);

        $hours = $this->faker->numberBetween(5, 50);
        $durationWeeks = $this->faker->numberBetween(4, 12);
        
        return [
            'name' => ucwords($name),
            'slug' => $slug,
            'description' => $this->faker->paragraph(3),
            'price' => $this->faker->randomFloat(2, 50, 500),
            'hours' => $hours,
            'duration_weeks' => $durationWeeks,
            'age_group' => $this->faker->randomElement(['5-8', '9-12', '13-16', '17+']),
            'difficulty_level' => $this->faker->randomElement(['beginner', 'intermediate', 'advanced']),
            'max_participants' => $this->faker->numberBetween(6, 20),
            'spots_remaining' => function (array $attributes) {
                return $attributes['max_participants'];
            },
            'total_spots' => function (array $attributes) {
                return $attributes['max_participants'];
            },
            'features' => [
                'Feature 1',
                'Feature 2',
                'Feature 3',
            ],
            'what_to_expect' => $this->faker->paragraph(2),
            'requirements' => [
                'Requirement 1',
                'Requirement 2',
            ],
            'image' => $this->faker->imageUrl(800, 600, 'nature'),
            'is_active' => true,
            'is_popular' => $this->faker->boolean(30),
        ];
    }

    /**
     * Indicate that the package is popular.
     */
    public function popular(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_popular' => true,
        ]);
    }

    /**
     * Indicate that the package is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}

