'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/interfaces/web/hooks/auth/useAuth';
import { childrenRepository } from '@/infrastructure/http/children/ChildrenRepository';
import { validatePhone } from '@/utils/validation';
import { AlertCircle, CheckCircle, ClipboardCheck, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function ChildChecklistPageClient() {
  const router = useRouter();
  const params = useParams();
  const childId = parseInt(params.id as string, 10);
  
  const { children, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [child, setChild] = useState<typeof children[0] | null>(null);

  // Find child from children list or fetch directly
  useEffect(() => {
    if (authLoading) return;
    
    const foundChild = children.find(c => c.id === childId);
    if (foundChild) {
      setChild(foundChild);
    } else if (children.length > 0) {
      // Children loaded but this child not found - might not belong to user
      console.error('Child not found in children list:', childId);
      router.push('/dashboard/parent');
    }
    // If children.length === 0 and authLoading is false, children might still be loading
  }, [children, childId, authLoading, router]);

  const [formData, setFormData] = useState({
    medical_conditions: '',
    allergies: '',
    medications: '',
    dietary_requirements: '',
    emergency_contact_name: '',
    emergency_contact_relationship: '',
    emergency_contact_phone: '',
    emergency_contact_phone_alt: '',
    emergency_contact_address: '',
    special_needs: '',
    behavioral_notes: '',
    activity_restrictions: '',
    consent_photography: false,
    consent_medical_treatment: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isValid, setIsValid] = useState<Record<string, boolean>>({});
  
  // Collapsible sections state - only first section open by default
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    medical: true, // First section open
    emergency: false,
    additional: false,
    consents: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  useEffect(() => {
    // Wait for auth to complete
    if (authLoading) {
      return;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/login?redirect=/children/' + childId + '/checklist');
      return;
    }

    // Wait for child to be found
    if (!child) {
      // Still loading or child not found - keep loading state
      return;
    }

    // Load existing checklist if available
    const loadChecklist = async () => {
      try {
        if (child.has_checklist) {
          const checklist = await childrenRepository.getChecklist(childId);
          setFormData({
            medical_conditions: checklist.medical_conditions || '',
            allergies: checklist.allergies || '',
            medications: checklist.medications || '',
            dietary_requirements: checklist.dietary_requirements || '',
            emergency_contact_name: checklist.emergency_contact_name || '',
            emergency_contact_relationship: checklist.emergency_contact_relationship || '',
            emergency_contact_phone: checklist.emergency_contact_phone || '',
            emergency_contact_phone_alt: checklist.emergency_contact_phone_alt || '',
            emergency_contact_address: checklist.emergency_contact_address || '',
            special_needs: checklist.special_needs || '',
            behavioral_notes: checklist.behavioral_notes || '',
            activity_restrictions: checklist.activity_restrictions || '',
            consent_photography: checklist.consent_photography || false,
            consent_medical_treatment: checklist.consent_medical_treatment || false,
          });
        }
      } catch (err) {
        console.error('Failed to load checklist:', err);
        // Don't block the page if checklist load fails - allow creating new one
      } finally {
        setLoading(false);
      }
    };

    // If no checklist exists, we can still show the form (for creating new checklist)
    if (!child.has_checklist) {
      setLoading(false);
    } else {
      loadChecklist();
    }
  }, [authLoading, isAuthenticated, router, childId, child]);

  // Real-time validation
  useEffect(() => {
    const newErrors: Record<string, string> = {};
    const newIsValid: Record<string, boolean> = {};

    if (touched.emergency_contact_name || formData.emergency_contact_name) {
      if (!formData.emergency_contact_name.trim()) {
        newErrors.emergency_contact_name = 'Emergency contact name is required';
        newIsValid.emergency_contact_name = false;
      } else {
        newIsValid.emergency_contact_name = true;
      }
    }

    if (touched.emergency_contact_phone || formData.emergency_contact_phone) {
      const phoneValidation = validatePhone(formData.emergency_contact_phone);
      if (!phoneValidation.valid) {
        newErrors.emergency_contact_phone = phoneValidation.error || 'Please enter a valid UK phone number';
        newIsValid.emergency_contact_phone = false;
      } else {
        newIsValid.emergency_contact_phone = true;
      }
    }

    if (touched.emergency_contact_phone_alt && formData.emergency_contact_phone_alt) {
      const phoneValidation = validatePhone(formData.emergency_contact_phone_alt);
      if (!phoneValidation.valid) {
        newErrors.emergency_contact_phone_alt = phoneValidation.error || 'Please enter a valid UK phone number';
        newIsValid.emergency_contact_phone_alt = false;
      } else {
        newIsValid.emergency_contact_phone_alt = true;
      }
    }

    setErrors(newErrors);
    setIsValid(newIsValid);
  }, [formData, touched]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    if (!touched[name]) {
      setTouched(prev => ({ ...prev, [name]: true }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setTouched({
      emergency_contact_name: true,
      emergency_contact_phone: true,
    });

    const phoneValidation = validatePhone(formData.emergency_contact_phone);
    
    if (!formData.emergency_contact_name.trim() || !phoneValidation.valid) {
      setErrors({
        emergency_contact_name: !formData.emergency_contact_name.trim() ? 'Emergency contact name is required' : '',
        emergency_contact_phone: phoneValidation.error || '',
      });
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await childrenRepository.saveChecklist(childId, formData);
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/parent');
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save checklist';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading || authLoading || !child) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0080FF] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading checklist...</p>
          {!child && !authLoading && (
            <p className="mt-2 text-sm text-gray-500">Finding child information...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-[30px] p-8 shadow-2xl border border-gray-200">
          <div className="mb-8">
            <Link href="/dashboard/parent" className="text-[#0080FF] hover:text-[#0069cc] text-sm font-semibold mb-4 inline-block flex items-center gap-2">
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <ClipboardCheck className="text-[#0080FF]" size={32} />
              <div>
                <h1 className="text-4xl font-heading font-bold text-[#1E3A5F]">Child Checklist</h1>
                <p className="text-lg text-[#1E3A5F]/80">Complete checklist for {child.name}</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
              <p className="text-sm text-green-600 flex items-center gap-2">
                <CheckCircle size={16} />
                Checklist saved successfully! Redirecting to dashboard...
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Medical Information */}
            <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('medical')}
                className="w-full flex items-center justify-between p-6 bg-gray-50 hover:bg-gray-100 transition-colors"
                aria-expanded={openSections.medical}
              >
                <h2 className="text-xl font-semibold text-[#1E3A5F] flex items-center gap-2">
                  <ClipboardCheck size={20} className="text-[#0080FF]" />
                  Medical Information
                </h2>
                {openSections.medical ? (
                  <ChevronUp size={24} className="text-gray-400" />
                ) : (
                  <ChevronDown size={24} className="text-gray-400" />
                )}
              </button>
              
              {openSections.medical && (
                <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="medical_conditions" className="block text-sm font-semibold text-[#1E3A5F] mb-2">
                    Medical Conditions
                  </label>
                  <textarea
                    name="medical_conditions"
                    id="medical_conditions"
                    rows={3}
                    value={formData.medical_conditions}
                    onChange={handleChange}
                    placeholder="e.g., Asthma (controlled with inhaler)"
                    className="block w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-[#0080FF] focus:ring-[#0080FF] transition-all duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="allergies" className="block text-sm font-semibold text-[#1E3A5F] mb-2">
                    Allergies
                  </label>
                  <textarea
                    name="allergies"
                    id="allergies"
                    rows={3}
                    value={formData.allergies}
                    onChange={handleChange}
                    placeholder="e.g., Peanuts, Dairy"
                    className="block w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-[#0080FF] focus:ring-[#0080FF] transition-all duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="medications" className="block text-sm font-semibold text-[#1E3A5F] mb-2">
                    Current Medications
                  </label>
                  <textarea
                    name="medications"
                    id="medications"
                    rows={3}
                    value={formData.medications}
                    onChange={handleChange}
                    placeholder="e.g., Ventolin inhaler (as needed)"
                    className="block w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-[#0080FF] focus:ring-[#0080FF] transition-all duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="dietary_requirements" className="block text-sm font-semibold text-[#1E3A5F] mb-2">
                    Dietary Requirements
                  </label>
                  <textarea
                    name="dietary_requirements"
                    id="dietary_requirements"
                    rows={3}
                    value={formData.dietary_requirements}
                    onChange={handleChange}
                    placeholder="e.g., Lactose-free diet"
                    className="block w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-[#0080FF] focus:ring-[#0080FF] transition-all duration-200"
                  />
                </div>
                </div>
              )}
            </div>

            {/* Emergency Contacts */}
            <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('emergency')}
                className="w-full flex items-center justify-between p-6 bg-gray-50 hover:bg-gray-100 transition-colors"
                aria-expanded={openSections.emergency}
              >
                <h2 className="text-xl font-semibold text-[#1E3A5F] flex items-center gap-2">
                  <AlertCircle size={20} className="text-red-500" />
                  Emergency Contact *
                  <span className="text-sm font-normal text-red-600">(Required)</span>
                </h2>
                {openSections.emergency ? (
                  <ChevronUp size={24} className="text-gray-400" />
                ) : (
                  <ChevronDown size={24} className="text-gray-400" />
                )}
              </button>
              
              {openSections.emergency && (
                <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="emergency_contact_name" className="block text-sm font-semibold text-[#1E3A5F] mb-2">
                    Contact Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="emergency_contact_name"
                      id="emergency_contact_name"
                      required
                      value={formData.emergency_contact_name}
                      onChange={handleChange}
                      onBlur={() => handleBlur('emergency_contact_name')}
                      placeholder="Jane Smith"
                      className={`block w-full px-4 py-3 pr-10 text-gray-900 bg-white border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400 ${
                        touched.emergency_contact_name
                          ? errors.emergency_contact_name
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                            : isValid.emergency_contact_name
                            ? 'border-green-500 focus:border-green-500 focus:ring-green-200'
                            : 'border-gray-300 focus:border-[#0080FF] focus:ring-[#0080FF]'
                          : 'border-gray-300 focus:border-[#0080FF] focus:ring-[#0080FF]'
                      }`}
                    />
                    {touched.emergency_contact_name && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {errors.emergency_contact_name ? (
                          <AlertCircle className="text-red-500" size={20} />
                        ) : isValid.emergency_contact_name ? (
                          <CheckCircle className="text-green-500" size={20} />
                        ) : null}
                      </div>
                    )}
                  </div>
                  {touched.emergency_contact_name && errors.emergency_contact_name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.emergency_contact_name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="emergency_contact_relationship" className="block text-sm font-semibold text-[#1E3A5F] mb-2">
                    Relationship
                  </label>
                  <input
                    type="text"
                    name="emergency_contact_relationship"
                    id="emergency_contact_relationship"
                    value={formData.emergency_contact_relationship}
                    onChange={handleChange}
                    placeholder="e.g., Mother, Grandparent, Family Friend"
                    className="block w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-[#0080FF] focus:ring-[#0080FF] transition-all duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="emergency_contact_phone" className="block text-sm font-semibold text-[#1E3A5F] mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="emergency_contact_phone"
                      id="emergency_contact_phone"
                      required
                      pattern="^(?:\+44\s?|0)(?:\d{2,4}\s?\d{3,4}\s?\d{3,4})$"
                      inputMode="tel"
                      autoComplete="tel"
                      value={formData.emergency_contact_phone}
                      onChange={handleChange}
                      onBlur={() => handleBlur('emergency_contact_phone')}
                      placeholder="07123 456789"
                      className={`block w-full px-4 py-3 pr-10 text-gray-900 bg-white border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400 ${
                        touched.emergency_contact_phone
                          ? errors.emergency_contact_phone
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                            : isValid.emergency_contact_phone
                            ? 'border-green-500 focus:border-green-500 focus:ring-green-200'
                            : 'border-gray-300 focus:border-[#0080FF] focus:ring-[#0080FF]'
                          : 'border-gray-300 focus:border-[#0080FF] focus:ring-[#0080FF]'
                      }`}
                    />
                    {touched.emergency_contact_phone && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {errors.emergency_contact_phone ? (
                          <AlertCircle className="text-red-500" size={20} />
                        ) : isValid.emergency_contact_phone ? (
                          <CheckCircle className="text-green-500" size={20} />
                        ) : null}
                      </div>
                    )}
                  </div>
                  {touched.emergency_contact_phone && errors.emergency_contact_phone && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.emergency_contact_phone}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="emergency_contact_phone_alt" className="block text-sm font-semibold text-[#1E3A5F] mb-2">
                    Alternative Phone (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="emergency_contact_phone_alt"
                      id="emergency_contact_phone_alt"
                      pattern="^(?:\+44\s?|0)(?:\d{2,4}\s?\d{3,4}\s?\d{3,4})$"
                      inputMode="tel"
                      value={formData.emergency_contact_phone_alt}
                      onChange={handleChange}
                      onBlur={() => handleBlur('emergency_contact_phone_alt')}
                      placeholder="020 1234 5678"
                      className={`block w-full px-4 py-3 pr-10 text-gray-900 bg-white border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400 ${
                        touched.emergency_contact_phone_alt
                          ? errors.emergency_contact_phone_alt
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                            : isValid.emergency_contact_phone_alt
                            ? 'border-green-500 focus:border-green-500 focus:ring-green-200'
                            : 'border-gray-300 focus:border-[#0080FF] focus:ring-[#0080FF]'
                          : 'border-gray-300 focus:border-[#0080FF] focus:ring-[#0080FF]'
                      }`}
                    />
                    {touched.emergency_contact_phone_alt && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {errors.emergency_contact_phone_alt ? (
                          <AlertCircle className="text-red-500" size={20} />
                        ) : isValid.emergency_contact_phone_alt ? (
                          <CheckCircle className="text-green-500" size={20} />
                        ) : null}
                      </div>
                    )}
                  </div>
                  {touched.emergency_contact_phone_alt && errors.emergency_contact_phone_alt && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.emergency_contact_phone_alt}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="emergency_contact_address" className="block text-sm font-semibold text-[#1E3A5F] mb-2">
                    Address (Optional)
                  </label>
                  <textarea
                    name="emergency_contact_address"
                    id="emergency_contact_address"
                    rows={2}
                    value={formData.emergency_contact_address}
                    onChange={handleChange}
                    placeholder="123 High Street, London, IG9 5BT"
                    className="block w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-[#0080FF] focus:ring-[#0080FF] transition-all duration-200"
                  />
                </div>
                </div>
              )}
            </div>

            {/* Additional Information */}
            <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('additional')}
                className="w-full flex items-center justify-between p-6 bg-gray-50 hover:bg-gray-100 transition-colors"
                aria-expanded={openSections.additional}
              >
                <h2 className="text-xl font-semibold text-[#1E3A5F] flex items-center gap-2">
                  <ClipboardCheck size={20} className="text-[#0080FF]" />
                  Additional Information
                </h2>
                {openSections.additional ? (
                  <ChevronUp size={24} className="text-gray-400" />
                ) : (
                  <ChevronDown size={24} className="text-gray-400" />
                )}
              </button>
              
              {openSections.additional && (
                <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="special_needs" className="block text-sm font-semibold text-[#1E3A5F] mb-2">
                    Special Needs (SEN, disabilities, learning difficulties)
                  </label>
                  <textarea
                    name="special_needs"
                    id="special_needs"
                    rows={3}
                    value={formData.special_needs}
                    onChange={handleChange}
                    placeholder="None reported"
                    className="block w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-[#0080FF] focus:ring-[#0080FF] transition-all duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="behavioral_notes" className="block text-sm font-semibold text-[#1E3A5F] mb-2">
                    Behavioral Notes
                  </label>
                  <textarea
                    name="behavioral_notes"
                    id="behavioral_notes"
                    rows={3}
                    value={formData.behavioral_notes}
                    onChange={handleChange}
                    placeholder="e.g., Very active, loves outdoor activities"
                    className="block w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-[#0080FF] focus:ring-[#0080FF] transition-all duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="activity_restrictions" className="block text-sm font-semibold text-[#1E3A5F] mb-2">
                    Activity Restrictions
                  </label>
                  <textarea
                    name="activity_restrictions"
                    id="activity_restrictions"
                    rows={3}
                    value={formData.activity_restrictions}
                    onChange={handleChange}
                    placeholder="e.g., No high-intensity activities during asthma flare-ups"
                    className="block w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-[#0080FF] focus:ring-[#0080FF] transition-all duration-200"
                  />
                </div>
                </div>
              )}
            </div>

            {/* Consents */}
            <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('consents')}
                className="w-full flex items-center justify-between p-6 bg-gray-50 hover:bg-gray-100 transition-colors"
                aria-expanded={openSections.consents}
              >
                <h2 className="text-xl font-semibold text-[#1E3A5F] flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-500" />
                  Consents
                </h2>
                {openSections.consents ? (
                  <ChevronUp size={24} className="text-gray-400" />
                ) : (
                  <ChevronDown size={24} className="text-gray-400" />
                )}
              </button>
              
              {openSections.consents && (
                <div className="p-6 space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="consent_photography"
                    checked={formData.consent_photography}
                    onChange={handleChange}
                    className="mt-1 w-5 h-5 text-[#0080FF] border-gray-300 rounded focus:ring-[#0080FF]"
                  />
                  <div>
                    <span className="text-sm font-semibold text-[#1E3A5F]">Consent for Photography</span>
                    <p className="text-xs text-gray-600 mt-1">
                      I consent to photos and videos being taken of my child during activities
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="consent_medical_treatment"
                    checked={formData.consent_medical_treatment}
                    onChange={handleChange}
                    className="mt-1 w-5 h-5 text-[#0080FF] border-gray-300 rounded focus:ring-[#0080FF]"
                  />
                  <div>
                    <span className="text-sm font-semibold text-[#1E3A5F]">Consent for Emergency Medical Treatment</span>
                    <p className="text-xs text-gray-600 mt-1">
                      I consent to emergency medical treatment being provided to my child if necessary
                    </p>
                  </div>
                </label>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/parent')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving || success}
                className="flex-1"
              >
                {saving ? 'Saving...' : success ? 'Saved!' : 'Save Checklist'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

