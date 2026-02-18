@component('mail.layouts.cams', [
    'title' => 'Child Approved',
    'preview' => $child->name . ' has been approved!',
])
    <p style="margin:0 0 16px 0;font-size:16px;color:#111827;">Hello {{ $parent->name }},</p>
    
    <h2 style="margin:0 0 16px 0;font-size:20px;font-weight:600;color:#1E3A5F;">
        {{ $child->name }} Has Been Approved! 🎉
    </h2>

    <p style="margin:0 0 16px 0;font-size:15px;color:#374151;">
        Great news! {{ $child->name }}'s registration has been reviewed and approved by our admin team.
    </p>

    <p style="margin:0 0 20px 0;font-size:15px;color:#374151;">
        You can now book packages and services for {{ $child->name }}.
    </p>

    <p style="margin:0 0 20px 0;">
        <a href="{{ config('services.frontend.url', env('FRONTEND_URL', config('app.url'))) }}/packages" style="display:inline-block;padding:12px 24px;background-color:#1d4ed8;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">
            Browse Packages
        </a>
    </p>

    <p style="margin:0 0 12px 0;font-size:15px;color:#374151;">
        If you have any questions, please don't hesitate to contact us.
    </p>
    <p style="margin:0;font-size:15px;color:#374151;">
        — Team CAMS Services
    </p>
@endcomponent

