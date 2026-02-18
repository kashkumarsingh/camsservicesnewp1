@component('mail.layouts.cams', [
    'title' => 'Trainer Application Update',
    'preview' => 'Thank you for your interest in joining CAMS Services.',
])
    <p style="margin:0 0 16px 0;font-size:16px;color:#111827;">Hi {{ $applicantName }},</p>
    <p style="margin:0 0 16px 0;font-size:15px;color:#374151;">
        Thank you for taking the time to apply for a trainer position with CAMS Services. We really appreciate your interest in joining our team.
    </p>

    <div style="margin:24px 0;padding:20px;background-color:#fee2e2;border-radius:8px;border-left:4px solid:#ef4444;">
        <p style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:#991b1b;">
            Application Status Update
        </p>
        <p style="margin:0;font-size:15px;color:#7f1d1d;">
            Unfortunately, we're unable to proceed with your application at this time.
        </p>
    </div>

    @if($reason)
    <p style="margin:24px 0 16px 0;font-size:15px;color:#374151;">
        <strong>Feedback:</strong>
    </p>
    <div style="margin:0 0 16px 0;padding:16px;background-color:#f3f4f6;border-radius:8px;">
        <p style="margin:0;font-size:15px;color:#374151;">
            {{ $reason }}
        </p>
    </div>
    @endif

    <p style="margin:24px 0 16px 0;font-size:15px;color:#374151;">
        Whilst we can't offer you a position right now, we encourage you to:
    </p>
    <ul style="margin:0 0 16px 0;padding-left:20px;font-size:15px;color:#374151;">
        <li style="margin-bottom:8px;">Gain additional experience or qualifications</li>
        <li style="margin-bottom:8px;">Update your DBS check if it's expired</li>
        <li style="margin-bottom:8px;">Consider applying again in the future</li>
    </ul>

    <p style="margin:24px 0 12px 0;font-size:15px;color:#374151;">
        We keep all applications on file for 6 months, and we'll reach out if a suitable position becomes available.
    </p>

    <p style="margin:24px 0 12px 0;font-size:15px;color:#374151;">
        If you have any questions about this decision, please don't hesitate to get in touch by replying to this email.
    </p>
    
    <p style="margin:0;font-size:15px;color:#374151;">
        Best wishes for your future endeavours,<br>
        — Team CAMS Services
    </p>
@endcomponent
