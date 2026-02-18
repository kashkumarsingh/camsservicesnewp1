<?php
/**
 * One-off script: set password for a user by email (e.g. gemma.stone001@example.com).
 * Run from repo root: docker compose exec backend php set_trainer_password.php
 * (Container CWD is backend, so script path is ./set_trainer_password.php)
 */

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$email = 'gemma.stone001@example.com';
$password = 'password';

$user = User::where('email', $email)->first();

if (!$user) {
    echo "User not found: {$email}\n";
    echo "Create the user first in the app or run in tinker:\n";
    echo "  \$user = User::create(['name' => 'Gemma Stone', 'email' => '{$email}', 'password' => Hash::make('{$password}'), 'role' => 'trainer', 'approval_status' => 'approved']);\n";
    exit(1);
}

$user->password = Hash::make($password);
$user->save();
echo "Password updated for {$email}. You can now log in with password: {$password}\n";
