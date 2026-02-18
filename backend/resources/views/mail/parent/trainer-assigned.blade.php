@component('mail.layouts.cams', [
    'title' => 'Trainer assigned to your session',
    'preview' => 'A trainer has been assigned to ' . $childNames . '\'s upcoming session.',
])
    <p style="margin:0 0 16px 0;font-size:16px;color:#111827;">Hello,</p>

    <p style="margin:0 0 16px 0;font-size:15px;color:#374151;">
        Good news! <strong>{{ $trainerName }}</strong> has been assigned to <strong>{{ $childNames }}'s</strong> upcoming {{ $packageName }} session.
    </p>

    <div style="margin:24px 0;padding:20px;background-color:#f0fdf4;border-radius:8px;border-left:4px solid #16a34a;">
        <p style="margin:0 0 8px 0;font-size:15px;color:#166534;">
            <strong>Session:</strong> {{ $sessionDate }}{{ $sessionTime ? ' · ' . $sessionTime : '' }}
        </p>
        <p style="margin:0;font-size:15px;color:#166534;">
            <strong>Trainer:</strong> {{ $trainerName }}
        </p>
    </div>

    <p style="margin:24px 0 12px 0;text-align:center;">
        <a href="{{ $bookingUrl }}" style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#0f172a,#1d4ed8);color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;">View session in dashboard</a>
    </p>

    <p style="margin:0;font-size:15px;color:#374151;">
        — Team CAMS Services
    </p>
@endcomponent
