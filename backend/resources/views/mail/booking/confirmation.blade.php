@php
    $isConfirmedAndPaid = $booking->status === 'confirmed' && $booking->payment_status === 'paid';
    $title = $isConfirmedAndPaid ? 'Booking Confirmed & Payment Received' : 'Booking Received';
    $preview = $isConfirmedAndPaid 
        ? 'Your booking is confirmed and payment received!' 
        : 'We have received your booking request.';
@endphp

@component('mail.layouts.cams', [
    'title' => $title,
    'preview' => $preview,
])
    <p style="margin:0 0 16px 0;font-size:16px;color:#111827;">Hi {{ $booking->parent_first_name }},</p>
    
    @if($isConfirmedAndPaid)
        {{-- CONFIRMED & PAID: Success message --}}
        <p style="margin:0 0 16px 0;font-size:15px;color:#059669;">
            <strong>🎉 Great news!</strong> Your booking for <strong>{{ $packageName }}</strong> is confirmed and your payment has been received.
        </p>
        <p style="margin:0 0 16px 0;font-size:15px;color:#374151;">
            You're all set! Your package is ready to use. <strong>You can now book your sessions directly from your dashboard.</strong>
        </p>
        <p style="margin:0 0 16px 0;text-align:center;">
            <a href="{{ config('app.frontend_url') }}/dashboard" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#0f172a,#1d4ed8);color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Book Your Sessions Now</a>
        </p>
    @else
        {{-- DRAFT/PENDING: Pending message --}}
        <p style="margin:0 0 16px 0;font-size:15px;color:#374151;">
            Thank you for choosing CAMS Services! We have received your booking request for
            <strong>{{ $packageName }}</strong>.
        </p>
        <p style="margin:0 0 16px 0;font-size:15px;color:#374151;">
            Our team will review the details and confirm trainer availability shortly. You can keep this email for
            your records.
        </p>
    @endif

    @component('mail.components.booking-summary', ['booking' => $booking])
    @endcomponent

    <p style="margin:0 0 12px 0;font-size:15px;color:#374151;">
        Need to update anything? Just reply to this email with your booking reference and we’ll take it from there.
    </p>
    <p style="margin:0;font-size:15px;color:#374151;">
        — Team CAMS Services
    </p>
@endcomponent


