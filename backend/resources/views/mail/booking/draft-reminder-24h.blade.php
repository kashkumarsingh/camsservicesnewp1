@component('mail.layouts.cams', [
    'title' => 'Don\'t Miss Out!',
    'preview' => 'Your ' . $packageName . ' booking expires soon',
])
    <p style="margin:0 0 16px 0;font-size:16px;color:#111827;">Hello {{ $parentName }},</p>
    
    <p style="margin:0 0 16px 0;font-size:15px;color:#374151;">
        Your booking for <strong>{{ $packageName }}</strong> is reserved until <strong>{{ $expiresAt }}</strong>. Don't miss out on this opportunity for {{ $childNames }}!
    </p>

    <div style="margin:24px 0;padding:20px;background-color:#fef3c7;border-radius:8px;border-left:4px solid #f59e0b;">
        <p style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:#78350f;">
            ⏰ Time-Sensitive
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#92400e;">
            Your reserved spot expires on <strong>{{ $expiresAt }}</strong>
        </p>
        <p style="margin:0;font-size:14px;color:#92400e;">
            Complete your payment now to secure {{ $childNames }}'s place before someone else books it!
        </p>
    </div>

    <p style="margin:24px 0 12px 0;text-align:center;">
        <a href="{{ $resumeUrl }}" style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#dc2626,#f59e0b);color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">🔥 Secure My Spot Now</a>
    </p>

    <div style="margin:32px 0;padding:20px;background-color:#f0f9ff;border-radius:8px;">
        <p style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:#0c4a6e;">
            ✨ What's Included
        </p>
        <ul style="margin:0;padding-left:20px;color:#0369a1;">
            <li style="margin-bottom:6px;">Expert trainers matched to your child's needs</li>
            <li style="margin-bottom:6px;">Engaging, age-appropriate activities</li>
            <li style="margin-bottom:6px;">Safe, supportive learning environment</li>
            <li>Regular progress updates</li>
        </ul>
    </div>

    <p style="margin:24px 0 0 0;font-size:15px;color:#374151;">
        Questions? We're here to help—just reply to this email!
    </p>

    <p style="margin:16px 0 0 0;font-size:15px;color:#374151;">
        Best regards,<br>
        The CAMS Services Team
    </p>
@endcomponent
