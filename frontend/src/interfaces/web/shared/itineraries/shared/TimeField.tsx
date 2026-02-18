'use client';

import React from 'react';

interface TimeFieldProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  suggestedOptions?: Array<{ value: string; label: string; isSuggested?: boolean }>;
  suggestedValue?: string | null;
  onOverride?: () => void;
  overridden?: boolean;
  helperText?: string;
  compact?: boolean;
}

export const TimeField: React.FC<TimeFieldProps> = ({
  label,
  required = false,
  value,
  onChange,
  suggestedOptions,
  suggestedValue,
  onOverride,
  overridden = false,
  helperText,
  compact = false,
}) => {
  const labelSize = compact ? 'text-xs' : 'text-sm';
  const inputSize = compact ? 'px-3 py-2 text-xs' : 'px-4 py-2.5 text-sm';
  const helperSize = compact ? 'text-[10px]' : 'text-xs';

  const showSuggestions = suggestedOptions && suggestedOptions.length > 0 && !overridden && suggestedValue;

  return (
    <div>
      <label className={`block ${labelSize} font-semibold text-gray-700 mb-1.5`}>
        {label} {required && <span className="text-[10px] font-normal text-gray-500">(required)</span>}
      </label>
      {showSuggestions ? (
        <div className="space-y-1.5">
          <select
            className={`w-full ${inputSize} rounded-lg border-2 border-blue-200 focus:border-[#0080FF] focus:outline-none bg-white`}
            value={value || suggestedOptions[0]?.value || ''}
            onChange={(e) => onChange(e.target.value)}
          >
            {suggestedOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {helperText && (
            <div className={`${helperSize} text-gray-600 bg-blue-50 px-2 py-1 rounded flex items-center gap-1`}>
              <span>💡</span>
              <span>{helperText}</span>
            </div>
          )}
          {onOverride && (
            <button
              type="button"
              onClick={onOverride}
              className={`${helperSize} text-[#0080FF] hover:text-[#0069cc] font-semibold`}
            >
              Custom time →
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-1.5">
          <input
            type="time"
            className={`w-full ${inputSize} rounded-lg border-2 border-gray-200 focus:border-[#0080FF] focus:outline-none`}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
          {suggestedValue && onOverride && (
            <button
              type="button"
              onClick={() => {
                onChange(suggestedValue);
                onOverride();
              }}
              className={`${helperSize} text-[#0080FF] hover:text-[#0069cc] font-semibold`}
            >
              Use: {suggestedValue}
            </button>
          )}
        </div>
      )}
    </div>
  );
};


