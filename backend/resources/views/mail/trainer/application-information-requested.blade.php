@php
    $reference = 'CAMS-TA-' . $application->id;
@endphp
@component('mail.layouts.cams', [
    'title' => 'More information needed',
    'preview' => 'Our team has requested additional details for your trainer application.',
])
    <p style="margin:0 0 16px 0;font-size:16px;color:#111827;">Hi {{ $applicantName }},</p>
    <p style="margin:0 0 16px 0;font-size:15px;color:#374151;">
        Thank you for your trainer application (reference <strong>{{ $reference }}</strong>). Our team has reviewed it and would like a bit more information before making a decision.
    </p>

    <div style="margin:24px 0;padding:20px;background-color:#fef3c7;border-radius:8px;border-left:4px solid #f59e0b;">
        <p style="margin:0 0 8px 0;font-size:14px;font-weight:600;color:#92400e;">Message from our team</p>
        <p style="margin:0;font-size:15px;color:#78350f;white-space:pre-wrap;">{{ $adminMessage }}</p>
    </div>

    <p style="margin:24px 0 16px 0;font-size:15px;color:#374151;">
        Please use the button below to submit your response. You’ll be able to add a message and any extra details. Once we receive it, we’ll continue reviewing your application.
    </p>

    <p style="margin:0 0 24px 0;">
        <a href="{{ $respondUrl }}" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#0f172a,#1d4ed8);color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Submit your response</a>
    </p>

    <p style="margin:0 0 8px 0;font-size:13px;color:#6b7280;">
        This link is valid for 7 days. If you have any questions, reply to this email.
    </p>

    <p style="margin:24px 0 0;font-size:15px;color:#374151;">
        Best regards,<br>
        — Team CAMS Services
    </p>
@endcomponent
