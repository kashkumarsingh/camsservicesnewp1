@component('mail.layouts.cams', [
    'title' => 'New Trainer Application',
    'preview' => 'A new trainer application requires your review.',
])
    <p style="margin:0 0 16px 0;font-size:16px;color:#111827;">Hello Admin,</p>
    <p style="margin:0 0 16px 0;font-size:15px;color:#374151;">
        A new trainer application has been submitted and requires your review.
    </p>

    <div style="margin:24px 0;padding:20px;background-color:#dbeafe;border-radius:8px;border-left:4px solid:#3b82f6;">
        <p style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:#1e40af;">
            Trainer Application Details
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#1e3a8a;">
            <strong>Applicant:</strong> {{ $applicantName }}
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#1e3a8a;">
            <strong>Email:</strong> {{ $application->email }}
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#1e3a8a;">
            <strong>Phone:</strong> {{ $application->phone }}
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#1e3a8a;">
            <strong>Location:</strong> 
            @php
                $locationParts = array_filter([
                    $application->address_line_one,
                    $application->city,
                    $application->county,
                    $application->postcode,
                ]);
                echo implode(', ', $locationParts) ?: 'Not specified';
            @endphp
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#1e3a8a;">
            <strong>Experience:</strong> {{ $experienceYears }} years
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#1e3a8a;">
            <strong>Application Date:</strong> {{ $applicationDate }}
        </p>
        @if($application->activity_specialties && count($application->activity_specialties) > 0)
        <p style="margin:8px 0 0 0;font-size:15px;color:#1e3a8a;">
            <strong>Specialties:</strong> {{ implode(', ', $application->activity_specialties) }}
        </p>
        @endif
    </div>

    <p style="margin:24px 0 12px 0;text-align:center;">
        <a href="{{ config('app.url') }}/admin/trainer-applications/{{ $application->id }}" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#0f172a,#1d4ed8);color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Review Application</a>
    </p>

    <p style="margin:24px 0 16px 0;font-size:15px;color:#374151;">
        <strong>What happens next?</strong>
    </p>
    <ul style="margin:0 0 16px 0;padding-left:20px;font-size:15px;color:#374151;">
        <li style="margin-bottom:8px;">Review the applicant's details and qualifications</li>
        <li style="margin-bottom:8px;">Check their DBS certification and insurance</li>
        <li style="margin-bottom:8px;">Approve to create their trainer profile and user account</li>
        <li>Reject if they don't meet our requirements</li>
    </ul>

    <p style="margin:0;font-size:15px;color:#374151;">
        — CAMS Services Admin
    </p>
@endcomponent
