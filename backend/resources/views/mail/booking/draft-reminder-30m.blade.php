@component('mail.layouts.cams', [
    'title' => 'Complete Your Booking',
    'preview' => 'Your booking for ' . $packageName . ' is waiting for you!',
])
    <p style="margin:0 0 16px 0;font-size:16px;color:#111827;">Hello {{ $parentName }},</p>
    
    <p style="margin:0 0 16px 0;font-size:15px;color:#374151;">
        We noticed you started booking <strong>{{ $packageName }}</strong> for {{ $childNames }}, but didn't finish completing your booking. No worries! Your details are saved, and you can pick up right where you left off.
    </p>

    <div style="margin:24px 0;padding:20px;background-color:#f0f9ff;border-radius:8px;border-left:4px solid#0284c7;">
        <p style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:#0c4a6e;">
            📋 Your Booking Details
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#0369a1;">
            <strong>Package:</strong> {{ $packageName }}
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#0369a1;">
            <strong>Children:</strong> {{ $childNames }}
        </p>
        <p style="margin:0;font-size:15px;color:#0369a1;">
            <strong>Reference:</strong> {{ $reference }}
        </p>
    </div>

    <p style="margin:24px 0 12px 0;text-align:center;">
        <a href="{{ $resumeUrl }}" style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#0f172a,#1d4ed8);color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">✨ Complete My Booking</a>
    </p>
    <p style="margin:8px 0 0 0;text-align:center;font-size:13px;color:#6b7280;">
        It only takes 2 minutes to finish your booking and secure your spot!
    </p>

    <div style="margin:32px 0;padding:16px;background-color:#fef3c7;border-radius:8px;">
        <p style="margin:0 0 8px 0;font-size:14px;font-weight:600;color:#92400e;">
            🎯 Why Complete Your Booking?
        </p>
        <ul style="margin:0;padding-left:20px;color:#92400e;">
            <li style="margin-bottom:6px;">Secure your preferred dates before they're gone</li>
            <li style="margin-bottom:6px;">Get matched with the perfect trainer for {{ $childNames }}</li>
            <li>Start your child's exciting activity journey!</li>
        </ul>
    </div>

    <p style="margin:24px 0 0 0;font-size:15px;color:#374151;">
        If you have any questions or need assistance completing your booking, simply reply to this email—we're here to help!
    </p>

    <p style="margin:16px 0 0 0;font-size:15px;color:#374151;">
        Best regards,<br>
        The CAMS Services Team
    </p>
@endcomponent
