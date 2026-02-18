'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { User, Mail, Phone, PlusCircle, Trash2, HeartPulse, CheckCircle2, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { validateEmail, validatePhone, validateFullName, validateAge } from '@/utils/validation';

interface ChildDetails {
  id: number;
  name: string;
  age: string | number;
  medicalInfo?: string;
}

interface ParentChildDetailsFormProps {
  parentName: string;
  setParentName: (name: string) => void;
  parentEmail: string;
  setParentEmail: (email: string) => void;
  parentPhone: string;
  setParentPhone: (phone: string) => void;
  childrenDetails: ChildDetails[];
  setChildrenDetails: (children: ChildDetails[]) => void;
  onNext: () => void;
  hideNavigation?: boolean; // Hide navigation button when used in combined step
}

/**
 * Parent Child Details Form - Simplified (No Location)
 * 
 * Clean Architecture Layer: Presentation (UI Components)
 * Purpose: Collects parent and child basic information (name, email, phone, child name, age, medical info)
 * Location is collected separately in LocationStep
 */
const ParentChildDetailsForm: React.FC<ParentChildDetailsFormProps> = ({
  parentName,
  setParentName,
  parentEmail,
  setParentEmail,
  parentPhone,
  setParentPhone,
  childrenDetails,
  setChildrenDetails,
  onNext,
  hideNavigation = false,
}) => {
  const [activeChildId, setActiveChildId] = useState<number | null>(childrenDetails[0]?.id ?? null);
  
  // Real-time validation states
  const [nameValid, setNameValid] = useState<boolean | null>(null);
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [phoneValid, setPhoneValid] = useState<boolean | null>(null);
  const [childNameValid, setChildNameValid] = useState<Record<number, boolean | null>>({});
  const [childAgeValid, setChildAgeValid] = useState<Record<number, boolean | null>>({});
  
  // Error messages
  const [nameError, setNameError] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');
  const [childNameErrors, setChildNameErrors] = useState<Record<number, string>>({});
  const [childAgeErrors, setChildAgeErrors] = useState<Record<number, string>>({});

  // Keep active tab in sync with children list
  useEffect(() => {
    if (!childrenDetails.length) {
      setActiveChildId(null);
      return;
    }
    const stillExists = childrenDetails.some(c => c.id === activeChildId);
    if (!stillExists) {
      setActiveChildId(childrenDetails[0].id);
    }
  }, [childrenDetails, activeChildId]);
  
  // Real-time validation for parent name
  useEffect(() => {
    if (parentName.trim().length === 0) {
      setNameValid(null);
      setNameError('');
    } else {
      const validation = validateFullName(parentName);
      setNameValid(validation.valid);
      setNameError(validation.error || '');
    }
  }, [parentName]);
  
  // Real-time validation for parent email
  useEffect(() => {
    if (parentEmail.trim().length === 0) {
      setEmailValid(null);
      setEmailError('');
    } else {
      const validation = validateEmail(parentEmail);
      setEmailValid(validation.valid);
      setEmailError(validation.error || '');
    }
  }, [parentEmail]);
  
  // Real-time validation for parent phone
  useEffect(() => {
    if (parentPhone.trim().length === 0) {
      setPhoneValid(null);
      setPhoneError('');
    } else {
      const validation = validatePhone(parentPhone);
      setPhoneValid(validation.valid);
      setPhoneError(validation.error || '');
    }
  }, [parentPhone]);
  
  // Real-time validation for child names
  useEffect(() => {
    const newValidations: Record<number, boolean | null> = {};
    const newErrors: Record<number, string> = {};
    childrenDetails.forEach(child => {
      if (child.name.trim().length === 0) {
        newValidations[child.id] = null;
        newErrors[child.id] = '';
      } else {
        const validation = validateFullName(child.name);
        newValidations[child.id] = validation.valid;
        newErrors[child.id] = validation.error || '';
      }
    });
    setChildNameValid(newValidations);
    setChildNameErrors(newErrors);
  }, [childrenDetails]);
  
  // Real-time validation for child ages
  useEffect(() => {
    const newValidations: Record<number, boolean | null> = {};
    const newErrors: Record<number, string> = {};
    childrenDetails.forEach(child => {
      if (!child.age || String(child.age).trim().length === 0) {
        newValidations[child.id] = null;
        newErrors[child.id] = '';
      } else {
        const validation = validateAge(child.age);
        newValidations[child.id] = validation.valid;
        newErrors[child.id] = validation.error || '';
      }
    });
    setChildAgeValid(newValidations);
    setChildAgeErrors(newErrors);
  }, [childrenDetails]);

  const activeChild = useMemo(() => childrenDetails.find(c => c.id === activeChildId) || null, [childrenDetails, activeChildId]);

  const handleAddChild = () => {
    if (childrenDetails.length >= 5) {
      return; // Maximum 5 children allowed
    }
    const newId = childrenDetails.length > 0 ? Math.max(...childrenDetails.map(c => c.id)) + 1 : 1;
    const newChild: ChildDetails = { 
      id: newId, 
      name: '', 
      age: '', 
      medicalInfo: '',
    };
    setChildrenDetails([...childrenDetails, newChild]);
    setActiveChildId(newId);
  };

  const handleRemoveChild = (id: number) => {
    const remaining = childrenDetails.filter(child => child.id !== id);
    setChildrenDetails(remaining);
    if (activeChildId === id) {
      setActiveChildId(remaining[0]?.id ?? null);
    }
  };

  const updateChild = (id: number, field: keyof ChildDetails, value: string | number) => {
    setChildrenDetails(
      childrenDetails.map(child =>
        child.id === id ? { ...child, [field]: value } : child
      )
    );
  };

  const canProceed = () => {
    return (
      parentName.trim() &&
      parentEmail.trim() &&
      parentPhone.trim() &&
      childrenDetails.length > 0 &&
      childrenDetails.every(child => {
        const nameParts = child.name.trim().split(/\s+/).filter(Boolean);
        const hasFullName = nameParts.length >= 2; // Require both first and last name
        return (
          child.name.trim() &&
          hasFullName &&
          child.age
        );
      })
    );
  };

  const getBlockingMessage = (): string | null => {
    if (!parentName.trim()) return 'Add your name to continue.';
    if (!parentEmail.trim()) return 'Add your email address.';
    if (!parentPhone.trim()) return 'Add your phone number.';
    if (!childrenDetails.length) return 'Add at least one child to this booking.';

    for (let index = 0; index < childrenDetails.length; index += 1) {
      const child = childrenDetails[index];
      const label = `Child ${index + 1}`;
      if (!child.name.trim()) return `${label}: add a name.`;
      const nameParts = child.name.trim().split(/\s+/).filter(Boolean);
      if (nameParts.length < 2) return `${label}: add both first and last name.`;
      if (!child.age) return `${label}: add an age.`;
    }
    return null;
  };

  const blockingMessage = getBlockingMessage();

  const isParentValid = () => {
    return (
      parentName.trim() &&
      parentEmail.trim() &&
      parentPhone.trim()
    );
  };

  const isChildValid = (child: ChildDetails) => {
    const nameParts = child.name.trim().split(/\s+/).filter(Boolean);
    return (
      child.name.trim() &&
      nameParts.length >= 2 &&
      child.age
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header Card */}
      <div className="bg-white rounded-[30px] shadow-lg border-2 border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#0080FF] to-[#00D4FF] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <User className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white">Your Details</h2>
              <p className="text-xs md:text-sm text-blue-100">Parent & child information</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Parent Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <User className="text-[#0080FF]" size={20} />
              <h3 className="text-lg font-bold text-[#1E3A5F]">Parent/Guardian Information</h3>
              {isParentValid() && (
                <CheckCircle2 className="text-green-500 ml-auto" size={20} />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    autoComplete="name"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className={`w-full pl-10 pr-10 py-2.5 border-2 rounded-lg focus:outline-none text-sm text-gray-900 bg-white transition-colors ${
                      nameValid === false
                        ? 'border-red-500 bg-red-50'
                        : nameValid === true
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 focus:border-[#0080FF]'
                    }`}
                    placeholder="e.g., Sarah Johnson"
                    required
                  />
                  {/* Real-time validation indicator */}
                  {parentName.trim().length > 0 && nameValid !== null && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {nameValid ? (
                        <CheckCircle2 className="text-green-500" size={18} />
                      ) : (
                        <AlertCircle className="text-red-500" size={18} />
                      )}
                    </div>
                  )}
                </div>
                {parentName.trim().length > 0 && nameError && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {nameError}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    autoComplete="email"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    className={`w-full pl-10 pr-10 py-2.5 border-2 rounded-lg focus:outline-none text-sm text-gray-900 bg-white transition-colors ${
                      emailValid === false
                        ? 'border-red-500 bg-red-50'
                        : emailValid === true
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 focus:border-[#0080FF]'
                    }`}
                    placeholder="your@email.com"
                    required
                  />
                  {/* Real-time validation indicator */}
                  {parentEmail.trim().length > 0 && emailValid !== null && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {emailValid ? (
                        <CheckCircle2 className="text-green-500" size={18} />
                      ) : (
                        <AlertCircle className="text-red-500" size={18} />
                      )}
                    </div>
                  )}
                </div>
                {parentEmail.trim().length > 0 && emailError && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {emailError}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    pattern="^(?:\+44\s?|0)(?:\d{2,4}\s?\d{3,4}\s?\d{3,4})$"
                    value={parentPhone}
                    onChange={(e) => {
                      // Only allow valid phone characters: digits, spaces, +, -, parentheses
                      const value = e.target.value;
                      // Allow: digits (0-9), spaces, +, -, parentheses, and nothing else
                      const filtered = value.replace(/[^\d\s\+\-\(\)]/g, '');
                      setParentPhone(filtered);
                    }}
                    className={`w-full pl-10 pr-10 py-2.5 border-2 rounded-lg focus:outline-none text-sm text-gray-900 bg-white transition-colors ${
                      phoneValid === false
                        ? 'border-red-500 bg-red-50'
                        : phoneValid === true
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 focus:border-[#0080FF]'
                    }`}
                    placeholder="07123 456789 or 020 1234 5678"
                    required
                  />
                  {/* Real-time validation indicator */}
                  {parentPhone.trim().length > 0 && phoneValid !== null && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {phoneValid ? (
                        <CheckCircle2 className="text-green-500" size={18} />
                      ) : (
                        <AlertCircle className="text-red-500" size={18} />
                      )}
                    </div>
                  )}
                </div>
                {parentPhone.trim().length > 0 && phoneError && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {phoneError}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Children Section */}
      <div className="bg-white rounded-[30px] shadow-lg border-2 border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shadow-lg">
                <HeartPulse className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#1E3A5F]">Children's Information</h3>
                <p className="text-sm text-gray-600 mt-0.5">Add all children participating in this package</p>
              </div>
            </div>
            {childrenDetails.length > 0 && childrenDetails.length < 5 && (
              <button
                onClick={handleAddChild}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#0080FF] to-[#00D4FF] text-white font-semibold rounded-xl hover:from-[#0069cc] hover:to-[#00b8e6] transition-all shadow-md hover:shadow-lg text-sm"
              >
                <PlusCircle size={20} />
                <span className="hidden sm:inline">Add Another</span>
                <span className="sm:hidden">Add</span>
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {childrenDetails.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center mx-auto mb-4">
                <HeartPulse className="text-pink-600" size={32} />
              </div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">No children added yet</h4>
              <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">
                Start by adding your first child&apos;s information
              </p>
              <Button 
                onClick={handleAddChild} 
                size="lg"
                className="bg-gradient-to-r from-[#0080FF] to-[#00D4FF] hover:from-[#0069cc] hover:to-[#00b8e6] text-white font-bold shadow-lg hover:shadow-xl px-8"
              >
                <PlusCircle size={20} className="mr-2" />
                Add First Child
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {childrenDetails.map((c, idx) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveChildId(c.id)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full border-2 text-sm font-semibold transition-colors ${
                      activeChildId === c.id
                        ? 'border-[#0080FF] bg-blue-50 text-[#1E3A5F]'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-[#0080FF]'
                    }`}
                    title={`Child ${idx + 1}`}
                  >
                    Child {idx + 1}
                  </button>
                ))}
                {childrenDetails.length < 5 && (
                  <button
                    onClick={handleAddChild}
                    className="ml-1 px-3 py-2 rounded-full border-2 border-dashed border-gray-300 text-gray-600 hover:border-[#0080FF] hover:text-[#0080FF] transition-colors text-sm"
                    title="Add another child"
                  >
                    + Add
                  </button>
                )}
              </div>

              {/* Active Child Panel */}
              {activeChild && (() => {
                const child = activeChild;
                const isValid = isChildValid(child);

                return (
                  <div
                    key={child.id}
                    className={`border-2 rounded-2xl transition-all ${
                      isValid
                        ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="p-6 space-y-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-sm ${
                            isValid
                              ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                              : 'bg-gradient-to-br from-pink-200 to-purple-200 text-pink-700'
                          }`}>
                            {isValid ? <CheckCircle2 size={24} /> : <HeartPulse size={24} />}
                          </div>
                          <div>
                            <h4 className="font-bold text-[#1E3A5F]">
                              {child.name.trim() || 'New Child'}
                            </h4>
                            <p className="text-xs text-gray-600">
                              {isValid ? 'All required fields completed ✓' : 'Complete the form below'}
                            </p>
                          </div>
                        </div>
                        {childrenDetails.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveChild(child.id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove child"
                            aria-label={`Remove ${child.name || 'child'}`}
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>

                      <div className="space-y-5">
                        {/* Child Name */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <User className="text-[#0080FF]" size={16} />
                            Child's Full Name <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                              type="text"
                              autoComplete="name"
                              value={child.name}
                              onChange={(e) => updateChild(child.id, 'name', e.target.value)}
                              className={`w-full pl-10 pr-10 py-3 border-2 rounded-lg focus:outline-none text-sm text-gray-900 bg-white transition-all shadow-sm hover:shadow-md ${
                                childNameValid[child.id] === false
                                  ? 'border-red-500 bg-red-50'
                                  : childNameValid[child.id] === true
                                  ? 'border-green-500 bg-green-50'
                                  : 'border-gray-200 focus:border-[#0080FF]'
                              }`}
                              placeholder="e.g., Emma Smith"
                              required
                            />
                            {/* Real-time validation indicator */}
                            {child.name.trim().length > 0 && childNameValid[child.id] !== null && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {childNameValid[child.id] ? (
                                  <CheckCircle2 className="text-green-500" size={18} />
                                ) : (
                                  <AlertCircle className="text-red-500" size={18} />
                                )}
                              </div>
                            )}
                          </div>
                          {child.name.trim().length > 0 && childNameErrors[child.id] && (
                            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                              <AlertCircle size={12} />
                              {childNameErrors[child.id]}
                            </p>
                          )}
                        </div>

                        {/* Child Age */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <HeartPulse className="text-pink-500" size={16} />
                            Age <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              max="25"
                              inputMode="numeric"
                              value={child.age}
                              onChange={(e) => updateChild(child.id, 'age', e.target.value)}
                              className={`w-full px-4 pr-20 py-3 border-2 rounded-lg focus:outline-none text-sm text-gray-900 bg-white transition-all shadow-sm hover:shadow-md ${
                                childAgeValid[child.id] === false
                                  ? 'border-red-500 bg-red-50'
                                  : childAgeValid[child.id] === true
                                  ? 'border-green-500 bg-green-50'
                                  : 'border-gray-200 focus:border-[#0080FF]'
                              }`}
                              placeholder="Enter age (0-25)"
                              required
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                              {child.age && String(child.age).trim().length > 0 && childAgeValid[child.id] !== null && (
                                childAgeValid[child.id] ? (
                                  <CheckCircle2 className="text-green-500" size={18} />
                                ) : (
                                  <AlertCircle className="text-red-500" size={18} />
                                )
                              )}
                              <span className="text-xs text-gray-400 font-medium">
                                years
                              </span>
                            </div>
                          </div>
                          {child.age && String(child.age).trim().length > 0 && childAgeErrors[child.id] && (
                            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                              <AlertCircle size={12} />
                              {childAgeErrors[child.id]}
                            </p>
                          )}
                        </div>

                        {/* Medical Information */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <HeartPulse className="text-purple-500" size={16} />
                            Medical Information <span className="text-xs text-gray-500 font-normal">(Optional)</span>
                          </label>
                          <textarea
                            value={child.medicalInfo || ''}
                            onChange={(e) => updateChild(child.id, 'medicalInfo', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#0080FF] focus:outline-none text-sm transition-all shadow-sm hover:shadow-md resize-none"
                            placeholder="e.g., Allergies, medical conditions, or special needs..."
                            rows={4}
                          />
                          <p className="mt-1.5 text-xs text-gray-500">
                            This information helps us provide the best care for your child
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Navigation - Only show if not hidden */}
      {!hideNavigation && (
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {blockingMessage && (
              <p className="text-amber-600 font-semibold">{blockingMessage}</p>
            )}
          </div>
          <Button
            onClick={onNext}
            variant="primary"
            size="lg"
            disabled={!canProceed()}
            className="bg-gradient-to-r from-[#0080FF] to-[#00D4FF] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Location →
          </Button>
        </div>
      )}
    </div>
  );
};

export default ParentChildDetailsForm;
