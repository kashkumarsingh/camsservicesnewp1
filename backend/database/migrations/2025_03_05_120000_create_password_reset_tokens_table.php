<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Password reset tokens for Laravel's Password broker (forgot/reset password).
     * Required when config auth.passwords.users.driver is 'database'.
     *
     * Move to database/migrations/ then run: php artisan migrate
     * Docker: mv backend/2025_03_05_120000_create_password_reset_tokens_table.php backend/database/migrations/ && docker compose exec backend php artisan migrate
     *
     * @see https://laravel.com/docs/12.x/passwords
     */
    public function up(): void
    {
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('password_reset_tokens');
    }
};
