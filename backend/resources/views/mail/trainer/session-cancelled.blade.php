@component('mail.layouts.cams', [
    'title' => 'Session Cancelled',
    'preview' => 'A session has been cancelled.',
])
    <p style="margin:0 0 16px 0;font-size:16px;color:#111827;">Hi {{ $schedule->trainer->user->first_name ?? 'Trainer' }},</p>
    <p style="margin:0 0 16px 0;font-size:15px;color:#374151;">
        This is to inform you that a session has been cancelled.
    </p>

    <div style="margin:24px 0;padding:20px;background-color:#fef2f2;border-radius:8px;border-left:4px solid #ef4444;">
        <p style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:#991b1b;">
            Cancelled Session Details
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#7f1d1d;">
            <strong>Date:</strong> {{ $scheduleDate }}
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#7f1d1d;">
            <strong>Time:</strong> {{ $scheduleTime }}
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#7f1d1d;">
            <strong>Package:</strong> {{ $packageName }}
        </p>
        @if($reason)
        <p style="margin:8px 0 0 0;font-size:15px;color:#7f1d1d;">
            <strong>Reason:</strong> {{ $reason }}
        </p>
        @endif
    </div>

    <p style="margin:16px 0 0 0;font-size:15px;color:#374151;">
        Booking Reference: <strong>{{ $booking->reference }}</strong>
    </p>

    <p style="margin:24px 0 12px 0;text-align:center;">
        <a href="{{ config('app.url') }}/trainer/bookings" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#0f172a,#1d4ed8);color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">View Other Sessions</a>
    </p>

    <p style="margin:0;font-size:15px;color:#374151;">
        — Team CAMS Services
    </p>
@endcomponent
