<?php
/**
 * One-off script: create or update the admin user (admin@camsservices.co.uk).
 * Run from repo root: docker compose exec backend php /var/www/html/create_admin_user.php
 */

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$email = 'admin@camsservices.co.uk';
$password = 'password';
$name = 'Admin';

$user = User::where('email', $email)->first();

if ($user) {
    $user->password = Hash::make($password);
    $user->name = $name;
    $user->role = 'admin';
    $user->email_verified_at = $user->email_verified_at ?? now();
    $user->save();
    echo "Admin updated. Log in with: {$email} / {$password}\n";
} else {
    User::create([
        'name' => $name,
        'email' => $email,
        'password' => Hash::make($password),
        'role' => 'admin',
        'email_verified_at' => now(),
    ]);
    echo "Admin created. Log in with: {$email} / {$password}\n";
}
