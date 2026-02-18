@component('mail::message')
# New Child Checklist Awaiting Review

Hello Admin,

A parent has submitted a child checklist that requires your review and approval.

---

## Child Information

**Name:** {{ $childName }}  
**Age:** {{ $childAge }} years  
**Parent:** {{ $parentName }} ({{ $parentEmail }})  
**Parent Phone:** {{ $parentPhone }}

---

## Emergency Contact

**Name:** {{ $emergencyContactName }}  
**Relationship:** {{ $emergencyContactRelationship }}  
**Phone:** {{ $emergencyContactPhone }}

---

@if($hasMedicalConditions || $hasAllergies || $hasMedications || $hasDietaryRequirements)
## ⚠️ Medical Information

@if($hasMedicalConditions)
**Medical Conditions:**  
{{ $medicalConditions }}
@endif

@if($hasAllergies)
**Allergies:**  
{{ $allergies }}
@endif

@if($hasMedications)
**Current Medications:**  
{{ $medications }}
@endif

@if($hasDietaryRequirements)
**Dietary Requirements:**  
{{ $dietaryRequirements }}
@endif

---
@endif

@if($hasSpecialNeeds || $hasBehavioralNotes || $hasActivityRestrictions)
## 📋 Additional Notes

@if($hasSpecialNeeds)
**Special Needs:**  
{{ $specialNeeds }}
@endif

@if($hasBehavioralNotes)
**Behavioral Notes:**  
{{ $behavioralNotes }}
@endif

@if($hasActivityRestrictions)
**Activity Restrictions:**  
{{ $activityRestrictions }}
@endif

---
@endif

## Consent Given

✅ **Photography Consent:** {{ $consentPhotography }}  
✅ **Medical Treatment Consent:** {{ $consentMedicalTreatment }}

---

## Action Required

Please review this checklist in the admin panel and approve or request changes.

@component('mail::button', ['url' => $adminUrl, 'color' => 'success'])
Review Checklist in Admin Panel
@endcomponent

**Important:** The child cannot participate in booked sessions until their checklist is reviewed and approved.

---

If you have any questions about this checklist, please contact the parent directly at {{ $parentEmail }} or {{ $parentPhone }}.

Thanks,<br>
{{ config('app.name') }} Team

@component('mail::subcopy')
**Admin Note:** This notification was sent because a parent submitted a child checklist requiring approval. To manage notification preferences, visit your admin settings.
@endcomponent

@endcomponent
