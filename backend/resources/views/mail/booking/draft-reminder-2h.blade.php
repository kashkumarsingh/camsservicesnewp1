@component('mail.layouts.cams', [
    'title' => 'Still Interested?',
    'preview' => 'Complete your ' . $packageName . ' booking in just 2 minutes',
])
    <p style="margin:0 0 16px 0;font-size:16px;color:#111827;">Hello {{ $parentName }},</p>
    
    <p style="margin:0 0 16px 0;font-size:15px;color:#374151;">
        We've saved your booking for <strong>{{ $packageName }}</strong> for {{ $childNames }}. You're just a few steps away from giving your child an amazing activity experience!
    </p>

    <div style="margin:24px 0;padding:20px;background-color:#f0fdf4;border-radius:8px;border-left:4px solid #22c55e;">
        <p style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:#14532d;">
            ⏱️ Quick & Easy
        </p>
        <p style="margin:0;font-size:15px;color:#166534;">
            Complete your booking in just <strong>2 minutes</strong> and secure {{ $childNames }}'s spot!
        </p>
    </div>

    <p style="margin:24px 0 12px 0;text-align:center;">
        <a href="{{ $resumeUrl }}" style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#0f172a,#1d4ed8);color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">🚀 Complete Payment</a>
    </p>

    <div style="margin:32px 0;padding:16px;background-color:#f3f4f6;border-radius:8px;text-align:center;">
        <p style="margin:0 0 12px 0;font-size:14px;font-weight:600;color:#111827;">
            👨‍👩‍👧‍👦 Join 500+ Happy Families
        </p>
        <p style="margin:0;font-size:14px;color:#6b7280;">
            "CAMS Services helped my child build confidence and make new friends. Highly recommend!" — Sarah M.
        </p>
    </div>

    <p style="margin:24px 0 0 0;font-size:15px;color:#374151;">
        Need help? Simply reply to this email—we're always happy to assist!
    </p>

    <p style="margin:16px 0 0 0;font-size:15px;color:#374151;">
        Warm regards,<br>
        The CAMS Services Team
    </p>
@endcomponent
