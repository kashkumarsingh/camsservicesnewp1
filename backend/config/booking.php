<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Trainer availability (calendar dates)
    |--------------------------------------------------------------------------
    | Single source of truth for date-range limits used by Get/Set
    | TrainerAvailabilityDatesAction. Trainer and admin APIs both use these.
    */
    'availability_date_range_max_days' => (int) env('BOOKING_AVAILABILITY_MAX_DAYS', 93),

    /*
    |--------------------------------------------------------------------------
    | Schedule assignment flow
    |--------------------------------------------------------------------------
    | - unassigned_first: New sessions are created with no trainer; they appear
    |   in Admin Schedule under "Unassigned". Admin assigns by dropping/selecting
    |   a trainer (admin sees trainer availability on the timeline). Trainer is
    |   notified when admin assigns.
    | - auto_assign: System auto-assigns a trainer (intelligent matching + optional
    |   trainer confirm/decline). Use when you want less admin workload.
    */
    'schedule_assignment_flow' => env('BOOKING_SCHEDULE_FLOW', 'unassigned_first'),

    /*
    |--------------------------------------------------------------------------
    | Trainer confirmation timeout (hours)
    |--------------------------------------------------------------------------
    | When a session is auto-assigned and the trainer must confirm (no auto-accept),
    | if they neither confirm nor decline within this many hours, the session is
    | escalated: same as decline (try next trainer or notify admin).
    */
    'trainer_confirmation_timeout_hours' => (int) env('BOOKING_TRAINER_CONFIRMATION_TIMEOUT_HOURS', 24),

    /*
    |--------------------------------------------------------------------------
    | Booking validation messages (single source of truth)
    |--------------------------------------------------------------------------
    | New business rule: tomorrow only bookable until 6:00 PM today.
    | Change the message here; PackageConstraintValidator and StoreBookingScheduleRequest use these.
    */
    'messages' => [
        'tomorrow_only_until_6pm' => 'Tomorrow is only bookable until 6:00 PM today.',
        'tomorrow_after_cutoff' => 'Booking for tomorrow is only available until 6:00 PM today. Please select :date or later.',
        'same_day' => 'Same-day bookings are not allowed. Tomorrow is only bookable until 6:00 PM today. The earliest available booking date is :date.',
        'time_too_soon' => 'Tomorrow is only bookable until 6:00 PM today. The earliest available booking time is :time.',
        'start_time_too_soon' => 'This session start time is less than 24 hours away. Tomorrow is only bookable until 6:00 PM today.',
        'date_after' => 'Same-day bookings are not allowed. Tomorrow is only bookable until 6:00 PM today. Please select tomorrow or a future date.',
        'date_24_hour_advance' => 'Tomorrow is only bookable until 6:00 PM today.',
    ],
];
