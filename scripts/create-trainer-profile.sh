#!/bin/bash

# Script to create a Trainer profile for a user
# Usage: ./scripts/create-trainer-profile.sh [user_email]

set -e

EMAIL="${1:-trainer@example.com}"

echo "Creating Trainer profile for user: $EMAIL"
echo ""

# Check if Docker is running
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Create Trainer profile using artisan command
docker-compose exec -T backend php -r "
require __DIR__ . '/vendor/autoload.php';
\$app = require_once __DIR__ . '/bootstrap/app.php';
\$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Trainer;
use Illuminate\Support\Str;

\$user = User::where('email', '$EMAIL')->first();

if (!\$user) {
    echo \"❌ User not found: $EMAIL\\n\";
    exit(1);
}

if (\$user->role !== 'trainer') {
    echo \"⚠️  User role is '\" . \$user->role . \"', not 'trainer'. Updating role...\\n\";
    \$user->update(['role' => 'trainer']);
}

// Check if Trainer profile already exists
\$trainer = Trainer::where('user_id', \$user->id)->first();

if (\$trainer) {
    echo \"ℹ️  Trainer profile already exists for this user.\\n\";
    echo \"Trainer ID: \" . \$trainer->id . \"\\n\";
    echo \"User ID: \" . \$trainer->user_id . \"\\n\";
    exit(0);
}

// Create Trainer profile
\$trainer = Trainer::create([
    'user_id' => \$user->id,
    'name' => \$user->name,
    'slug' => Str::slug(\$user->name . '-' . \$user->id),
    'role' => 'trainer',
    'bio' => 'Trainer profile for ' . \$user->name,
    'is_active' => true,
    'is_featured' => false,
    'views' => 0,
]);

echo \"✅ Trainer profile created successfully!\\n\";
echo \"Trainer ID: \" . \$trainer->id . \"\\n\";
echo \"User ID: \" . \$trainer->user_id . \"\\n\";
echo \"Name: \" . \$trainer->name . \"\\n\";
echo \"Slug: \" . \$trainer->slug . \"\\n\";
"

echo ""
echo "✅ Trainer profile creation complete!"
echo ""

