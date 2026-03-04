<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Default database seeder. Copy to backend/database/seeders/DatabaseSeeder.php
 * Run: docker compose exec backend php /var/www/html/artisan db:seed
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            PublicPagesSeeder::class,
            ServicesSeeder::class,
            BlogSeeder::class,
        ]);
    }
}
