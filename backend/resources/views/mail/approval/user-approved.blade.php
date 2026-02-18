@component('mail.layouts.cams', [
    'title' => 'Account Approved',
    'preview' => 'Your CAMS Services account has been approved!',
])
    <p style="margin:0 0 16px 0;font-size:16px;color:#111827;">Hello {{ $user->name }},</p>
    
    <h2 style="margin:0 0 16px 0;font-size:20px;font-weight:600;color:#1E3A5F;">
        Your Account Has Been Approved! 🎉
    </h2>

    <p style="margin:0 0 16px 0;font-size:15px;color:#374151;">
        Great news! Your CAMS Services account has been reviewed and approved by our admin team.
    </p>

    <p style="margin:0 0 12px 0;font-size:15px;color:#374151;font-weight:600;">
        What's next?
    </p>

    <ul style="margin:0 0 20px 0;padding-left:20px;font-size:15px;color:#374151;line-height:1.8;">
        <li>Add children to your account</li>
        <li>Complete their checklists</li>
        <li>Once children are approved, you can book packages and services</li>
    </ul>

    <p style="margin:0 0 20px 0;">
        <a href="{{ config('services.frontend.url', env('FRONTEND_URL', config('app.url'))) }}/dashboard" style="display:inline-block;padding:12px 24px;background-color:#1d4ed8;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">
            Go to Dashboard
        </a>
    </p>

    <p style="margin:0 0 12px 0;font-size:15px;color:#374151;">
        If you have any questions, please don't hesitate to contact us.
    </p>
    <p style="margin:0;font-size:15px;color:#374151;">
        — Team CAMS Services
    </p>
@endcomponent

