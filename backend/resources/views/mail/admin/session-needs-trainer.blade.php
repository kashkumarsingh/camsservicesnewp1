@component('mail.layouts.cams', [
    'title' => 'Session Needs Trainer Assignment',
    'preview' => 'A session has been booked without a trainer and requires assignment.',
])
    <p style="margin:0 0 16px 0;font-size:16px;color:#111827;">Hello Admin,</p>
    <p style="margin:0 0 16px 0;font-size:15px;color:#374151;">
        <strong>Action Required:</strong> A session has been booked with <strong>"No preference"</strong> trainer selection. The parent has chosen to let you assign the best trainer match. Please assign a trainer to this session.
    </p>

    <div style="margin:24px 0;padding:20px;background-color:#fef3c7;border-radius:8px;border-left:4px solid #f59e0b;">
        <p style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:#78350f;">
            Session Details
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#92400e;">
            <strong>Date:</strong> {{ $scheduleDate }}
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#92400e;">
            <strong>Time:</strong> {{ $scheduleTime }}
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#92400e;">
            <strong>Package:</strong> {{ $packageName }}
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#92400e;">
            <strong>Children:</strong> {{ $childNames }}
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#92400e;">
            <strong>Parent:</strong> {{ $parentName }}
        </p>
        <p style="margin:0;font-size:15px;color:#92400e;">
            <strong>Booking Reference:</strong> {{ $reference }}
        </p>
    </div>

    <p style="margin:24px 0 12px 0;text-align:center;">
        <a href="{{ config('app.url') }}/admin/bookings/{{ $booking->id }}?activeRelationManager=0&activeRelationManagerTab=0" style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#0f172a,#1d4ed8);color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">🎯 Assign Trainer Now</a>
    </p>
    <p style="margin:8px 0 0 0;text-align:center;font-size:13px;color:#6b7280;">
        Click the button above to go directly to the booking. Then click <strong>"Assign Trainer"</strong> on the session row.
    </p>

    <p style="margin:0;font-size:15px;color:#374151;">
        — CAMS Services Admin
    </p>
@endcomponent
