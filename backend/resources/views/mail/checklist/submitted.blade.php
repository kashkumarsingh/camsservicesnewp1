@component('mail.layouts.cams', [
    'title' => 'Checklist Received',
    'preview' => 'We have received your child\'s checklist.',
])
    <p style="margin:0 0 16px 0;font-size:16px;color:#111827;">Hi {{ $parentName }},</p>
    
    <p style="margin:0 0 16px 0;font-size:15px;color:#374151;">
        Thank you for completing the checklist for <strong>{{ $childName }}</strong>. We've received all the important information we need to provide the best possible care.
    </p>

    <div style="margin:24px 0;padding:20px;background-color:#dbeafe;border-radius:8px;border-left:4px solid #3b82f6;">
        <p style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:#1e40af;">
            ✅ Checklist Submitted Successfully
        </p>
        <p style="margin:0;font-size:15px;color:#1e3a8a;">
            Our team is reviewing the information and will contact you if we need any clarification.
        </p>
    </div>

    <p style="margin:24px 0 16px 0;font-size:15px;color:#374151;">
        <strong>What happens next?</strong>
    </p>
    <ol style="margin:0 0 16px 0;padding-left:20px;font-size:15px;color:#374151;">
        <li style="margin-bottom:8px;">Our admin team will review {{ $childName }}'s checklist</li>
        <li style="margin-bottom:8px;">We'll verify all medical and emergency contact information</li>
        <li style="margin-bottom:8px;">You'll receive approval confirmation within 24 hours</li>
        <li>Once approved, you can start booking sessions</li>
    </ol>

    <p style="margin:24px 0 12px 0;font-size:15px;color:#374151;">
        Need to update any information? Just log in to your dashboard and edit {{ $childName }}'s checklist.
    </p>

    <p style="margin:0;font-size:15px;color:#374151;">
        — Team CAMS Services
    </p>
@endcomponent
