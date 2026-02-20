'use client';

import React from 'react';
import Button from '@/components/ui/Button';
import {
  AlertCircle,
  CheckCircle,
  PlusCircle,
  XCircle,
} from 'lucide-react';
import { formatCurrency } from '@/utils/currencyFormatter';
import { CONTACT_FORM } from './constants';
import type { ContactFormSectionProps, ContactFormData, ChildInfo } from './contactFormTypes';

const inputBorderClass = (
  touched: boolean,
  error: string | undefined,
  valid: boolean | undefined
): string => {
  if (!touched) return 'border-slate-300 focus:border-slate-900 focus:ring-slate-900/20';
  if (error) return 'border-red-500 focus:border-red-500 focus:ring-red-200';
  if (valid) return 'border-green-500 focus:border-green-500 focus:ring-green-200';
  return 'border-slate-300 focus:border-slate-900 focus:ring-slate-900/20';
};

export default function ContactFormSection({
  formData,
  setFormData,
  errors,
  touched,
  isValid,
  childErrors,
  childValid,
  setChildErrors,
  setChildValid,
  handleChange,
  handleBlur,
  setTouched,
  handleSubmit,
  isLoading,
  isSubmitting,
  hasSubmitted,
  success,
  error,
  contactPhone,
  packages,
  services,
}: ContactFormSectionProps) {
  const disabled = isLoading || isSubmitting || hasSubmitted;
  const displayError = error?.message ?? CONTACT_FORM.ERROR_GENERIC;
  const isWaitError = displayError.includes('already submitted') || displayError.includes('wait');
  const isTechError =
    displayError.includes('technical difficulties') || displayError.includes('Something went wrong') || displayError.includes('contact us directly');

  return (
    <div id="contact-form" className="bg-white rounded-card p-6 sm:p-8 lg:p-10 shadow-sm border border-slate-200">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">{CONTACT_FORM.TITLE}</h2>
        <p className="text-slate-600">{CONTACT_FORM.SUBTITLE}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-slate-900 mb-2">
              {CONTACT_FORM.LABEL_NAME}
            </label>
            <div className="relative">
              <input
                type="text"
                name="name"
                id="name"
                required
                minLength={2}
                maxLength={200}
                pattern="[a-zA-Z][a-zA-Z '-]{1,} +[a-zA-Z][a-zA-Z '-]{1,}"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={() => handleBlur('name')}
                placeholder={CONTACT_FORM.PLACEHOLDER_NAME}
                className={`block w-full px-4 py-3 pr-10 text-gray-900 bg-white border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400 ${inputBorderClass(touched.name, errors.name, isValid.name)}`}
              />
              {touched.name && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {errors.name ? (
                    <AlertCircle className="text-red-500" size={20} />
                  ) : isValid.name ? (
                    <CheckCircle className="text-green-500" size={20} />
                  ) : null}
                </div>
              )}
            </div>
            {touched.name && errors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.name}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-900 mb-2">
              {CONTACT_FORM.LABEL_EMAIL}
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                id="email"
                required
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                placeholder={CONTACT_FORM.PLACEHOLDER_EMAIL}
                className={`block w-full px-4 py-3 pr-10 text-gray-900 bg-white border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400 ${inputBorderClass(touched.email, errors.email, isValid.email)}`}
              />
              {touched.email && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {errors.email ? (
                    <AlertCircle className="text-red-500" size={20} />
                  ) : isValid.email ? (
                    <CheckCircle className="text-green-500" size={20} />
                  ) : null}
                </div>
              )}
            </div>
            {touched.email && errors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.email}
              </p>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-slate-900 mb-2">
              {CONTACT_FORM.LABEL_PHONE}
            </label>
            <div className="relative">
              <input
                type="tel"
                name="phone"
                id="phone"
                required
                pattern="^(?:\+44\s?|0)(?:\d{2,4}\s?\d{3,4}\s?\d{3,4})$"
                inputMode="tel"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleChange}
                onBlur={() => handleBlur('phone')}
                placeholder={CONTACT_FORM.PLACEHOLDER_PHONE}
                className={`block w-full px-4 py-3 pr-10 text-gray-900 bg-white border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400 ${inputBorderClass(touched.phone, errors.phone, isValid.phone)}`}
              />
              {touched.phone && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {errors.phone ? (
                    <AlertCircle className="text-red-500" size={20} />
                  ) : isValid.phone ? (
                    <CheckCircle className="text-green-500" size={20} />
                  ) : null}
                </div>
              )}
            </div>
            {touched.phone && errors.phone && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.phone}
              </p>
            )}
          </div>
        </div>

        {/* Children */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-semibold text-slate-900">{CONTACT_FORM.LABEL_CHILDREN}</label>
            {formData.children.length < 5 && (
              <button
                type="button"
                onClick={() => {
                  const newId = Math.max(...formData.children.map((c: ChildInfo) => c.id), 0) + 1;
                  setFormData((prev: ContactFormData) => ({
                    ...prev,
                    children: [...prev.children, { id: newId, name: '', age: '' }],
                  }));
                }}
                className="text-xs text-slate-700 hover:text-slate-900 font-semibold flex items-center gap-1"
              >
                <PlusCircle size={14} />
                {CONTACT_FORM.ADD_ANOTHER_CHILD}
              </button>
            )}
          </div>
          <div className="space-y-4">
            {formData.children.map((child, index) => (
              <div key={child.id} className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700">
                    {CONTACT_FORM.CHILD_N} {index + 1}
                  </span>
                  {formData.children.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev: ContactFormData) => ({
                          ...prev,
                          children: prev.children.filter((c) => c.id !== child.id),
                        }));
                        setChildErrors((prev) => {
                          const next = { ...prev };
                          delete next[child.id];
                          return next;
                        });
                        setChildValid((prev) => {
                          const next = { ...prev };
                          delete next[child.id];
                          return next;
                        });
                      }}
                      className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
                    >
                      <XCircle size={14} />
                      {CONTACT_FORM.REMOVE}
                    </button>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      {CONTACT_FORM.LABEL_FULL_NAME}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        minLength={2}
                        maxLength={200}
                        pattern="[a-zA-Z][a-zA-Z '-]{1,} +[a-zA-Z][a-zA-Z '-]{1,}"
                        autoComplete="name"
                        value={child.name}
                        onChange={(e) => {
                          setFormData((prev: ContactFormData) => ({
                            ...prev,
                            children: prev.children.map((c) =>
                              c.id === child.id ? { ...c, name: e.target.value } : c
                            ),
                          }));
                          if (!touched[`child-${child.id}-name`]) {
                            setTouched((prev) => ({ ...prev, [`child-${child.id}-name`]: true }));
                          }
                        }}
                        onBlur={() => handleBlur(`child-${child.id}-name`)}
                        placeholder={CONTACT_FORM.PLACEHOLDER_NAME}
                        className={`block w-full px-4 py-2.5 pr-10 text-gray-900 bg-white border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400 ${inputBorderClass(!!touched[`child-${child.id}-name`], childErrors[child.id]?.name, childValid[child.id]?.name)}`}
                      />
                      {touched[`child-${child.id}-name`] && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {childErrors[child.id]?.name ? (
                            <AlertCircle className="text-red-500" size={18} />
                          ) : childValid[child.id]?.name ? (
                            <CheckCircle className="text-green-500" size={18} />
                          ) : null}
                        </div>
                      )}
                    </div>
                    {touched[`child-${child.id}-name`] && childErrors[child.id]?.name && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {childErrors[child.id].name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      {CONTACT_FORM.LABEL_AGE}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        min={0}
                        max={25}
                        inputMode="numeric"
                        value={child.age}
                        onChange={(e) => {
                          setFormData((prev: ContactFormData) => ({
                            ...prev,
                            children: prev.children.map((c) =>
                              c.id === child.id ? { ...c, age: e.target.value } : c
                            ),
                          }));
                          if (!touched[`child-${child.id}-age`]) {
                            setTouched((prev) => ({ ...prev, [`child-${child.id}-age`]: true }));
                          }
                        }}
                        onBlur={() => handleBlur(`child-${child.id}-age`)}
                        placeholder={CONTACT_FORM.PLACEHOLDER_AGE}
                        className={`block w-full px-4 py-2.5 pr-10 text-gray-900 bg-white border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400 ${inputBorderClass(!!touched[`child-${child.id}-age`], childErrors[child.id]?.age, childValid[child.id]?.age)}`}
                      />
                      {touched[`child-${child.id}-age`] && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {childErrors[child.id]?.age ? (
                            <AlertCircle className="text-red-500" size={18} />
                          ) : childValid[child.id]?.age ? (
                            <CheckCircle className="text-green-500" size={18} />
                          ) : null}
                        </div>
                      )}
                    </div>
                    {touched[`child-${child.id}-age`] && childErrors[child.id]?.age && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {childErrors[child.id].age}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-semibold text-slate-900 mb-2">
            {CONTACT_FORM.LABEL_ADDRESS}
          </label>
          <div className="relative">
            <input
              type="text"
              name="address"
              id="address"
              value={formData.address}
              onChange={handleChange}
              onBlur={() => handleBlur('address')}
              placeholder={CONTACT_FORM.PLACEHOLDER_ADDRESS}
              className={`block w-full px-4 py-3 pr-10 text-gray-900 bg-white border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400 ${inputBorderClass(touched.address, errors.address, isValid.address)}`}
            />
            {touched.address && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {errors.address ? (
                  <AlertCircle className="text-red-500" size={20} />
                ) : isValid.address ? (
                  <CheckCircle className="text-green-500" size={20} />
                ) : null}
              </div>
            )}
          </div>
          {touched.address && errors.address && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle size={14} />
              {errors.address}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="postalCode" className="block text-sm font-semibold text-slate-900 mb-2">
            {CONTACT_FORM.LABEL_POSTAL_CODE}
          </label>
          <div className="relative">
            <input
              type="text"
              name="postalCode"
              id="postalCode"
              value={formData.postalCode}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, postalCode: e.target.value.toUpperCase() }));
                if (!touched.postalCode) setTouched((prev) => ({ ...prev, postalCode: true }));
              }}
              onBlur={() => handleBlur('postalCode')}
              placeholder={CONTACT_FORM.PLACEHOLDER_POSTCODE}
              className={`block w-full px-4 py-3 pr-10 text-gray-900 bg-white border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400 ${inputBorderClass(touched.postalCode, errors.postalCode, isValid.postalCode)}`}
            />
            {touched.postalCode && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {errors.postalCode ? (
                  <AlertCircle className="text-red-500" size={20} />
                ) : isValid.postalCode ? (
                  <CheckCircle className="text-green-500" size={20} />
                ) : null}
              </div>
            )}
          </div>
          {touched.postalCode && errors.postalCode && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle size={14} />
              {errors.postalCode}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="inquiryType" className="block text-sm font-semibold text-slate-900 mb-2">
            {CONTACT_FORM.LABEL_INTERESTED_IN}
          </label>
          <select
            id="inquiryType"
            name="inquiryType"
            required
            value={formData.inquiryType}
            onChange={handleChange}
            onBlur={() => handleBlur('inquiryType')}
            className={`block w-full px-4 py-3 text-gray-900 bg-white border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 cursor-pointer ${touched.inquiryType && errors.inquiryType ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : touched.inquiryType && formData.inquiryType ? 'border-green-500 focus:border-green-500 focus:ring-green-200' : 'border-slate-300 focus:border-slate-900 focus:ring-slate-900/20'}`}
          >
            <option value="">{CONTACT_FORM.SELECT_SERVICE_OR_PACKAGE}</option>
            <optgroup label={`🎯 ${CONTACT_FORM.OPTGROUP_PACKAGES}`} className="font-semibold">
              {packages.map((pkg) => (
                <option key={pkg.id} value={`Package: ${pkg.name}`} className="text-slate-900">
                  {pkg.name} - {formatCurrency(pkg.price)}
                </option>
              ))}
            </optgroup>
            <optgroup label={`💡 ${CONTACT_FORM.OPTGROUP_SERVICES}`} className="font-semibold">
              {services.map((svc) => (
                <option key={svc.slug} value={`Service: ${svc.title}`} className="text-slate-900">
                  {svc.title}
                </option>
              ))}
            </optgroup>
            <option value="General Inquiry" className="text-slate-900">
              {CONTACT_FORM.OPTION_GENERAL}
            </option>
          </select>
          {touched.inquiryType && errors.inquiryType && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle size={14} />
              {errors.inquiryType}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="urgency" className="block text-sm font-semibold text-slate-900 mb-2">
            {CONTACT_FORM.LABEL_URGENCY}
          </label>
          <select
            id="urgency"
            name="urgency"
            required
            value={formData.urgency}
            onChange={handleChange}
            onBlur={() => handleBlur('urgency')}
            className={`block w-full px-4 py-3 text-gray-900 bg-white border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 cursor-pointer ${touched.urgency && errors.urgency ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : touched.urgency && formData.urgency ? 'border-green-500 focus:border-green-500 focus:ring-green-200' : 'border-slate-300 focus:border-slate-900 focus:ring-slate-900/20'}`}
          >
            <option value="">{CONTACT_FORM.SELECT_TIMEFRAME}</option>
            <option value="Urgent">🔥 {CONTACT_FORM.URGENCY_URGENT}</option>
            <option value="Soon">⚡ {CONTACT_FORM.URGENCY_SOON}</option>
            <option value="Exploring">💭 {CONTACT_FORM.URGENCY_EXPLORING}</option>
          </select>
          {touched.urgency && errors.urgency && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle size={14} />
              {errors.urgency}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-3">
            {CONTACT_FORM.LABEL_PREFERRED_CONTACT}
          </label>
          <div className="flex flex-wrap gap-3">
            {(['email', 'phone', 'whatsapp'] as const).map((method) => (
              <label key={method} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="preferredContact"
                  value={method}
                  checked={formData.preferredContact === method}
                  onChange={handleChange}
                  className="w-4 h-4 text-slate-700 border-gray-300 focus:ring-2 focus:ring-primary-blue"
                />
                <span className="ml-2 text-slate-900">
                  {method === 'email'
                    ? `📧 ${CONTACT_FORM.PREFERRED_EMAIL}`
                    : method === 'phone'
                      ? `📞 ${CONTACT_FORM.PREFERRED_PHONE}`
                      : `💬 ${CONTACT_FORM.PREFERRED_WHATSAPP}`}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-semibold text-slate-900 mb-2">
            {CONTACT_FORM.LABEL_MESSAGE}
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            placeholder={CONTACT_FORM.PLACEHOLDER_MESSAGE}
            className="block w-full px-4 py-3 text-slate-900 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue hover:border-primary-blue/50 transition-all duration-200 placeholder:text-gray-400 resize-y"
          />
        </div>

        {success && (
          <div className="bg-green-50 border-2 border-green-200 text-green-800 px-4 py-3 rounded-lg">
            <p className="font-semibold">✅ {CONTACT_FORM.SUCCESS_MESSAGE}</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <p className="font-semibold">
              {isWaitError ? '⏳ ' + displayError : isTechError ? '⚠️ ' + displayError : '❌ ' + displayError}
            </p>
            {isWaitError && (
              <p className="text-sm mt-2 opacity-90">{CONTACT_FORM.ERROR_WAIT}</p>
            )}
            {(isTechError || displayError.includes('contact us directly')) && contactPhone && (
              <p className="text-sm mt-2 opacity-90">
                {CONTACT_FORM.ERROR_ALTERNATIVE} {contactPhone} {CONTACT_FORM.ERROR_ALTERNATIVE_SUFFIX}
              </p>
            )}
          </div>
        )}

        <div className="pt-4">
          <Button
            type="submit"
            variant="secondary"
            size="lg"
            className="w-full text-lg"
            withArrow
            disabled={disabled}
          >
            {disabled ? CONTACT_FORM.SENDING : CONTACT_FORM.SUBMIT}
          </Button>
          <p className="text-sm text-center text-gray-500 mt-4">{CONTACT_FORM.SECURITY_NOTE}</p>
        </div>
      </form>
    </div>
  );
}
