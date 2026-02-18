#!/bin/bash

# Script to assign a trainer to an existing booking schedule for testing
# Usage: ./scripts/assign-trainer-to-booking.sh [trainer_email] [booking_id] [schedule_id]

set -e

TRAINER_EMAIL="${1:-trainer@example.com}"
BOOKING_ID="${2}"
SCHEDULE_ID="${3}"

echo "Assigning trainer to booking schedule..."
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

// Get trainer
\$user = User::where('email', '$TRAINER_EMAIL')->first();
if (!\$user) {
    echo \"❌ User not found: $TRAINER_EMAIL\\n\";
    exit(1);
}

\$trainer = Trainer::where('user_id', \$user->id)->first();
if (!\$trainer) {
    echo \"❌ Trainer profile not found for user: $TRAINER_EMAIL\\n\";
    echo \"Creating trainer profile...\\n\";
    \$trainer = Trainer::create([
        'user_id' => \$user->id,
        'name' => \$user->name,
        'slug' => strtolower(str_replace(' ', '-', \$user->name)),
        'role' => 'trainer',
        'bio' => 'Test trainer',
        'is_active' => true,
    ]);
    echo \"✅ Trainer profile created!\\n\";
}

echo \"Trainer ID: \" . \$trainer->id . \"\\n\";
echo \"Trainer Name: \" . \$trainer->name . \"\\n\";
echo \"\\n\";

// If booking_id and schedule_id provided, assign to specific schedule
if ('$BOOKING_ID' && '$SCHEDULE_ID') {
    \$schedule = BookingSchedule::find('$SCHEDULE_ID');
    if (!\$schedule) {
        echo \"❌ Schedule not found: $SCHEDULE_ID\\n\";
        exit(1);
    }
    
    \$schedule->update(['trainer_id' => \$trainer->id]);
    echo \"✅ Assigned trainer to schedule $SCHEDULE_ID\\n\";
    echo \"   Booking ID: \" . \$schedule->booking_id . \"\\n\";
    echo \"   Date: \" . \$schedule->date . \"\\n\";
    echo \"   Time: \" . \$schedule->start_time . \" - \" . \$schedule->end_time . \"\\n\";
    exit(0);
}

// Otherwise, find first available schedule and assign
\$schedules = BookingSchedule::whereNull('trainer_id')
    ->where('status', 'scheduled')
    ->where('date', '>=', now()->toDateString())
    ->with('booking')
    ->orderBy('date')
    ->orderBy('start_time')
    ->limit(5)
    ->get();

if (\$schedules->isEmpty()) {
    echo \"⚠️  No unassigned schedules found. Checking all schedules...\\n\";
    \$allSchedules = BookingSchedule::where('status', 'scheduled')
        ->where('date', '>=', now()->toDateString())
        ->with('booking')
        ->orderBy('date')
        ->orderBy('start_time')
        ->limit(5)
        ->get();
    
    if (\$allSchedules->isEmpty()) {
        echo \"❌ No scheduled sessions found in database.\\n\";
        echo \"\\n\";
        echo \"💡 To create test bookings:\\n\";
        echo \"   1. Login as a parent at http://localhost:4300/login\\n\";
        echo \"   2. Create a booking with sessions\\n\";
        echo \"   3. Run this script again\\n\";
        exit(1);
    }
    
    echo \"Found \" . \$allSchedules->count() . \" scheduled sessions (some may already have trainers)\\n\";
    echo \"\\n\";
    echo \"Assigning trainer to first available schedule...\\n\";
    
    \$schedule = \$allSchedules->first();
    \$schedule->update(['trainer_id' => \$trainer->id]);
    
    echo \"✅ Assigned trainer to schedule \" . \$schedule->id . \"\\n\";
    echo \"   Booking ID: \" . \$schedule->booking_id . \"\\n\";
    echo \"   Booking Reference: \" . \$schedule->booking->reference . \"\\n\";
    echo \"   Date: \" . \$schedule->date . \"\\n\";
    echo \"   Time: \" . \$schedule->start_time . \" - \" . \$schedule->end_time . \"\\n\";
    echo \"\\n\";
    echo \"📋 You can now see this booking in the trainer dashboard:\\n\";
    echo \"   http://localhost:4300/trainer/dashboard\\n\";
    exit(0);
}

echo \"Found \" . \$schedules->count() . \" unassigned schedules\\n\";
echo \"\\n\";
echo \"Assigning trainer to first schedule...\\n\";

\$schedule = \$schedules->first();
\$schedule->update(['trainer_id' => \$trainer->id]);

echo \"✅ Assigned trainer to schedule \" . \$schedule->id . \"\\n\";
echo \"   Booking ID: \" . \$schedule->booking_id . \"\\n\";
echo \"   Booking Reference: \" . \$schedule->booking->reference . \"\\n\";
echo \"   Date: \" . \$schedule->date . \"\\n\";
echo \"   Time: \" . \$schedule->start_time . \" - \" . \$schedule->end_time . \"\\n\";
echo \"\\n\";

// Assign to a few more schedules for testing
if (\$schedules->count() > 1) {
    echo \"Assigning to additional schedules for testing...\\n\";
    \$schedules->slice(1, 2)->each(function (\$s) use (\$trainer) {
        \$s->update(['trainer_id' => \$trainer->id]);
        echo \"   ✅ Schedule \" . \$s->id . \" - \" . \$s->date . \" \" . \$s->start_time . \"\\n\";
    });
}

echo \"\\n\";
echo \"📋 You can now see these bookings in the trainer dashboard:\\n\";
echo \"   http://localhost:4300/trainer/dashboard\\n\";
"

echo ""
echo "✅ Assignment complete!"
echo ""
echo "📋 Next Steps:"
echo "   1. Refresh the trainer dashboard: http://localhost:4300/trainer/dashboard"
echo "   2. You should now see bookings and sessions in the Calendar and Bookings tabs"
echo ""
