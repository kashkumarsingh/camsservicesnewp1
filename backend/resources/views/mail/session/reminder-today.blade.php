@component('mail.layouts.cams', [
    'title' => 'Session Today',
    'preview' => $childNames . '\'s ' . $packageName . ' session is today',
])
    <p style="margin:0 0 16px 0;font-size:16px;color:#111827;">Hello {{ $parentName }},</p>
    
    <p style="margin:0 0 16px 0;font-size:15px;color:#374151;">
        <strong>{{ $childNames }}'s {{ $packageName }} session</strong> is <strong>today</strong> at <strong>{{ $sessionTime }}</strong>.
    </p>

    <div style="margin:24px 0;padding:20px;background-color:#f0f9ff;border-radius:8px;border-left:4px solid #0284c7;">
        <p style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:#0c4a6e;">
            📅 Session Details
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#0369a1;">
            <strong>Time:</strong> {{ $sessionTime }}
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#0369a1;">
            <strong>Location:</strong> {{ $location }}
        </p>
        <p style="margin:0;font-size:15px;color:#0369a1;">
            <strong>Trainer:</strong> {{ $trainerName }}
            @if($trainerPhone)
                <br><span style="font-size:14px;">📞 {{ $trainerPhone }}</span>
            @endif
        </p>
    </div>

    <p style="margin:24px 0 12px 0;text-align:center;">
        <a href="{{ $bookingUrl }}" style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#0f172a,#1d4ed8);color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">📋 View Booking</a>
    </p>

    <p style="margin:24px 0 0 0;font-size:15px;color:#374151;">
        We look forward to seeing {{ $childNames }} today. If you have any questions, simply reply to this email.
    </p>

    <p style="margin:16px 0 0 0;font-size:15px;color:#374151;">
        Best regards,<br>
        The CAMS Services Team
    </p>
@endcomponent
