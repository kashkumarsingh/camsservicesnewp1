@component('mail.layouts.cams', [
    'title' => 'Child Registration Update',
    'preview' => 'Update on ' . $child->name . '\'s registration.',
])
    <p style="margin:0 0 16px 0;font-size:16px;color:#111827;">Hello {{ $parent->name }},</p>
    
    <h2 style="margin:0 0 16px 0;font-size:20px;font-weight:600;color:#1E3A5F;">
        Child Registration Update
    </h2>

    <p style="margin:0 0 16px 0;font-size:15px;color:#374151;">
        Thank you for registering {{ $child->name }} with CAMS Services. Unfortunately, we are unable to approve this registration at this time.
    </p>

    <div style="background-color:#FEF2F2;border-left:4px solid #EF4444;padding:16px;margin:20px 0;border-radius:4px;">
        <p style="margin:0 0 8px 0;font-size:15px;font-weight:600;color:#991B1B;">
            Reason:
        </p>
        <p style="margin:0;font-size:15px;color:#7F1D1D;line-height:1.6;">
            {{ $rejectionReason }}
        </p>
    </div>

    <p style="margin:0 0 20px 0;font-size:15px;color:#374151;">
        If you believe this is an error or would like to discuss this further, please contact us.
    </p>

    <p style="margin:0 0 20px 0;">
        <a href="{{ config('app.url') }}/contact" style="display:inline-block;padding:12px 24px;background-color:#1d4ed8;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">
            Contact Us
        </a>
    </p>

    <p style="margin:0 0 12px 0;font-size:15px;color:#374151;">
        Best regards,
    </p>
    <p style="margin:0;font-size:15px;color:#374151;">
        — Team CAMS Services
    </p>
@endcomponent

