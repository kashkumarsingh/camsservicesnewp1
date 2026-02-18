@php
    $isConfirmedAndPaid = $booking->status === 'confirmed' && $booking->payment_status === 'paid';
    $title = $isConfirmedAndPaid ? 'New Booking Confirmed - Payment Received' : 'New Booking Created';
    $preview = $isConfirmedAndPaid 
        ? 'A new booking has been confirmed and payment received.' 
        : 'A new booking has been created and requires your attention.';
@endphp

@component('mail.layouts.cams', [
    'title' => $title,
    'preview' => $preview,
])
    <p style="margin:0 0 16px 0;font-size:16px;color:#111827;">Hello Admin,</p>
    
    @if($isConfirmedAndPaid)
        {{-- CONFIRMED & PAID: Success message --}}
        <p style="margin:0 0 16px 0;font-size:15px;color:#059669;">
            <strong>✅ Payment Received!</strong> A new booking has been confirmed and payment has been received.
        </p>
        <p style="margin:0 0 16px 0;font-size:15px;color:#374151;">
            <strong>Action Required:</strong> Assign trainers and schedule sessions for this booking.
        </p>
    @else
        {{-- DRAFT/PENDING: Pending message --}}
        <p style="margin:0 0 16px 0;font-size:15px;color:#374151;">
            A new booking has been created and requires your attention.
        </p>
    @endif

    <div style="margin:24px 0;padding:20px;background-color:#f0f9ff;border-radius:8px;border-left:4px solid #0ea5e9;">
        <p style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:#0c4a6e;">
            Booking Details
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#075985;">
            <strong>Reference:</strong> {{ $reference }}
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#075985;">
            <strong>Parent:</strong> {{ $parentName }}
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#075985;">
            <strong>Package:</strong> {{ $packageName }}
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#075985;">
            <strong>Total Price:</strong> £{{ $totalPrice }}
        </p>
        <p style="margin:0 0 8px 0;font-size:15px;color:#075985;">
            <strong>Payment Status:</strong> {{ $paymentStatus }}
        </p>
        <p style="margin:0;font-size:15px;color:#075985;">
            <strong>Booking Status:</strong> {{ $bookingStatus }}
        </p>
    </div>

    <p style="margin:24px 0 12px 0;text-align:center;">
        <a href="{{ config('app.url') }}/admin/bookings/{{ $booking->id }}" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#0f172a,#1d4ed8);color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">View Booking</a>
    </p>

    <p style="margin:0;font-size:15px;color:#374151;">
        — CAMS Services Admin
    </p>
@endcomponent
