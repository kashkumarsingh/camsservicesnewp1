@component('mail.layouts.cams', [
    'title' => 'New Contact Request',
    'preview' => 'A new contact form submission has been received.',
])
    <p style="margin:0 0 16px 0;font-size:16px;color:#111827;">Hello Admin,</p>
    <p style="margin:0 0 16px 0;font-size:15px;color:#374151;">
        A new contact form submission has been received from your website and requires your attention.
    </p>

    <div style="margin:24px 0;padding:20px;background-color:#fef3c7;border-radius:8px;border-left:4px solid #f59e0b;">
        <p style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:#78350f;">
            ⏰ Urgency: {{ ucfirst($submission->urgency) }}
        </p>
        <p style="margin:0;font-size:14px;color:#92400e;">
            {{ $submission->urgency === 'urgent' ? 'This is marked as URGENT - please respond within 2 hours.' : 'Please follow up within 24 hours.' }}
        </p>
    </div>

    <div style="margin:24px 0;padding:20px;background-color:#f0f9ff;border-radius:8px;border-left:4px solid #0ea5e9;">
        <p style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:#0c4a6e;">
            👤 Contact Information
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#075985;">
            <strong>Name:</strong> {{ $submission->name }}
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#075985;">
            <strong>Email:</strong> <a href="mailto:{{ $submission->email }}" style="color:#0ea5e9;text-decoration:none;">{{ $submission->email }}</a>
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#075985;">
            <strong>Phone:</strong> <a href="tel:{{ $submission->phone }}" style="color:#0ea5e9;text-decoration:none;">{{ $submission->phone ?: '—' }}</a>
        </p>
        @if($submission->address)
        <p style="margin:0 0 8px 0;font-size:15px;color:#075985;">
            <strong>Address:</strong> {{ $submission->address }}
        </p>
        @endif
        @if($submission->postal_code)
        <p style="margin:0;font-size:15px;color:#075985;">
            <strong>Postal Code:</strong> {{ $submission->postal_code }}
        </p>
        @endif
    </div>

    <div style="margin:24px 0;padding:20px;background-color:#f5f3ff;border-radius:8px;border-left:4px solid #8b5cf6;">
        <p style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:#5b21b6;">
            📋 Inquiry Details
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#6b21a8;">
            <strong>Type:</strong> {{ ucfirst($submission->inquiry_type) }}
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#6b21a8;">
            <strong>Urgency:</strong> {{ ucfirst($submission->urgency) }}
        </p>
        <p style="margin:0;font-size:15px;color:#6b21a8;">
            <strong>Preferred Contact:</strong> {{ ucfirst($submission->preferred_contact) }}
        </p>
    </div>

    @if($submission->message)
    <div style="margin:24px 0;padding:20px;background-color:#ecfdf5;border-radius:8px;border-left:4px solid #10b981;">
        <p style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:#065f46;">
            💬 Message
        </p>
        <p style="margin:0;font-size:15px;color:#047857;white-space:pre-wrap;">{{ $submission->message }}</p>
    </div>
    @endif

    <div style="margin:24px 0;padding:16px;background-color:#fef2f2;border-radius:8px;border-left:4px solid #ef4444;">
        <p style="margin:0;font-size:14px;color:#991b1b;">
            <strong>⏰ Action Required:</strong> Please respond to this inquiry {{ $submission->urgency === 'urgent' ? 'within 2 hours' : 'within 24 hours' }} to maintain our high customer service standards.
        </p>
    </div>

    <p style="margin:24px 0 12px 0;text-align:center;">
        <a href="{{ config('app.url') }}/admin/contact-submissions/{{ $submission->id }}" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#0f172a,#1d4ed8);color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">📧 Open in Admin Panel</a>
    </p>

    <div style="margin:24px 0;padding:16px;background-color:#f9fafb;border-radius:8px;text-align:center;">
        <p style="margin:0 0 8px 0;font-size:14px;color:#6b7280;">
            Quick actions:
        </p>
        <p style="margin:0;">
            <a href="mailto:{{ $submission->email }}" style="display:inline-block;margin:0 8px;padding:8px 16px;background-color:#0ea5e9;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;">✉️ Email</a>
            @if($submission->phone)
            <a href="tel:{{ $submission->phone }}" style="display:inline-block;margin:0 8px;padding:8px 16px;background-color:#10b981;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;">📞 Call</a>
            @endif
        </p>
    </div>

    <p style="margin:24px 0 0 0;font-size:15px;color:#374151;">
        — CAMS Services Admin
    </p>
@endcomponent
