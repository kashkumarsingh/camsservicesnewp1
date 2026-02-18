/**
 * Phone Number Value Object
 * 
 * Immutable phone number value object with validation.
 */

import { ValueObject } from '../../shared/ValueObject';

export class PhoneNumber extends ValueObject {
  private readonly _value: string;

  private constructor(value: string) {
    super();
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  static fromString(value: string): PhoneNumber {
    if (!value || value.trim().length === 0) {
      throw new Error('Phone number cannot be empty');
    }

    const trimmed = value.trim();

    // Remove common formatting characters (spaces, dashes, parentheses) for validation
    // Keep +44 and 0 for UK format detection
    const cleaned = trimmed.replace(/[\s\-\(\)]/g, '');

    // UK phone validation:
    // - Must start with +44 or 0
    // - After +44 or 0, must have 10-11 digits
    // - Mobile: 07XXX XXXXXX (11 digits) or +44 7XXX XXXXXX (13 digits with +44)
    // - Landline: 020 XXXX XXXX (11 digits) or +44 20 XXXX XXXX (13 digits with +44)
    const ukPhoneRegex = /^(?:\+44|0)(?:\d{10,11})$/;
    
    if (!ukPhoneRegex.test(cleaned)) {
      throw new Error('Invalid UK phone number format. Please use format: 07123 456789 or 020 1234 5678');
    }

    // Additional validation: Check if it's a valid UK number format
    const digitsOnly = cleaned.replace(/^\+44/, '0'); // Convert +44 to 0 for validation
    
    if (digitsOnly.startsWith('0')) {
      const numberPart = digitsOnly.substring(1); // Remove leading 0
      
      // Mobile: 7XXX XXXXXX (10 digits starting with 7)
      // Landline: 1XXX XXXXXX or 2X XXXX XXXX (10-11 digits)
      if (numberPart.length < 10 || numberPart.length > 11) {
        throw new Error('UK phone numbers must be 10-11 digits (excluding country code)');
      }
      
      // Mobile numbers start with 7 and are 10 digits
      // Landline numbers start with 1 or 2 and are 10-11 digits
      if (!/^[127]\d{9,10}$/.test(numberPart)) {
        throw new Error('Invalid UK phone number format. Mobile numbers start with 7, landline with 1 or 2');
      }
    }

    return new PhoneNumber(trimmed);
  }

  format(): string {
    // Return formatted version if needed
    return this._value;
  }

  protected valueEquals(other: ValueObject): boolean {
    if (!(other instanceof PhoneNumber)) {
      return false;
    }
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}


