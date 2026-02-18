@component('mail.layouts.cams', [
    'title' => 'Child Approval Required',
    'preview' => 'A new child application requires your approval.',
])
    <p style="margin:0 0 16px 0;font-size:16px;color:#111827;">Hello Admin,</p>
    <p style="margin:0 0 16px 0;font-size:15px;color:#374151;">
        A new child application has been submitted and requires your approval.
    </p>

    <div style="margin:24px 0;padding:20px;background-color:#fef3c7;border-radius:8px;border-left:4px solid #f59e0b;">
        <p style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:#78350f;">
            Child Application Details
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#92400e;">
            <strong>Child Name:</strong> {{ $childName }}
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#92400e;">
            <strong>Parent:</strong> {{ $parentName }}
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#92400e;">
            <strong>Application Date:</strong> {{ $applicationDate }}
        </p>
        <p style="margin:0;font-size:15px;color:#92400e;">
            <strong>Date of Birth:</strong> {{ $child->date_of_birth ? $child->date_of_birth->format('F j, Y') : 'Not provided' }}
        </p>
    </div>

    <p style="margin:24px 0 12px 0;text-align:center;">
        <a href="{{ config('app.url') }}/admin/children/{{ $child->id }}" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#0f172a,#1d4ed8);color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Review Application</a>
    </p>

    <p style="margin:0;font-size:15px;color:#374151;">
        — CAMS Services Admin
    </p>
@endcomponent
