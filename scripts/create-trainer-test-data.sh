#!/bin/bash

# Script to create test bookings and schedules for trainer testing
# Usage: ./scripts/create-trainer-test-data.sh [trainer_email]

set -e

TRAINER_EMAIL="${1:-trainer@example.com}"

echo "Creating test bookings and schedules for trainer..."
echo "Trainer Email: $TRAINER_EMAIL"
echo ""

# Check if Docker is running
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

docker-compose exec -T backend php -r "
require __DIR__ . '/vendor/autoload.php';
\$app = require_once __DIR__ . '/bootstrap/app.php';
\$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Trainer;
use App\Models\Booking;
use App\Models\BookingSchedule;
use App\Models\Package;
use App\Models\BookingParticipant;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

// Get trainer
\$user = User::where('email', '$TRAINER_EMAIL')->first();
if (!\$user) {
    echo \"❌ User not found: $TRAINER_EMAIL\\n\";
    exit(1);
}

\$trainer = Trainer::where('user_id', \$user->id)->first();
if (!\$trainer) {
    echo \"Creating trainer profile...\\n\";
    \$trainer = Trainer::create([
        'user_id' => \$user->id,
        'name' => \$user->name,
        'slug' => strtolower(str_replace(' ', '-', \$user->name)),
        'role' => 'trainer',
        'bio' => 'Test trainer',
        'is_active' => true,
    ]);
}

echo \"Trainer ID: \" . \$trainer->id . \"\\n\";
echo \"\\n\";

// Get or create a parent user for bookings
\$parentUser = User::where('role', 'parent')->first();
if (!\$parentUser) {
    echo \"Creating parent user...\\n\";
    \$parentUser = User::create([
        'name' => 'Test Parent',
        'email' => 'parent@example.com',
        'password' => \Hash::make('Password123!'),
        'role' => 'parent',
        'approval_status' => 'approved',
        'phone' => '+44 7123 456789',
        'postcode' => 'SW1A 1AA',
    ]);
}

// Get or create a package
\$package = Package::where('is_active', true)->first();
if (!\$package) {
    echo \"⚠️  No active packages found. Creating test package...\\n\";
    \$package = Package::create([
        'name' => 'Test Package',
        'slug' => 'test-package',
        'description' => 'Test package for trainer dashboard',
        'price' => 100.00,
        'total_hours' => 10,
        'is_active' => true,
        'is_popular' => false,
    ]);
}

echo \"Package ID: \" . \$package->id . \"\\n\";
echo \"\\n\";

// Create a booking
\$booking = Booking::create([
    'user_id' => \$parentUser->id,
    'package_id' => \$package->id,
    'reference' => 'TEST-' . strtoupper(uniqid()),
    'status' => 'confirmed',
    'payment_status' => 'paid',
    'total_amount' => \$package->price,
    'paid_amount' => \$package->price,
    'paid_at' => now(),
]);

echo \"✅ Created booking: \" . \$booking->reference . \"\\n\";

// Create a participant (child)
\$participant = BookingParticipant::create([
    'booking_id' => \$booking->id,
    'name' => 'Test Child',
    'age' => 8,
    'order' => 0,
]);

echo \"✅ Created participant: \" . \$participant->name . \"\\n\";
echo \"\\n\";

// Create schedules (sessions) for the next few days
\$dates = [
    Carbon::today()->addDays(1), // Tomorrow
    Carbon::today()->addDays(3), // Day after tomorrow
    Carbon::today()->addDays(5), // 5 days from now
];

echo \"Creating schedules...\\n\";
foreach (\$dates as \$index => \$date) {
    \$schedule = BookingSchedule::create([
        'booking_id' => \$booking->id,
        'date' => \$date->toDateString(),
        'start_time' => '14:00:00',
        'end_time' => '16:00:00',
        'trainer_id' => \$trainer->id,
        'duration_hours' => 2.0,
        'status' => 'scheduled',
        'booked_by' => 'admin',
        'order' => \$index,
    ]);
    
    echo \"   ✅ Schedule \" . \$schedule->id . \": \" . \$date->format('D, M j') . \" 2pm-4pm\\n\";
}

echo \"\\n\";
echo \"✅ Test data created successfully!\\n\";
echo \"\\n\";
echo \"📋 Summary:\\n\";
echo \"   Booking Reference: \" . \$booking->reference . \"\\n\";
echo \"   Package: \" . \$package->name . \"\\n\";
echo \"   Participant: \" . \$participant->name . \"\\n\";
echo \"   Schedules Created: \" . count(\$dates) . \"\\n\";
echo \"   Trainer: \" . \$trainer->name . \"\\n\";
echo \"\\n\";
echo \"🌐 View in trainer dashboard:\\n\";
echo \"   http://localhost:4300/trainer/dashboard\\n\";
"

echo ""
echo "✅ Test data creation complete!"
echo ""
echo "📋 Next Steps:"
echo "   1. Refresh the trainer dashboard: http://localhost:4300/trainer/dashboard"
echo "   2. You should now see:"
echo "      - Sessions in the Calendar tab"
echo "      - Bookings in the Bookings tab"
echo ""
