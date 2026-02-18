@props(['booking'])

@php
    $totalHours = number_format((float) ($booking->total_hours ?? 0), 2);
    $totalPrice = number_format((float) ($booking->total_price ?? 0), 2);
    $paidAmount = number_format((float) ($booking->paid_amount ?? 0), 2);
    $outstanding = number_format((float) (($booking->total_price ?? 0) - ($booking->paid_amount ?? 0)), 2);
@endphp

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border-collapse:collapse;">
    <tr>
        <td style="padding:16px;border:1px solid #e5e7eb;border-radius:12px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                    <td style="padding:4px 0;font-size:14px;color:#6b7280;">Booking Reference</td>
                    <td style="padding:4px 0;font-size:14px;font-weight:600;text-align:right;color:#111827;">{{ $booking->reference }}</td>
                </tr>
                <tr>
                    <td style="padding:4px 0;font-size:14px;color:#6b7280;">Status</td>
                    <td style="padding:4px 0;font-size:14px;font-weight:600;text-align:right;color:#2563eb;text-transform:capitalize;">{{ $booking->status ?? 'draft' }}</td>
                </tr>
                <tr>
                    <td style="padding:4px 0;font-size:14px;color:#6b7280;">Total Hours</td>
                    <td style="padding:4px 0;font-size:14px;font-weight:600;text-align:right;color:#111827;">{{ $totalHours }} hrs</td>
                </tr>
                <tr>
                    <td style="padding:4px 0;font-size:14px;color:#6b7280;">Total Price</td>
                    <td style="padding:4px 0;font-size:14px;font-weight:600;text-align:right;color:#111827;">£{{ $totalPrice }}</td>
                </tr>
                <tr>
                    <td style="padding:4px 0;font-size:14px;color:#6b7280;">Paid Amount</td>
                    <td style="padding:4px 0;font-size:14px;font-weight:600;text-align:right;color:#16a34a;">£{{ $paidAmount }}</td>
                </tr>
                <tr>
                    <td style="padding:4px 0;font-size:14px;color:#6b7280;">Outstanding</td>
                    <td style="padding:4px 0;font-size:14px;font-weight:600;text-align:right;color:#dc2626;">£{{ $outstanding }}</td>
                </tr>
            </table>
        </td>
    </tr>
</table>


