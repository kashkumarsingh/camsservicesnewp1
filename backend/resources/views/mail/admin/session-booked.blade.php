@component('mail.layouts.cams', [
    'title' => 'New Session Booked',
    'preview' => 'A parent has booked a new session. Review and assign trainer if needed.',
])
    <p style="margin:0 0 16px 0;font-size:16px;color:#111827;">Hello Admin,</p>
    <p style="margin:0 0 16px 0;font-size:15px;color:#374151;">
        <strong>New Session Booked!</strong> A parent has successfully booked a new session. Please review the details below{{ $needsTrainer ? ' and assign a trainer.' : '.' }}
    </p>

    @if($needsTrainer)
    <div style="margin:24px 0;padding:20px;background-color:#fef3c7;border-radius:8px;border-left:4px solid#f59e0b;">
        <p style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:#78350f;">
            ⚠️ Action Required: Trainer Assignment Needed
        </p>
        <p style="margin:0;font-size:15px;color:#92400e;">
            This session was booked with <strong>"No preference"</strong> trainer selection. Please assign a suitable trainer.
        </p>
    </div>
    @endif

    <div style="margin:24px 0;padding:20px;background-color:#f0f9ff;border-radius:8px;border-left:4px solid #0284c7;">
        <p style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:#075985;">
            Session Details
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#0c4a6e;">
            <strong>Date:</strong> {{ $scheduleDate }}
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#0c4a6e;">
            <strong>Time:</strong> {{ $scheduleTime }}
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#0c4a6e;">
            <strong>Duration:</strong> {{ $duration }}
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#0c4a6e;">
            <strong>Activity:</strong> {{ $activityName }}
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#0c4a6e;">
            <strong>Trainer:</strong> {{ $trainerName }}
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#0c4a6e;">
            <strong>Package:</strong> {{ $packageName }}
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#0c4a6e;">
            <strong>Children:</strong> {{ $childNames }}
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#0c4a6e;">
            <strong>Parent:</strong> {{ $parentName }}
        </p>
        <p style="margin:0;font-size:15px;color:#0c4a6e;">
            <strong>Booking Reference:</strong> {{ $reference }}
        </p>
    </div>

    <p style="margin:24px 0 12px 0;text-align:center;">
        <a href="{{ $adminUrl }}" style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#0f172a,#1d4ed8);color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
            {{ $needsTrainer ? '🎯 Assign Trainer' : '📋 View Session' }}
        </a>
    </p>
    <p style="margin:8px 0 0 0;text-align:center;font-size:13px;color:#6b7280;">
        Click the button above to manage this session in the admin panel.
    </p>

    <p style="margin:24px 0 0 0;font-size:15px;color:#374151;">
        — CAMS Services Admin
    </p>
@endcomponent
