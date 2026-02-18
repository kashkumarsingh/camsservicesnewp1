"use client";

import React, { useState, useEffect } from "react";
import { ClipboardCheck, AlertCircle, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { childrenRepository } from "@/infrastructure/http/children/ChildrenRepository";
import type { Child } from "@/core/application/auth/types";

interface CompleteChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  child: Child | null;
  onSubmit: (data: ChecklistFormData) => Promise<void>;
}

export interface ChecklistFormData {
  emergency_contact_name: string;
  emergency_contact_phone: string;
  medical_conditions?: string;
  allergies?: string;
  consent_medical_treatment: boolean;
}

const initialFormData: ChecklistFormData = {
  emergency_contact_name: "",
  emergency_contact_phone: "",
  medical_conditions: "",
  allergies: "",
  consent_medical_treatment: false,
};

/**
 * Complete Checklist Modal (Parent Dashboard)
 *
 * Clean Architecture: Presentation Layer (UI Component)
 * Purpose: Minimal checklist form modal (stays on dashboard). Pre-fills when child already has a checklist.
 * Location: frontend/src/components/dashboard/modals/CompleteChecklistModal.tsx
 */
export default function CompleteChecklistModal({
  isOpen,
  onClose,
  child,
  onSubmit,
}: CompleteChecklistModalProps) {
  const [formData, setFormData] = useState<ChecklistFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingChecklist, setIsLoadingChecklist] = useState(false);

  // Pre-fill form when modal opens with a child who already has a checklist
  useEffect(() => {
    if (!isOpen || !child) {
      setFormData(initialFormData);
      setIsLoadingChecklist(false);
      return;
    }
    if (!child.has_checklist) {
      setFormData(initialFormData);
      setIsLoadingChecklist(false);
      return;
    }
    let cancelled = false;
    setIsLoadingChecklist(true);
    childrenRepository
      .getChecklist(child.id)
      .then((checklist) => {
        if (cancelled) return;
        setFormData({
          emergency_contact_name: checklist.emergency_contact_name ?? "",
          emergency_contact_phone: checklist.emergency_contact_phone ?? "",
          medical_conditions: checklist.medical_conditions ?? "",
          allergies: checklist.allergies ?? "",
          consent_medical_treatment: checklist.consent_medical_treatment ?? false,
        });
      })
      .catch(() => {
        if (!cancelled) setFormData(initialFormData);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingChecklist(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, child?.id, child?.has_checklist]);

  if (!isOpen) return null;

  const childName = child?.name ?? "your child";

  const handleChange = (field: keyof ChecklistFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.emergency_contact_name.trim()) {
      newErrors.emergency_contact_name = "Emergency contact name is required";
    }

    if (!formData.emergency_contact_phone.trim()) {
      newErrors.emergency_contact_phone = "Emergency contact phone is required";
    } else if (!/^[\d\s\+\-\(\)]+$/.test(formData.emergency_contact_phone)) {
      newErrors.emergency_contact_phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Modal will be closed by parent component
    } catch (error) {
      console.error("Failed to submit checklist:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <ClipboardCheck size={18} className="text-blue-600" />
            Complete Checklist for {childName}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 transition-colors hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Body - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoadingChecklist && (
            <div className="flex items-center justify-center py-8 text-gray-500">
              <span className="text-sm">Loading checklist...</span>
            </div>
          )}
          {!isLoadingChecklist && (
            <>
          {/* Emergency Contact Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Emergency Contact Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.emergency_contact_name}
              onChange={(e) => handleChange("emergency_contact_name", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.emergency_contact_name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g., John Smith"
            />
            {errors.emergency_contact_name && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.emergency_contact_name}
              </p>
            )}
          </div>

          {/* Emergency Contact Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Emergency Contact Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.emergency_contact_phone}
              onChange={(e) => handleChange("emergency_contact_phone", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.emergency_contact_phone ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g., 07123 456789"
            />
            {errors.emergency_contact_phone && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.emergency_contact_phone}
              </p>
            )}
          </div>

          {/* Medical Conditions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medical Conditions
            </label>
            <textarea
              value={formData.medical_conditions}
              onChange={(e) => handleChange("medical_conditions", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              placeholder="Any medical conditions we should know about (optional)"
            />
          </div>

          {/* Allergies */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Allergies
            </label>
            <textarea
              value={formData.allergies}
              onChange={(e) => handleChange("allergies", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              placeholder="Any allergies we should know about (optional)"
            />
          </div>

          {/* Consent for Medical Treatment */}
          <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <input
              type="checkbox"
              id="consent_medical_treatment"
              checked={formData.consent_medical_treatment}
              onChange={(e) => handleChange("consent_medical_treatment", e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="consent_medical_treatment" className="text-sm text-gray-700">
              I consent to emergency medical treatment if required during sessions <span className="text-red-500">*</span>
            </label>
          </div>
            </>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-4">
          <Button
            type="button"
            variant="bordered"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            icon={<ClipboardCheck size={16} />}
            onClick={handleSubmit}
            disabled={isSubmitting || isLoadingChecklist}
          >
            {isSubmitting ? "Submitting..." : "Submit Checklist"}
          </Button>
        </div>
      </div>
    </div>
  );
}
