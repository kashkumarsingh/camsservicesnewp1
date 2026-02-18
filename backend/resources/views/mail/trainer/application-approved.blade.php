@component('mail.layouts.cams', [
    'title' => 'Application Approved - Welcome to CAMS Services!',
    'preview' => 'Congratulations! Your trainer application has been approved.',
])
    <p style="margin:0 0 16px 0;font-size:16px;color:#111827;">Hi {{ $applicantName }},</p>
    <p style="margin:0 0 16px 0;font-size:15px;color:#374151;">
        Brilliant news! Your trainer application has been approved, and we're delighted to welcome you to the CAMS Services team.
    </p>

    <div style="margin:24px 0;padding:20px;background-color:#d1fae5;border-radius:8px;border-left:4px solid:#10b981;">
        <p style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:#065f46;">
            ✅ Application Approved
        </p>
        <p style="margin:0;font-size:15px;color:#047857;">
            You're now officially part of our trainer network! We've created your account and you can start working with families straightaway.
        </p>
    </div>

    @if(!$application->canDoAllActivities())
    <div style="margin:24px 0;padding:20px;background-color:#fef9c3;border-radius:8px;border-left:4px solid:#eab308;">
        <p style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:#713f12;">
            📋 Your Activity Coverage
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#854d0e;">
            You've indicated you cannot facilitate the following activities:
        </p>
        <ul style="margin:8px 0;padding-left:20px;font-size:14px;color:#854d0e;">
            @foreach($application->getExcludedActivityNames() as $activityName)
            <li style="margin-bottom:4px;">{{ $activityName }}</li>
            @endforeach
        </ul>
        @if($application->exclusion_reason)
        <p style="margin:12px 0 0 0;font-size:14px;color:#854d0e;">
            <strong>Reason:</strong> {{ $application->exclusion_reason }}
        </p>
        @endif
        <p style="margin:12px 0 0 0;font-size:14px;color:#854d0e;font-style:italic;">
            You'll be assigned to bookings that match your capabilities. All other activities are available to you.
        </p>
    </div>
    @else
    <div style="margin:24px 0;padding:20px;background-color:#dbeafe;border-radius:8px;border-left:4px solid:#3b82f6;">
        <p style="margin:0 0 8px 0;font-size:16px;font-weight:600;color:#1e40af;">
            🎯 Full Activity Coverage
        </p>
        <p style="margin:0;font-size:15px;color:#1e40af;">
            You've indicated you can facilitate <strong>all activities</strong> in our catalog. You'll be eligible for all session bookings!
        </p>
    </div>
    @endif

    @if($hasAccount)
    <div style="margin:24px 0;padding:20px;background-color:#fef3c7;border-radius:8px;border-left:4px solid:#f59e0b;">
        <p style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:#78350f;">
            🔐 Your Login Details
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#92400e;">
            <strong>Email:</strong> {{ $loginEmail }}
        </p>
        @if($temporaryPassword)
        <p style="margin:0 0 8px 0;font-size:15px;color:#92400e;">
            <strong>Temporary Password:</strong> {{ $temporaryPassword }}
        </p>
        <p style="margin:0;font-size:14px;color:#92400e;font-style:italic;">
            Please change this password after your first login.
        </p>
        @else
        <p style="margin:0;font-size:14px;color:#92400e;">
            A password reset link has been sent to your email address.
        </p>
        @endif
    </div>

    <p style="margin:24px 0 12px 0;text-align:center;">
        <a href="{{ config('frontend.url', 'http://localhost:4300') }}/trainer/login" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#0f172a,#1d4ed8);color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Log In to Your Trainer Dashboard</a>
    </p>
    @endif

    <p style="margin:24px 0 16px 0;font-size:15px;color:#374151;">
        <strong>What happens next?</strong>
    </p>
    <ol style="margin:0 0 16px 0;padding-left:20px;font-size:15px;color:#374151;">
        <li style="margin-bottom:8px;">Log in to your trainer account</li>
        <li style="margin-bottom:8px;">Complete your profile with a photo and detailed bio</li>
        <li style="margin-bottom:8px;">Review your availability and service areas</li>
        <li style="margin-bottom:8px;">You'll start receiving session bookings from families</li>
        <li>Our team will be in touch with onboarding details shortly</li>
    </ol>

    <p style="margin:24px 0 12px 0;font-size:15px;color:#374151;">
        Need help or have questions? Just reply to this email and we'll get back to you straightaway.
    </p>
    
    <p style="margin:0;font-size:15px;color:#374151;">
        Welcome to the team! 🎉<br>
        — Team CAMS Services
    </p>
@endcomponent
