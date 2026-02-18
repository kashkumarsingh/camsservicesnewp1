@component('mail.layouts.cams', [
    'title' => 'Booking Cancelled',
    'preview' => 'We have processed your booking cancellation.',
])
    <p style="margin:0 0 16px 0;font-size:16px;color:#111827;">Hi {{ $booking->parent_first_name }},</p>
    <p style="margin:0 0 16px 0;font-size:15px;color:#374151;">
        We have processed the cancellation for your booking <strong>{{ $booking->reference }}</strong>.
    </p>
    @if ($reason)
        <p style="margin:0 0 16px 0;font-size:15px;color:#b91c1c;">
            Reason provided: {{ $reason }}.
        </p>
    @endif

    @component('mail.components.booking-summary', ['booking' => $booking])
    @endcomponent

    <p style="margin:0 0 12px 0;font-size:15px;color:#374151;">
        If you’d like to reschedule or rebook, reply with your booking reference and preferred dates—we’ll be happy to help.
    </p>
    <p style="margin:0;font-size:15px;color:#374151;">
        — Team CAMS Services
    </p>
@endcomponent


