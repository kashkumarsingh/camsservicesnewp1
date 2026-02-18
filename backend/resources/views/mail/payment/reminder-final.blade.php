@component('mail.layouts.cams', [
    'title' => 'Urgent: Payment Overdue',
    'preview' => 'Your booking may be cancelled - action required',
])
    <p style="margin:0 0 16px 0;font-size:16px;color:#111827;">Hello {{ $booking->user?->name ?? 'Parent' }},</p>
    
    <p style="margin:0 0 16px 0;font-size:15px;color:#374151;">
        Your payment for <strong>{{ $packageName }}</strong> is now <strong>overdue by 7 days</strong>.
    </p>

    <div style="margin:24px 0;padding:20px;background-color:#fef2f2;border-radius:8px;border-left:4px solid #ef4444;">
        <p style="margin:0 0 12px 0;font-size:18px;font-weight:700;color:#7f1d1d;">
            ⚠️ Urgent Action Required
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#991b1b;">
            Your booking will be <strong>automatically cancelled</strong> if payment is not received within 7 days.
        </p>
        <p style="margin:0;font-size:14px;color:#991b1b;">
            Amount Outstanding: <strong>£{{ number_format($outstandingAmount, 2) }}</strong>
        </p>
    </div>

    <p style="margin:24px 0 12px 0;text-align:center;">
        <a href="{{ config('app.frontend_url') }}/bookings/{{ $booking->id }}/payment" style="display:inline-block;padding:16px 32px;background:linear-gradient(135deg,#dc2626,#7f1d1d);color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700;font-size:18px;box-shadow:0 6px 12px rgba(0,0,0,0.2);">💳 Pay Now to Keep Booking</a>
    </p>
    <p style="margin:8px 0 0 0;text-align:center;font-size:13px;color:#6b7280;">
        Don't lose your booking—act now!
    </p>

    <div style="margin:32px 0;padding:20px;background-color:#f0f9ff;border-radius:8px;">
        <p style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:#0c4a6e;">
            📋 Booking Details
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#0369a1;">
            <strong>Package:</strong> {{ $packageName }}
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#0369a1;">
            <strong>Reference:</strong> {{ $reference }}
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#0369a1;">
            <strong>Amount Due:</strong> £{{ number_format($outstandingAmount, 2) }}
        </p>
        <p style="margin:0;font-size:15px;color:#0369a1;">
            <strong>Original Due Date:</strong> {{ $booking->payment_due_date ? \Carbon\Carbon::parse($booking->payment_due_date)->format('F j, Y') : 'Not set' }}
        </p>
    </div>

    <div style="margin:24px 0;padding:16px;background-color:#f9fafb;border-radius:8px;border:2px solid #e5e7eb;">
        <p style="margin:0 0 8px 0;font-size:14px;font-weight:600;color:#111827;">
            💬 Need Help or Want to Cancel?
        </p>
        <p style="margin:0 0 8px 0;font-size:14px;color:#6b7280;">
            If you're unable to complete payment or need to cancel your booking, please let us know.
        </p>
        <p style="margin:0;font-size:14px;color:#6b7280;">
            📧 Email: <a href="mailto:{{ config('mail.from.address') }}" style="color:#1d4ed8;text-decoration:underline;">{{ config('mail.from.address') }}</a>
        </p>
    </div>

    <p style="margin:24px 0 0 0;font-size:15px;color:#374151;">
        We value your business and hope to welcome your child to CAMS Services soon!
    </p>

    <p style="margin:16px 0 0 0;font-size:15px;color:#374151;">
        Kind regards,<br>
        The CAMS Services Team
    </p>
@endcomponent
