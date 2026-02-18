#!/bin/bash

# Script to create a trainer account for testing
# Usage: ./scripts/create-trainer-account.sh [email] [password] [name]

set -e

EMAIL="${1:-trainer@example.com}"
PASSWORD="${2:-Trainer123!}"
NAME="${3:-Test Trainer}"

echo "Creating trainer account..."
echo "Email: $EMAIL"
echo "Name: $NAME"
echo ""

# Check if Docker is running
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Create trainer account using artisan command
docker-compose exec -T backend php artisan db:seed --class=TrainerAccountSeeder --force 2>/dev/null || \
docker-compose exec -T backend php -r "
require __DIR__ . '/vendor/autoload.php';
\$app = require_once __DIR__ . '/bootstrap/app.php';
\$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

\$user = User::firstOrCreate(
    ['email' => '$EMAIL'],
    [
        'name' => '$NAME',
        'password' => Hash::make('$PASSWORD'),
        'role' => 'trainer',
        'approval_status' => 'approved',
        'phone' => '+44 7123 456789',
        'address' => '123 Trainer Street',
        'postcode' => 'SW1A 1AA',
    ]
);

if (\$user->wasRecentlyCreated) {
    echo \"✅ Trainer account created successfully!\\n\";
} else {
    echo \"ℹ️  Trainer account already exists. Updating...\\n\";
    \$user->update([
        'name' => '$NAME',
        'password' => Hash::make('$PASSWORD'),
        'role' => 'trainer',
        'approval_status' => 'approved',
    ]);
    echo \"✅ Trainer account updated successfully!\\n\";
}

echo \"User ID: \" . \$user->id . \"\\n\";
echo \"Email: \" . \$user->email . \"\\n\";
echo \"Name: \" . \$user->name . \"\\n\";
echo \"Role: \" . \$user->role . \"\\n\";
echo \"Approval Status: \" . \$user->approval_status . \"\\n\";
echo \"\\n\";
echo \"📝 Login Credentials:\\n\";
echo \"   Email: $EMAIL\\n\";
echo \"   Password: $PASSWORD\\n\";
echo \"\\n\";
echo \"🌐 Access the trainer dashboard at:\\n\";
echo \"   http://localhost:4300/trainer/dashboard\\n\";
echo \"   or\\n\";
echo \"   http://localhost:4300/login\\n\";
"

echo ""
echo "✅ Trainer account creation complete!"
echo ""
echo "📋 Next Steps:"
echo "   1. Go to http://localhost:4300/login"
echo "   2. Login with:"
echo "      Email: $EMAIL"
echo "      Password: $PASSWORD"
echo "   3. You will be redirected to the trainer dashboard"
echo ""
echo "🔗 Direct Dashboard Link:"
echo "   http://localhost:4300/trainer/dashboard"
echo ""
