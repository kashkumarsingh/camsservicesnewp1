@component('mail.layouts.cams', [
    'title' => 'Payment Failed',
    'preview' => 'We were unable to process your payment.',
])
    <p style="margin:0 0 16px 0;font-size:16px;color:#111827;">Hi {{ $booking->parent_first_name }},</p>
    <p style="margin:0 0 16px 0;font-size:15px;color:#374151;">
        We were unable to process your payment for <strong>{{ $packageName }}</strong>.
    </p>
    <p style="margin:0 0 16px 0;font-size:15px;color:#374151;">
        Your booking reference is: <strong>{{ $reference }}</strong>
    </p>

    @if($error)
    <div style="margin:16px 0;padding:12px;background-color:#fef2f2;border-left:4px solid #ef4444;border-radius:4px;">
        <p style="margin:0;font-size:14px;color:#991b1b;">
            <strong>Reason:</strong> {{ $error }}
        </p>
    </div>
    @endif

    <p style="margin:0 0 16px 0;font-size:15px;color:#374151;">
        <strong>Total Amount:</strong> £{{ $totalPrice }}
    </p>

    <p style="margin:24px 0 12px 0;text-align:center;">
        <a href="{{ config('services.frontend.url', env('FRONTEND_URL', config('app.url'))) }}/bookings/{{ $reference }}/payment" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#0f172a,#1d4ed8);color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Retry Payment</a>
    </p>

    <p style="margin:16px 0 0 0;font-size:14px;color:#6b7280;">
        If you continue to experience issues, please contact our support team at <a href="mailto:support@camsservices.co.uk" style="color:#1d4ed8;text-decoration:none;">support@camsservices.co.uk</a> or reply to this email.
    </p>

    <p style="margin:0;font-size:15px;color:#374151;">
        — Team CAMS Services
    </p>
@endcomponent
