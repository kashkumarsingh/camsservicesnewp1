@component('mail.layouts.cams', [
    'title' => 'Payment Received',
    'preview' => 'A payment has been received for a booking.',
])
    <p style="margin:0 0 16px 0;font-size:16px;color:#111827;">Hello Admin,</p>
    <p style="margin:0 0 16px 0;font-size:15px;color:#374151;">
        A payment has been successfully received for a booking.
    </p>

    <div style="margin:24px 0;padding:20px;background-color:#f0fdf4;border-radius:8px;border-left:4px solid #22c55e;">
        <p style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:#14532d;">
            Payment Details
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#166534;">
            <strong>Booking Reference:</strong> {{ $reference }}
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#166534;">
            <strong>Parent:</strong> {{ $parentName }}
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#166534;">
            <strong>Package:</strong> {{ $packageName }}
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#166534;">
            <strong>Amount Paid:</strong> £{{ $paidAmount }}
        </p>
        <p style="margin:0;font-size:15px;color:#166534;">
            <strong>Total Price:</strong> £{{ $totalPrice }}
        </p>
    </div>

    <p style="margin:24px 0 12px 0;text-align:center;">
        <a href="{{ config('app.url') }}/admin/bookings/{{ $booking->id }}" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#0f172a,#1d4ed8);color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">View Booking</a>
    </p>

    <p style="margin:0;font-size:15px;color:#374151;">
        — CAMS Services Admin
    </p>
@endcomponent
