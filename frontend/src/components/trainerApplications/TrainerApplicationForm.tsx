'use client';

import { FormEvent, useState, useEffect, useRef } from 'react';
import { CreateTrainerApplicationDTO } from '@/core/application/trainerApplications';
import { useTrainerApplicationForm } from '@/interfaces/web/hooks/trainerApplications/useTrainerApplicationForm';
import { useActivities } from '@/interfaces/web/hooks/activities/useActivities';
import { validateName, validateEmail, validatePhone } from '@/utils/validation';
import { AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

const AVAILABILITY_OPTIONS = [
  'Weekday Mornings',
  'Weekday Afternoons',
  'Weekday Evenings',
  'Saturday',
  'Sunday',
  'School Holidays',
];

const AGE_GROUP_OPTIONS = ['Early Years (3-5)', 'Primary (6-11)', 'Teens (12-16)'];

// Category display names for UI
const CATEGORY_NAMES: Record<string, string> = {
  water_based: 'Water-Based Activities',
  high_intensity: 'High-Intensity Sports',
  heights: 'Heights & Climbing',
  contact_sports: 'Contact Sports',
  outdoor_extreme: 'Outdoor & Extreme Sports',
  indoor_technical: 'Indoor & Technical Activities',
  special_needs: 'Special Needs & Adaptive Sports',
  other: 'Other / General Activities',
};

const STEPS = [
  { id: 'activities', label: 'Activities', description: 'What activities you can facilitate' },
  { id: 'profile', label: 'Profile', description: 'Who you are & your expertise' },
  { id: 'coverage', label: 'Coverage', description: 'Where and when you coach' },
  { id: 'safeguarding', label: 'Safeguarding', description: 'DBS, insurance, and documents' },
];

const INITIAL_FORM: CreateTrainerApplicationDTO = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  postcode: '',
  addressLineOne: '',
  addressLineTwo: '',
  city: '',
  county: '',
  travelRadiusKm: 15,
  availabilityPreferences: [],
  excludedActivityIds: [], // Activity IDs trainer CANNOT facilitate
  exclusionReason: '',     // Reason for activity limitations
  preferredAgeGroups: [],
  experienceYears: 0,
  bio: '',
  certifications: [],
  hasDbsCheck: false,
  dbsIssuedAt: '',
  dbsExpiresAt: '',
  insuranceProvider: '',
  insuranceExpiresAt: '',
  desiredHourlyRate: undefined,
  attachments: [],
};

