@component('mail.layouts.cams', [
    'title' => 'Session Confirmed',
    'preview' => 'Your session activities have been confirmed.',
])
    <p style="margin:0 0 16px 0;font-size:16px;color:#111827;">Hi {{ $booking->parent_first_name }},</p>
    <p style="margin:0 0 16px 0;font-size:15px;color:#374151;">
        Great news! Your session activities have been confirmed by your trainer.
    </p>

    <div style="margin:24px 0;padding:20px;background-color:#f0f9ff;border-radius:8px;border-left:4px solid #0ea5e9;">
        <p style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:#0c4a6e;">
            Session Details
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#075985;">
            <strong>Date:</strong> {{ $scheduleDate }}
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#075985;">
            <strong>Time:</strong> {{ $scheduleTime }}
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#075985;">
            <strong>Activities:</strong> {{ $activityNames }}
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#075985;">
            <strong>Children:</strong> {{ $childNames }}
        </p>
        <p style="margin:0;font-size:15px;color:#075985;">
            <strong>Trainer:</strong> {{ $trainerName }}
        </p>
    </div>

    <p style="margin:16px 0 0 0;font-size:15px;color:#374151;">
        Your booking reference is: <strong>{{ $reference }}</strong>
    </p>

    <p style="margin:24px 0 12px 0;text-align:center;">
        <a href="{{ config('services.frontend.url', env('FRONTEND_URL', config('app.url'))) }}/dashboard/bookings" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#0f172a,#1d4ed8);color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">View Booking</a>
    </p>

    <p style="margin:0;font-size:15px;color:#374151;">
        — Team CAMS Services
    </p>
@endcomponent
