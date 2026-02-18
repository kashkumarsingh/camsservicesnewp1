@component('mail.layouts.cams', [
    'title' => 'Session Tomorrow',
    'preview' => $childNames . '\'s ' . $packageName . ' session is tomorrow',
])
    <p style="margin:0 0 16px 0;font-size:16px;color:#111827;">Hello {{ $parentName }},</p>
    
    <p style="margin:0 0 16px 0;font-size:15px;color:#374151;">
        This is a friendly reminder that <strong>{{ $childNames }}'s {{ $packageName }} session</strong> is <strong>tomorrow</strong>!
    </p>

    <div style="margin:24px 0;padding:20px;background-color:#f0f9ff;border-radius:8px;border-left:4px solid #0284c7;">
        <p style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:#0c4a6e;">
            📅 Session Details
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#0369a1;">
            <strong>Date:</strong> {{ $sessionDate }}
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

    <div style="margin:24px 0;padding:20px;background-color:#fef3c7;border-radius:8px;">
        <p style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:#78350f;">
            🎒 What to Bring
        </p>
        <ul style="margin:0;padding-left:20px;color:#92400e;">
            <li style="margin-bottom:6px;">Comfortable clothing suitable for activities</li>
            <li style="margin-bottom:6px;">Water bottle and healthy snack</li>
            <li style="margin-bottom:6px;">Any specific equipment (if previously advised)</li>
            <li>Positive attitude and enthusiasm!</li>
        </ul>
    </div>

    <p style="margin:24px 0 12px 0;text-align:center;">
        <a href="{{ $bookingUrl }}" style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#0f172a,#1d4ed8);color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">📋 View Full Booking Details</a>
    </p>

    <div style="margin:32px 0;padding:16px;background-color:#f0fdf4;border-radius:8px;">
        <p style="margin:0 0 8px 0;font-size:14px;font-weight:600;color:#14532d;">
            ℹ️ Cancellation Policy
        </p>
        <p style="margin:0;font-size:14px;color:#166534;">
            If you need to cancel or reschedule, please contact us at least 24 hours before the session. Short-notice cancellations may not be eligible for a refund.
        </p>
    </div>

    <p style="margin:24px 0 0 0;font-size:15px;color:#374151;">
        We're excited to see {{ $childNames }} tomorrow! If you have any questions or concerns, simply reply to this email.
    </p>

    <p style="margin:16px 0 0 0;font-size:15px;color:#374151;">
        Best regards,<br>
        The CAMS Services Team
    </p>
@endcomponent
