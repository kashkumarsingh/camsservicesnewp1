'use client';

import React from 'react';

interface AddressFieldProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  parentAddress?: string;
  onUseParentAddress?: () => void;
  compact?: boolean;
  disabled?: boolean;
}

export const AddressField: React.FC<AddressFieldProps> = ({
  label,
  required = false,
  value,
  onChange,
  placeholder = 'Address or postcode',
  parentAddress,
  onUseParentAddress,
  compact = false,
  disabled = false,
}) => {
  const labelSize = compact ? 'text-xs' : 'text-sm';
  const inputSize = compact ? 'px-3 py-2 text-xs' : 'px-4 py-2.5 text-sm';
  const buttonSize = compact ? 'px-2 py-2 text-[10px]' : 'px-3 py-1 text-xs';

  const isUsingParentAddress = parentAddress ? value === parentAddress : false;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className={`block ${labelSize} font-semibold text-gray-700`}>
          {label} {required && <span className="text-[10px] font-normal text-gray-500">(required)</span>}
        </label>
        {parentAddress && onUseParentAddress && !disabled && (
          <label className={`inline-flex items-center gap-1.5 ${compact ? 'text-[10px]' : 'text-xs'} text-gray-700 cursor-pointer`}>
            <input
              type="checkbox"
              className={`${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-[#0080FF] rounded border-gray-300 focus:ring-[#0080FF]`}
              checked={isUsingParentAddress}
              onChange={(e) => {
                if (e.target.checked) {
                  onUseParentAddress();
                } else {
                  onChange('');
                }
              }}
            />
            Use parent address
          </label>
        )}
      </div>
      <input
        className={`w-full ${inputSize} rounded-lg border-2 border-gray-200 focus:border-[#0080FF] focus:outline-none text-gray-900 ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
        } ${isUsingParentAddress ? 'bg-gray-50' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled || isUsingParentAddress}
      />
    </div>
  );
};