export function TrainerApplicationForm() {
  const [formData, setFormData] = useState<CreateTrainerApplicationDTO>(INITIAL_FORM);
  const [certificationsInput, setCertificationsInput] = useState('');
  const [attachmentsInput, setAttachmentsInput] = useState('');
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const { submit, loading, error, result } = useTrainerApplicationForm();
  const submittingRef = useRef(false);

  // Validation states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isValid, setIsValid] = useState<Record<string, boolean>>({});

  // Activity selection states
  const [canFacilitateAll, setCanFacilitateAll] = useState<boolean>(true);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  
  // Fetch activities from API
  const { activities, loading: activitiesLoading, error: activitiesError, activitiesByCategory, categoryOrder } = useActivities();

  // Real-time validation
  useEffect(() => {
    const newErrors: Record<string, string> = {};
    const newIsValid: Record<string, boolean> = {};

    // First name validation
    if (touched.firstName || formData.firstName) {
      const nameValidation = validateName(formData.firstName);
      if (!nameValidation.valid) {
        newErrors.firstName = nameValidation.error || 'First name is required';
        newIsValid.firstName = false;
      } else {
        newIsValid.firstName = true;
      }
    }

    // Last name validation
    if (touched.lastName || formData.lastName) {
      const nameValidation = validateName(formData.lastName);
      if (!nameValidation.valid) {
        newErrors.lastName = nameValidation.error || 'Last name is required';
        newIsValid.lastName = false;
      } else {
        newIsValid.lastName = true;
      }
    }

    // Email validation
    if (touched.email || formData.email) {
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.valid) {
        newErrors.email = emailValidation.error || 'Please enter a valid email address';
        newIsValid.email = false;
      } else {
        newIsValid.email = true;
      }
    }

    // Phone validation
    if (touched.phone || formData.phone) {
      const phoneValidation = validatePhone(formData.phone);
      if (!phoneValidation.valid) {
        newErrors.phone = phoneValidation.error || 'Please enter a valid UK phone number';
        newIsValid.phone = false;
      } else {
        newIsValid.phone = true;
      }
    }

    setErrors(newErrors);
    setIsValid(newIsValid);
  }, [formData.firstName, formData.lastName, formData.email, formData.phone, touched]);

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleInputChange = <K extends keyof CreateTrainerApplicationDTO>(
    field: K,
    value: CreateTrainerApplicationDTO[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Mark field as touched when user starts typing
    if (!touched[field as string]) {
      setTouched(prev => ({ ...prev, [field as string]: true }));
    }
  };

  const toggleArrayValue = (field: keyof CreateTrainerApplicationDTO, value: string) => {
    setFormData((prev) => {
      const current = new Set(prev[field] as string[] | undefined);
      current.has(value) ? current.delete(value) : current.add(value);
      return { ...prev, [field]: Array.from(current) };
    });
  };

  const validateStep = (step: number): boolean => {
    // STEP 0: Activity Coverage (NEW FIRST STEP)
    if (step === 0) {
      // No validation needed - radio button is always selected (Yes or No)
      // excludedActivityIds is optional (empty = can do all activities)
      setFormMessage(null);
      return true;
    }

    // STEP 1: Personal Details (was Step 0)
    if (step === 1) {
      // Mark all fields as touched
      setTouched({
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      });

      // Validate all required fields
      const firstNameValidation = validateName(formData.firstName);
      const lastNameValidation = validateName(formData.lastName);
      const emailValidation = validateEmail(formData.email);
      const phoneValidation = validatePhone(formData.phone);

      if (!firstNameValidation.valid || !lastNameValidation.valid || !emailValidation.valid || !phoneValidation.valid) {
        setErrors({
          firstName: firstNameValidation.error || '',
          lastName: lastNameValidation.error || '',
          email: emailValidation.error || '',
          phone: phoneValidation.error || '',
        });
        setFormMessage('Please complete all required fields correctly.');
        return false;
      }
    }

    // STEP 2: Location & Coverage (was Step 1)
    if (step === 2) {
      if (!formData.postcode || !formData.travelRadiusKm) {
        setFormMessage('Add your base postcode and travel radius so we can match bookings.');
        return false;
      }
      if (!formData.addressLineOne) {
        setFormMessage('Please enter your address (address line 1 is required).');
        return false;
      }
      if (!formData.availabilityPreferences?.length) {
        setFormMessage('Choose at least one availability preference.');
        return false;
      }
    }

    // STEP 3: Safeguarding (was Step 2)
    if (step === 3) {
      if (!formData.hasDbsCheck) {
        setFormMessage('An enhanced DBS / PVG is required. Tick the box to confirm you hold one.');
        return false;
      }
    }

    setFormMessage(null);
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handlePrevious = () => {
    setFormMessage(null);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;
    if (!validateStep(currentStep)) return;

    submittingRef.current = true;
    try {
      // Trim string fields so backend validation (e.g. email:rfc,dns) doesn't fail on whitespace
      const payload = {
        ...formData,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        certifications: certificationsInput
          ? certificationsInput.split(',').map((cert) => cert.trim()).filter(Boolean)
          : formData.certifications,
        attachments: attachmentsInput
          ? attachmentsInput.split(',').map((file) => file.trim()).filter(Boolean)
          : formData.attachments,
      };
      await submit(payload);
    } catch {
      // API errors are already shown via the hook's error state; avoid duplicating in formMessage
    } finally {
      submittingRef.current = false;
    }
  };

  if (result) {
    const referenceDisplay = typeof result.id === 'string' && result.id.length > 3 ? result.id : `CAMS-TA-${result.id}`;
    return (
      <div className="rounded-card border-2 border-gray-200 bg-white p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary-blue">Application received</p>
        <h3 className="mt-3 text-2xl font-semibold text-navy-blue">You're all set!</h3>
        <p className="mt-3 text-base text-gray-700">
          Thank you for sharing your expertise. Our team will review your profile and will email next steps to{' '}
          <strong>{formData.email}</strong> within 2–3 working days. Keep your reference handy when you get in touch:
        </p>
        <div className="mt-6 rounded-card border-2 border-gray-200 bg-gradient-to-br from-blue-50 to-purple-50 p-5">
          <p className="text-sm font-medium text-gray-600">Application reference</p>
          <p className="text-xl font-semibold text-navy-blue font-mono">{referenceDisplay}</p>
          <p className="mt-1 text-sm text-gray-600">Status: {result.status}</p>
        </div>
      </div>
    );
  }

  return (
    <form id="application-form" onSubmit={handleSubmit} className="space-y-8 rounded-card border-2 border-gray-200 bg-white p-8 shadow-card">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-primary-blue">Join the CAMS Collective</p>
        <h3 className="mt-2 text-3xl font-bold text-navy-blue">Less typing, faster onboarding</h3>
        <p className="mt-3 text-base text-gray-700">
          We match every coach to families by expertise, coverage radius, and safeguarding credentials. Three quick
          steps unlocks curated bookings.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex gap-2 text-sm font-medium text-slate-500">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`flex flex-1 items-center gap-3 rounded-card border px-4 py-3 ${
                index < currentStep
                  ? 'border-emerald-100 bg-emerald-50 text-emerald-900'
                  : index === currentStep
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-600'
              }`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold">
                {index + 1}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em]">{step.label}</p>
                <p className="text-xs text-current">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {formMessage && (
        <div className="rounded-card border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{formMessage}</div>
      )}

      {error && (
        <div className="rounded-card border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error.message}</div>
      )}

      {/* STEP 0: Activity Coverage - FIRST STEP to qualify trainers early */}
      {currentStep === 0 && (
        <>
          <section>
            <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">Activity Coverage</p>
            <div className="mt-3 rounded-card border-2 border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-900 mb-2">
                Can You Facilitate ALL Types of Activities?
              </p>
              <p className="text-sm text-emerald-800">
                <strong>95% of our trainers can facilitate all activities</strong> in our catalogue ({activities.length} total). 
              </p>
              <p className="mt-2 text-sm text-emerald-800">
                Only select "No" if you have physical, mental, or medical limitations that prevent you from performing certain activities.
              </p>
            </div>

            <div className="mt-4 space-y-3">
              <label className={`flex items-start gap-3 p-4 rounded-card border-2 cursor-pointer transition-all hover:bg-emerald-50 ${canFacilitateAll ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
                <input
                  type="radio"
                  name="canFacilitateAll"
                  checked={canFacilitateAll}
                  onChange={() => {
                    setCanFacilitateAll(true);
                    setFormData({ ...formData, excludedActivityIds: [], exclusionReason: '' });
                  }}
                  className="mt-0.5 h-5 w-5 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-base">Yes - I can facilitate ALL activities</span>
                    <span className="px-2 py-0.5 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full">Recommended</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">Maximum booking opportunities - 95% of trainers choose this option</p>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-4 rounded-card border-2 cursor-pointer transition-all hover:bg-amber-50 ${!canFacilitateAll ? 'border-amber-500 bg-amber-50' : 'border-slate-200 bg-white'}`}>
                <input
                  type="radio"
                  name="canFacilitateAll"
                  checked={!canFacilitateAll}
                  onChange={() => setCanFacilitateAll(false)}
                  className="mt-0.5 h-5 w-5 text-amber-600 focus:ring-amber-500"
                />
                <div className="flex-1">
                  <span className="font-medium text-slate-900">No - I have specific limitations</span>
                  <p className="mt-1 text-sm text-slate-600">Select specific activities you cannot facilitate</p>
                </div>
              </label>
            </div>

            {!canFacilitateAll && (
              <div className="mt-4 space-y-4">
                {activitiesLoading && (
                  <div className="text-center py-8 text-slate-600">
                    Loading activities...
                  </div>
                )}

                {activitiesError && (
                  <div className="rounded-card border-2 border-red-200 bg-red-50 p-4">
                    <p className="text-sm text-red-900">{activitiesError}</p>
                  </div>
                )}

                {!activitiesLoading && !activitiesError && (
                  <>
                    <div className="rounded-card border-2 border-amber-200 bg-amber-50 p-4">
                      <p className="text-sm text-amber-900">
                        <strong>Select activities you CANNOT facilitate.</strong> Leave unchecked activities you CAN do.
                      </p>
                      <p className="mt-2 text-sm text-amber-800">
                        Currently selected: <strong>{formData.excludedActivityIds?.length || 0}</strong> activities excluded, <strong>{activities.length - (formData.excludedActivityIds?.length || 0)}</strong> activities you can facilitate
                      </p>
                      {formData.excludedActivityIds && formData.excludedActivityIds.length > activities.length * 0.5 && (
                        <p className="mt-2 text-sm font-semibold text-red-700">
                          ⚠️ Warning: You've excluded over 50% of activities. This may significantly limit your booking opportunities.
                        </p>
                      )}
                      {formData.excludedActivityIds && formData.excludedActivityIds.length === activities.length && (
                        <p className="mt-2 text-sm font-semibold text-red-700">
                          ❌ Error: You cannot exclude ALL activities. If you can't facilitate any activities, you cannot be a trainer.
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      {categoryOrder.map((categoryKey) => {
                        const categoryActivities = activitiesByCategory[categoryKey] || [];
                        if (categoryActivities.length === 0) return null;

                        const isExpanded = expandedCategories[categoryKey];
                        const excludedCount = categoryActivities.filter(a => formData.excludedActivityIds?.includes(a.id)).length;

                        return (
                          <div key={categoryKey} className="rounded-card border border-slate-200 bg-white overflow-hidden">
                            <button
                              type="button"
                              onClick={() => setExpandedCategories(prev => ({ ...prev, [categoryKey]: !prev[categoryKey] }))}
                              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                            >
                              <div className="flex-1 text-left">
                                <h3 className="font-semibold text-slate-900">{CATEGORY_NAMES[categoryKey]}</h3>
                                <p className="text-sm text-slate-600 mt-1">
                                  {isExpanded ? (
                                    <>{categoryActivities.length} activities • {excludedCount} excluded • {categoryActivities.length - excludedCount} you can facilitate</>
                                  ) : (
                                    <>{categoryActivities.length} activities available{excludedCount > 0 && ` • ${excludedCount} excluded`}</>
                                  )}
                                </p>
                              </div>
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5 text-slate-400" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-slate-400" />
                              )}
                            </button>

                            {isExpanded && (
                              <div className="border-t border-slate-200 p-4 bg-slate-50">
                                <div className="mb-3 flex items-center justify-between">
                                  <span className="text-sm text-slate-600">
                                    {excludedCount === categoryActivities.length ? 'All excluded' : excludedCount === 0 ? 'None excluded' : `${excludedCount} of ${categoryActivities.length} excluded`}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const categoryActivityIds = categoryActivities.map(a => a.id);
                                      const allExcluded = categoryActivityIds.every(id => formData.excludedActivityIds?.includes(id));
                                      
                                      if (allExcluded) {
                                        const newExcluded = formData.excludedActivityIds?.filter(id => !categoryActivityIds.includes(id)) || [];
                                        setFormData({ ...formData, excludedActivityIds: newExcluded });
                                      } else {
                                        const currentExcluded = formData.excludedActivityIds || [];
                                        const newExcluded = [...new Set([...currentExcluded, ...categoryActivityIds])];
                                        setFormData({ ...formData, excludedActivityIds: newExcluded });
                                      }
                                    }}
                                    className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                                      excludedCount === categoryActivities.length
                                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                                    }`}
                                  >
                                    {excludedCount === categoryActivities.length ? 'Deselect All' : 'Exclude All'}
                                  </button>
                                </div>

                                <div className="grid gap-2 md:grid-cols-2">
                                  {categoryActivities.map((activity) => {
                                    const isExcluded = formData.excludedActivityIds?.includes(activity.id);
                                    return (
                                      <label key={activity.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-white cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={isExcluded}
                                          onChange={(e) => {
                                            const newExcluded = e.target.checked
                                              ? [...(formData.excludedActivityIds || []), activity.id]
                                              : formData.excludedActivityIds?.filter(id => id !== activity.id) || [];
                                            setFormData({ ...formData, excludedActivityIds: newExcluded });
                                          }}
                                          className="mt-0.5 h-4 w-4 text-red-600 focus:ring-red-500 rounded"
                                        />
                                        <span className={`text-sm ${isExcluded ? 'text-red-700 font-medium' : 'text-slate-700'}`}>
                                          {activity.name}
                                        </span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {formData.excludedActivityIds && formData.excludedActivityIds.length > 0 && (
                      <div className="mt-4">
                        <label className="text-sm font-medium text-slate-700">
                          Reason for Limitations (Optional but Recommended)
                        </label>
                        <textarea
                          className="mt-2 w-full rounded-card border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                          rows={3}
                          value={formData.exclusionReason || ''}
                          onChange={(e) => handleInputChange('exclusionReason', e.target.value)}
                          placeholder="e.g., 'Shoulder injury prevents overhead movements', 'Fear of heights', 'Medical condition prevents contact sports'"
                        />
                        <p className="mt-1 text-xs text-slate-500">
                          This helps us assign you to suitable bookings and ensure children's safety.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </section>
        </>
      )}

      {/* STEP 1: Personal Details - NOW SECOND STEP */}
      {currentStep === 1 && (
        <>
          <section className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">First name *</label>
              <div className="relative">
                <input
                  type="text"
                  minLength={2}
                  maxLength={100}
                  autoComplete="given-name"
                  className={`mt-2 w-full pr-10 rounded-card border bg-white px-4 py-3 text-base text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                    touched.firstName
                      ? errors.firstName
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50'
                        : isValid.firstName
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-200 bg-green-50'
                        : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-200'
                      : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-200'
                  }`}
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  onBlur={() => handleBlur('firstName')}
                  required
                />
                {touched.firstName && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 mt-2">
                    {errors.firstName ? (
                      <AlertCircle className="text-red-500" size={18} />
                    ) : isValid.firstName ? (
                      <CheckCircle className="text-green-500" size={18} />
                    ) : null}
                  </div>
                )}
              </div>
              {touched.firstName && errors.firstName && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.firstName}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Last name *</label>
              <div className="relative">
                <input
                  type="text"
                  minLength={2}
                  maxLength={100}
                  autoComplete="family-name"
                  className={`mt-2 w-full pr-10 rounded-card border bg-white px-4 py-3 text-base text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                    touched.lastName
                      ? errors.lastName
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50'
                        : isValid.lastName
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-200 bg-green-50'
                        : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-200'
                      : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-200'
                  }`}
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  onBlur={() => handleBlur('lastName')}
                  required
                />
                {touched.lastName && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 mt-2">
                    {errors.lastName ? (
                      <AlertCircle className="text-red-500" size={18} />
                    ) : isValid.lastName ? (
                      <CheckCircle className="text-green-500" size={18} />
                    ) : null}
                  </div>
                )}
              </div>
              {touched.lastName && errors.lastName && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.lastName}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Email *</label>
              <div className="relative">
                <input
                  type="email"
                  className={`mt-2 w-full pr-10 rounded-card border bg-white px-4 py-3 text-base text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                    touched.email
                      ? errors.email
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50'
                        : isValid.email
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-200 bg-green-50'
                        : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-200'
                      : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-200'
                  }`}
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  required
                />
                {touched.email && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 mt-2">
                    {errors.email ? (
                      <AlertCircle className="text-red-500" size={18} />
                    ) : isValid.email ? (
                      <CheckCircle className="text-green-500" size={18} />
                    ) : null}
                  </div>
                )}
              </div>
              {touched.email && errors.email && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.email}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Phone *</label>
              <div className="relative">
                <input
                  type="tel"
                  pattern="^(?:\+44\s?|0)(?:\d{2,4}\s?\d{3,4}\s?\d{3,4})$"
                  inputMode="tel"
                  autoComplete="tel"
                  className={`mt-2 w-full pr-10 rounded-card border bg-white px-4 py-3 text-base text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                    touched.phone
                      ? errors.phone
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50'
                        : isValid.phone
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-200 bg-green-50'
                        : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-200'
                      : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-200'
                  }`}
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  onBlur={() => handleBlur('phone')}
                  placeholder="07123 456789 or 020 1234 5678"
                  required
                />
                {touched.phone && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 mt-2">
                    {errors.phone ? (
                      <AlertCircle className="text-red-500" size={18} />
                    ) : isValid.phone ? (
                      <CheckCircle className="text-green-500" size={18} />
                    ) : null}
                  </div>
                )}
              </div>
              {touched.phone && errors.phone && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.phone}
                </p>
              )}
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Years coaching *</label>
              <input
                type="number"
                min={0}
                className="mt-2 w-full rounded-card border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                value={formData.experienceYears}
                onChange={(e) => handleInputChange('experienceYears', Number(e.target.value))}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Coaching summary</label>
              <textarea
                className="mt-2 w-full rounded-card border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                rows={3}
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Optional: highlight your approach, settings, or outcomes."
              />
            </div>
          </section>
        </>
      )}

      {currentStep === 2 && (
        <>
          <section className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">Home postcode *</label>
                <input
                  className="mt-2 w-full rounded-card border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  value={formData.postcode}
                  onChange={(e) => handleInputChange('postcode', e.target.value.toUpperCase())}
                  placeholder="e.g., AL10 8DA"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Travel radius (km) *</label>
                <input
                  type="number"
                  min={5}
                  max={200}
                  className="mt-2 w-full rounded-card border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  value={formData.travelRadiusKm}
                  onChange={(e) => handleInputChange('travelRadiusKm', Number(e.target.value))}
                  required
                />
                <p className="mt-2 text-xs text-slate-600">
                  ℹ️ We'll automatically match you with bookings within this radius from your home postcode.
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Address line 1 *</label>
              <input
                className="mt-2 w-full rounded-card border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                value={formData.addressLineOne}
                onChange={(e) => handleInputChange('addressLineOne', e.target.value)}
                placeholder="e.g., 123 Main Street"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Address line 2</label>
              <input
                className="mt-2 w-full rounded-card border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                value={formData.addressLineTwo}
                onChange={(e) => handleInputChange('addressLineTwo', e.target.value)}
                placeholder="Apartment, suite, unit, etc. (optional)"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">City</label>
                <input
                  className="mt-2 w-full rounded-card border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="e.g., London"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">County</label>
                <input
                  className="mt-2 w-full rounded-card border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  value={formData.county}
                  onChange={(e) => handleInputChange('county', e.target.value)}
                  placeholder="e.g., Hertfordshire"
                />
              </div>
            </div>
          </section>

          <section>
            <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">Availability *</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {AVAILABILITY_OPTIONS.map((option) => {
                const checked = formData.availabilityPreferences?.includes(option);
                return (
                  <button
                    type="button"
                    key={option}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      checked
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-200'
                    }`}
                    onClick={() => toggleArrayValue('availabilityPreferences', option)}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">Age groups</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {AGE_GROUP_OPTIONS.map((option) => {
                const checked = formData.preferredAgeGroups?.includes(option);
                return (
                  <button
                    type="button"
                    key={option}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      checked
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                    }`}
                    onClick={() => toggleArrayValue('preferredAgeGroups', option)}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Preferred hourly rate (£)</label>
              <input
                type="number"
                min={0}
                className="mt-2 w-full rounded-card border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                value={formData.desiredHourlyRate ?? ''}
                onChange={(e) =>
                  handleInputChange('desiredHourlyRate', e.target.value ? Number(e.target.value) : undefined)
                }
              />
            </div>
            <p className="text-sm text-slate-500">
              We use this to suggest the best-fit package. You can update it later inside the coach portal.
            </p>
          </section>
        </>
      )}

      {currentStep === 3 && (
        <>
          <section className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  className="size-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  checked={formData.hasDbsCheck}
                  onChange={(e) => setFormData((prev) => ({ ...prev, hasDbsCheck: e.target.checked }))}
                />
                I hold an enhanced DBS / PVG
              </label>
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">DBS issued</label>
              <input
                type="date"
                className="mt-2 w-full rounded-card border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                value={formData.dbsIssuedAt ?? ''}
                onChange={(e) => handleInputChange('dbsIssuedAt', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">DBS expires</label>
              <input
                type="date"
                className="mt-2 w-full rounded-card border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                value={formData.dbsExpiresAt ?? ''}
                onChange={(e) => handleInputChange('dbsExpiresAt', e.target.value)}
              />
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Certifications (comma separated)</label>
              <input
                className="mt-2 w-full rounded-card border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                value={certificationsInput}
                onChange={(e) => setCertificationsInput(e.target.value)}
                placeholder="Safeguarding L2, FA Level 2..."
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Insurance provider</label>
              <input
                className="mt-2 w-full rounded-card border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                value={formData.insuranceProvider ?? ''}
                onChange={(e) => handleInputChange('insuranceProvider', e.target.value)}
              />
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Insurance expiry</label>
              <input
                type="date"
                className="mt-2 w-full rounded-card border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                value={formData.insuranceExpiresAt ?? ''}
                onChange={(e) => handleInputChange('insuranceExpiresAt', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Supporting docs (URLs, comma separated)</label>
              <input
                className="mt-2 w-full rounded-card border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                value={attachmentsInput}
                onChange={(e) => setAttachmentsInput(e.target.value)}
                placeholder="https://.../dbs.pdf, https://.../insurance.pdf"
              />
            </div>
          </section>
        </>
      )}

      <div className="flex flex-col gap-3 rounded-card border border-slate-200 bg-slate-50/70 p-5 text-sm text-slate-600">
        <p>✅ Most applications are approved within 2 business days.</p>
        <p>✅ You can email updated documents after submission if anything changes.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 0 || loading}
            className="rounded-card border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Back
          </button>
          {currentStep < STEPS.length - 1 && (
            <button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="rounded-card border border-slate-900 bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Next
            </button>
          )}
        </div>

        {currentStep === STEPS.length - 1 && (
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-card bg-slate-900 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {loading ? 'Submitting…' : 'Submit application'}
          </button>
        )}
      </div>
    </form>
  );
}

export default TrainerApplicationForm;
