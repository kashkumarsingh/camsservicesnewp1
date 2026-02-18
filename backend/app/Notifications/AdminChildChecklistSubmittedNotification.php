<?php

namespace App\Notifications;

use App\Models\Child;
use App\Models\ChildChecklist;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Admin Child Checklist Submitted Notification
 * 
 * Clean Architecture: Interface Layer (Notification)
 * Purpose: Notify admins when a parent submits a child checklist for review
 * Location: backend/app/Notifications/AdminChildChecklistSubmittedNotification.php
 * 
 * Triggered: When parent submits/updates child checklist
 * Recipients: All admin users
 * 
 * Contains:
 * - Child name, age, parent details
 * - Emergency contact information
 * - Medical conditions/allergies (if any)
 * - Special needs (if any)
 * - Link to admin dashboard to review checklist
 */
class AdminChildChecklistSubmittedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public Child $child,
        public ChildChecklist $checklist
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $parent = $this->child->user;
        $childName = $this->child->name;
        $parentName = $parent->name;
        $childAge = $this->child->date_of_birth 
            ? \Carbon\Carbon::parse($this->child->date_of_birth)->age 
            : 'N/A';

        // Check for critical information flags
        $hasMedicalConditions = !empty($this->checklist->medical_conditions);
        $hasAllergies = !empty($this->checklist->allergies);
        $hasMedications = !empty($this->checklist->medications);
        $hasSpecialNeeds = !empty($this->checklist->special_needs);
        $hasBehavioralNotes = !empty($this->checklist->behavioral_notes);
        $hasActivityRestrictions = !empty($this->checklist->activity_restrictions);

        // Admin review URL
        $adminUrl = config('app.url') . '/admin/children/' . $this->child->id . '/edit';

        return (new MailMessage)
            ->subject('New Child Checklist Awaiting Review - ' . $childName)
            ->markdown('mail.admin.child-checklist-submitted', [
                'childName' => $childName,
                'childAge' => $childAge,
                'parentName' => $parentName,
                'parentEmail' => $parent->email,
                'parentPhone' => $parent->phone ?? 'Not provided',
                'emergencyContactName' => $this->checklist->emergency_contact_name,
                'emergencyContactPhone' => $this->checklist->emergency_contact_phone,
                'emergencyContactRelationship' => $this->checklist->emergency_contact_relationship ?? 'Not specified',
                'hasMedicalConditions' => $hasMedicalConditions,
                'medicalConditions' => $this->checklist->medical_conditions,
                'hasAllergies' => $hasAllergies,
                'allergies' => $this->checklist->allergies,
                'hasMedications' => $hasMedications,
                'medications' => $this->checklist->medications,
                'hasDietaryRequirements' => !empty($this->checklist->dietary_requirements),
                'dietaryRequirements' => $this->checklist->dietary_requirements,
                'hasSpecialNeeds' => $hasSpecialNeeds,
                'specialNeeds' => $this->checklist->special_needs,
                'hasBehavioralNotes' => $hasBehavioralNotes,
                'behavioralNotes' => $this->checklist->behavioral_notes,
                'hasActivityRestrictions' => $hasActivityRestrictions,
                'activityRestrictions' => $this->checklist->activity_restrictions,
                'consentPhotography' => $this->checklist->consent_photography ? 'Yes' : 'No',
                'consentMedicalTreatment' => $this->checklist->consent_medical_treatment ? 'Yes' : 'No',
                'adminUrl' => $adminUrl,
                'child' => $this->child,
                'checklist' => $this->checklist,
                'parent' => $parent,
            ]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'child_id' => $this->child->id,
            'child_name' => $this->child->name,
            'checklist_id' => $this->checklist->id,
            'parent_id' => $this->child->user_id,
            'submitted_at' => now()->toIso8601String(),
        ];
    }
}
