@component('mail.layouts.cams', [
    'title' => 'Last Chance!',
    'preview' => 'Complete your booking before it expires in 24 hours',
])
    <p style="margin:0 0 16px 0;font-size:16px;color:#111827;">Hello {{ $parentName }},</p>
    
    <p style="margin:0 0 16px 0;font-size:15px;color:#374151;">
        This is your <strong>final reminder</strong> to complete your booking for <strong>{{ $packageName }}</strong> for {{ $childNames }}.
    </p>

    <div style="margin:24px 0;padding:20px;background-color:#fef2f2;border-radius:8px;border-left:4px solid #ef4444;">
        <p style="margin:0 0 12px 0;font-size:18px;font-weight:700;color:#7f1d1d;">
            ⚠️ Expires in 24 Hours!
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#991b1b;">
            Your booking expires soon, and your reserved spot will be released.
        </p>
        <p style="margin:0;font-size:14px;color:#991b1b;">
            <strong>Act now</strong> to avoid losing this opportunity for {{ $childNames }}.
        </p>
    </div>

    <p style="margin:24px 0 12px 0;text-align:center;">
        <a href="{{ $resumeUrl }}" style="display:inline-block;padding:16px 32px;background:linear-gradient(135deg,#dc2626,#7f1d1d);color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700;font-size:18px;box-shadow:0 6px 12px rgba(0,0,0,0.2);">🎯 Complete Now</a>
    </p>
    <p style="margin:8px 0 0 0;text-align:center;font-size:13px;color:#6b7280;">
        Don't let this opportunity slip away!
    </p>

    <div style="margin:32px 0;padding:16px;background-color:#f9fafb;border-radius:8px;border:2px solid #e5e7eb;">
        <p style="margin:0 0 8px 0;font-size:14px;font-weight:600;color:#111827;">
            💬 Need Help?
        </p>
        <p style="margin:0 0 8px 0;font-size:14px;color:#6b7280;">
            Having trouble completing your booking? We're here to assist!
        </p>
        <p style="margin:0;font-size:14px;color:#6b7280;">
            📧 Reply to this email: <a href="mailto:{{ $supportEmail }}" style="color:#1d4ed8;text-decoration:underline;">{{ $supportEmail }}</a>
        </p>
    </div>

    <p style="margin:24px 0 0 0;font-size:15px;color:#374151;">
        We'd love to welcome {{ $childNames }} to CAMS Services. Complete your booking today!
    </p>

    <p style="margin:16px 0 0 0;font-size:15px;color:#374151;">
        Kind regards,<br>
        The CAMS Services Team
    </p>
@endcomponent
