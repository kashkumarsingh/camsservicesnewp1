@component('mail.layouts.cams', [
    'title' => 'Payment Received',
    'preview' => 'We have received your booking payment.',
])
    <p style="margin:0 0 16px 0;font-size:16px;color:#111827;">Hi {{ $booking->parent_first_name ?? 'there' }},</p>
    <p style="margin:0 0 16px 0;font-size:15px;color:#374151;">
        We’ve received a payment of <strong>£{{ number_format((float) $payment->amount, 2) }}</strong>
        via {{ ucfirst($payment->payment_method ?? 'unknown method') }}.
    </p>

    <p style="margin:0 0 8px 0;font-size:15px;color:#374151;">
        Transaction ID: <strong>{{ $payment->transaction_id ?? 'N/A' }}</strong><br>
        Payment Status: <strong>{{ ucfirst($payment->status) }}</strong>
    </p>

    @component('mail.components.booking-summary', ['booking' => $booking])
    @endcomponent

    <p style="margin:0 0 12px 0;font-size:15px;color:#374151;">
        If this payment was unexpected or you need to discuss your plan, reply with your booking reference and we’ll get back to you shortly.
    </p>
    <p style="margin:0;font-size:15px;color:#374151;">
        — Team CAMS Services
    </p>
@endcomponent


