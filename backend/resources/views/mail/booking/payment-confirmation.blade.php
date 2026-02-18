@component('mail.layouts.cams', [
    'title' => 'Payment Confirmed',
    'preview' => 'Your payment has been successfully processed.',
])
    <p style="margin:0 0 16px 0;font-size:16px;color:#111827;">Hi {{ $booking->parent_first_name }},</p>
    <p style="margin:0 0 16px 0;font-size:15px;color:#374151;">
        Great news! Your payment of <strong>£{{ $paidAmount }}</strong> for <strong>{{ $packageName }}</strong> has been successfully processed.
    </p>
    <p style="margin:0 0 16px 0;font-size:15px;color:#374151;">
        Your booking reference is: <strong>{{ $reference }}</strong>
    </p>

    @component('mail.components.booking-summary', ['booking' => $booking])
    @endcomponent

    <p style="margin:0 0 16px 0;font-size:15px;color:#374151;font-weight:600;">
        What's Next?
    </p>
    <p style="margin:0 0 16px 0;font-size:15px;color:#374151;">
        You can now book your sessions from your dashboard. Simply log in and select the dates and times that work best for you and your child.
    </p>

    <p style="margin:24px 0 12px 0;text-align:center;">
        <a href="{{ config('services.frontend.url', env('FRONTEND_URL', config('app.url'))) }}/dashboard/bookings" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#0f172a,#1d4ed8);color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Book Your Sessions</a>
    </p>

    <p style="margin:0;font-size:15px;color:#374151;">
        — Team CAMS Services
    </p>
@endcomponent
