@component('mail.layouts.cams', [
    'title' => 'Payment Due Tomorrow',
    'preview' => 'Your payment for ' . $packageName . ' is due tomorrow',
])
    <p style="margin:0 0 16px 0;font-size:16px;color:#111827;">Hello {{ $booking->user?->name ?? 'Parent' }},</p>
    
    <p style="margin:0 0 16px 0;font-size:15px;color:#374151;">
        This is a friendly reminder that your payment for <strong>{{ $packageName }}</strong> is due <strong>tomorrow</strong>.
    </p>

    <div style="margin:24px 0;padding:20px;background-color:#fef3c7;border-radius:8px;border-left:4px solid #f59e0b;">
        <p style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:#78350f;">
            💰 Payment Details
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#92400e;">
            <strong>Amount Due:</strong> £{{ number_format($outstandingAmount, 2) }}
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#92400e;">
            <strong>Due Date:</strong> {{ $booking->payment_due_date ? \Carbon\Carbon::parse($booking->payment_due_date)->format('l, F j, Y') : 'Not set' }}
        </p>
        <p style="margin:0;font-size:15px;color:#92400e;">
            <strong>Booking Reference:</strong> {{ $reference }}
        </p>
    </div>

    <p style="margin:24px 0 12px 0;text-align:center;">
        <a href="{{ config('app.frontend_url') }}/bookings/{{ $booking->id }}/payment" style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#0f172a,#1d4ed8);color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">💳 Pay Now</a>
    </p>

    <div style="margin:32px 0;padding:16px;background-color:#f0f9ff;border-radius:8px;">
        <p style="margin:0 0 8px 0;font-size:14px;font-weight:600;color:#0c4a6e;">
            ℹ️ Important Information
        </p>
        <p style="margin:0;font-size:14px;color:#0369a1;">
            Unpaid bookings may be cancelled after the due date. Complete your payment to keep your reservation active.
        </p>
    </div>

    <p style="margin:24px 0 0 0;font-size:15px;color:#374151;">
        If you've already paid, please disregard this email. If you have any questions, reply to this email and we'll be happy to help!
    </p>

    <p style="margin:16px 0 0 0;font-size:15px;color:#374151;">
        Best regards,<br>
        The CAMS Services Team
    </p>
@endcomponent
