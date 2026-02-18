<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            StaticPagesSeeder::class, // Home, about, and other CMS pages (required for GET /api/v1/pages/home)
            ChildPermissionsSeeder::class,
            LocalDemoSeeder::class,
        ]);
    }
}


