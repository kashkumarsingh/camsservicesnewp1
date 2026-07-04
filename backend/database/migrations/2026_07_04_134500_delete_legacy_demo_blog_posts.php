<?php

use App\Services\Blog\PurgeLegacyDemoBlogPosts;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        app(PurgeLegacyDemoBlogPosts::class)->execute();
    }

    public function down(): void
    {
        // Demo posts are intentionally not restored.
    }
};
