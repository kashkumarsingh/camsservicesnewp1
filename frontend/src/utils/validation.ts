/**
 * Validation Utilities
 * 
 * FAANG-level validation functions for forms
 * Centralized validation logic for consistency across all forms
 */

/**
 * Email validation regex
 * Matches standard email format: user@domain.tld
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * UK Phone validation regex (HTML5 pattern)
 * Supports UK formats: +44, 0, spaces, dashes, parentheses
 * Examples: +44 7XXX XXXXXX, 020 XXXX XXXX, (020) 1234 5678, 07123 456789
 */
const UK_PHONE_PATTERN = '^(?:\\+44\\s?|0)(?:\\d{2,4}\\s?\\d{3,4}\\s?\\d{3,4})$';

/**
 * UK Phone validation regex (JavaScript)
 * Validates UK phone numbers after cleaning formatting characters
 */
const UK_PHONE_REGEX = /^(?:\+44|0)(?:\d{10,11})$/;

/**
 * Name validation regex
 * Allows letters, spaces, hyphens, apostrophes (for names like O'Brien, Mary-Jane)
 * Minimum 2 characters, maximum 100 characters
 */
const NAME_REGEX = /^[a-zA-Z\s'-]{2,100}$/;

/**
 * Full name validation (first + last)
 * Requires at least 2 words (first name and last name)
 */
const FULL_NAME_REGEX = /^[a-zA-Z\s'-]{2,}\s+[a-zA-Z\s'-]{2,}$/;

/**
 * Validate email address
 * 
 * @param email - Email address to validate
 * @returns Object with valid flag and error message
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || email.trim().length === 0) {
    return { valid: false, error: 'Email is required' };
  }

  if (email.length > 255) {
    return { valid: false, error: 'Email cannot exceed 255 characters' };
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return { valid: false, error: 'Please enter a valid email address' };
  }

  return { valid: true };
}

/**
 * Validate UK phone number
 * 
 * Supports UK formats:
 * - Mobile: 07XXX XXXXXX, +44 7XXX XXXXXX
 * - Landline: 020 XXXX XXXX, +44 20 XXXX XXXX, (020) 1234 5678
 * 
 * @param phone - Phone number to validate
 * @returns Object with valid flag and error message
 */
export function validatePhone(phone: string): { valid: boolean; error?: string } {
  if (!phone || phone.trim().length === 0) {
    return { valid: false, error: 'Phone number is required' };
  }

  const trimmed = phone.trim();

  // Remove common formatting characters (spaces, dashes, parentheses) for validation
  // Keep +44 and 0 for UK format detection
  const cleaned = trimmed.replace(/[\s\-\(\)]/g, '');

  // UK phone validation:
  // - Must start with +44 or 0
  // - After +44 or 0, must have 10-11 digits
  // - Mobile: 07XXX XXXXXX (11 digits) or +44 7XXX XXXXXX (13 digits with +44)
  // - Landline: 020 XXXX XXXX (11 digits) or +44 20 XXXX XXXX (13 digits with +44)
  
  if (!UK_PHONE_REGEX.test(cleaned)) {
    return { 
      valid: false, 
      error: 'Please enter a valid UK phone number (e.g., 07123 456789 or 020 1234 5678)' 
    };
  }

  // Additional validation: Check if it's a valid UK format
  // Mobile numbers: 07XXX XXXXXX (11 digits starting with 07)
  // Landline: 01XXX XXXXXX, 02X XXXX XXXX, etc.
  const digitsOnly = cleaned.replace(/^\+44/, '0'); // Convert +44 to 0 for validation
  
  // Check if it's a valid UK number format
  if (digitsOnly.startsWith('0')) {
    const numberPart = digitsOnly.substring(1); // Remove leading 0
    
    // Mobile: 7XXX XXXXXX (10 digits starting with 7)
    // Landline: 1XXX XXXXXX or 2X XXXX XXXX (10-11 digits)
    if (numberPart.length < 10 || numberPart.length > 11) {
      return { 
        valid: false, 
        error: 'UK phone numbers must be 10-11 digits (excluding country code)' 
      };
    }
    
    // Mobile numbers start with 7 and are 10 digits
    // Landline numbers start with 1 or 2 and are 10-11 digits
    if (!/^[127]\d{9,10}$/.test(numberPart)) {
      return { 
        valid: false, 
        error: 'Please enter a valid UK phone number format' 
      };
    }
  }

  return { valid: true };
}

/**
 * Validate name (single name or first name)
 * 
 * @param name - Name to validate
 * @returns Object with valid flag and error message
 */
export function validateName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Name is required' };
  }

  const trimmed = name.trim();

  if (trimmed.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: 'Name cannot exceed 100 characters' };
  }

  if (!NAME_REGEX.test(trimmed)) {
    return { valid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }

  return { valid: true };
}

/**
 * Validate full name (first name + last name)
 * 
 * @param fullName - Full name to validate
 * @returns Object with valid flag and error message
 */
export function validateFullName(fullName: string): { valid: boolean; error?: string } {
  if (!fullName || fullName.trim().length === 0) {
    return { valid: false, error: 'Full name is required' };
  }

  const trimmed = fullName.trim();

  // Check if has at least 2 words (first name and last name)
  const nameParts = trimmed.split(/\s+/).filter(Boolean);
  if (nameParts.length < 2) {
    return { valid: false, error: 'Please enter both first and last name' };
  }

  // Validate each part
  for (const part of nameParts) {
    if (part.length < 2) {
      return { valid: false, error: 'Each name part must be at least 2 characters' };
    }
    if (!NAME_REGEX.test(part)) {
      return { valid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
    }
  }

  if (trimmed.length > 200) {
    return { valid: false, error: 'Full name cannot exceed 200 characters' };
  }

  return { valid: true };
}

/**
 * Get HTML5 pattern attribute for UK phone input
 * 
 * UK phone format: +44 or 0, followed by area code and number
 * Examples: +44 7XXX XXXXXX, 020 XXXX XXXX, (020) 1234 5678
 * 
 * @returns Pattern string for HTML5 validation
 */
export function getPhonePattern(): string {
  return UK_PHONE_PATTERN;
}

/**
 * Get HTML5 pattern attribute for name input
 * 
 * @returns Pattern string for HTML5 validation
 */
export function getNamePattern(): string {
  return "[a-zA-Z\\s'-]{2,100}";
}

/**
 * Get HTML5 pattern attribute for full name input
 * 
 * @returns Pattern string for HTML5 validation
 */
export function getFullNamePattern(): string {
  // Full name pattern: at least 2 words separated by space
  // Each word: starts with letter, followed by letters, spaces, hyphens, or apostrophes
  // Note: HTML5 pattern attributes have strict requirements
  // Solution: Use a simpler pattern that validates the structure without complex character classes
  // Pattern breakdown:
  // - [a-zA-Z]+ : First word (at least one letter)
  // - \\s+ : One or more spaces (escaped for string)
  // - [a-zA-Z]+ : Second word (at least one letter)
  // This is the simplest valid pattern that ensures first name + last name
  // For names with hyphens/apostrophes, we'll rely on JavaScript validation instead
  return "[a-zA-Z]+\\s+[a-zA-Z]+";
}

/**
 * Validate child age
 * 
 * Validates that age is a number between 0 and 25 (reasonable range for children/young adults)
 * 
 * @param age - Age to validate (can be string or number)
 * @returns Object with valid flag and error message
 */
export function validateAge(age: string | number): { valid: boolean; error?: string } {
  if (!age || String(age).trim().length === 0) {
    return { valid: false, error: 'Age is required' };
  }

  const ageStr = String(age).trim();
  
  // Check if it's a valid number
  if (!/^\d+$/.test(ageStr)) {
    return { valid: false, error: 'Age must be a number' };
  }

  const ageNum = parseInt(ageStr, 10);
  
  if (isNaN(ageNum)) {
    return { valid: false, error: 'Age must be a valid number' };
  }

  if (ageNum < 0) {
    return { valid: false, error: 'Age cannot be negative' };
  }

  if (ageNum > 25) {
    return { valid: false, error: 'Age must be 25 years or less' };
  }

  return { valid: true };
}

/**
 * Get HTML5 pattern attribute for age input
 * 
 * @returns Pattern string for HTML5 validation (0-25)
 */
export function getAgePattern(): string {
  return "^(0|[1-9]|1[0-9]|2[0-5])$";
}

/**
 * Validate UK address
 * 
 * Validates that address contains a door number (starts with number)
 * Examples: "123 High Street", "45A Main Road", "10-12 Church Lane"
 * 
 * @param address - Address to validate
 * @returns Object with valid flag and error message
 */
export function validateAddress(address: string): { valid: boolean; error?: string } {
  if (!address || address.trim().length === 0) {
    return { valid: false, error: 'Address is required' };
  }

  const trimmed = address.trim();

  if (trimmed.length < 5) {
    return { valid: false, error: 'Address must be at least 5 characters' };
  }

  // Check if address contains a door number (number at the start or after common prefixes)
  // Pattern: starts with number, optionally followed by letter (e.g., "123", "45A", "10-12")
  // Or starts with common prefixes like "Flat", "Apartment", "Unit" followed by number
  const doorNumberPattern = /^(\d+[A-Za-z]?(-?\d+[A-Za-z]?)?|(Flat|Apartment|Apt|Unit|Suite|Room|No\.?|Number)\s+\d+[A-Za-z]?(-?\d+[A-Za-z]?)?)\s/i;
  if (!doorNumberPattern.test(trimmed)) {
    return { valid: false, error: 'Address must include a door number (e.g., 123 High Street, Flat 1 Main Road)' };
  }

  if (trimmed.length > 500) {
    return { valid: false, error: 'Address cannot exceed 500 characters' };
  }

  return { valid: true };
}

/**
 * Validate UK postal code
 * 
 * Validates UK postal code format (e.g., IG9 5BT, SW1A 1AA, M1 1AA)
 * 
 * @param postcode - Postal code to validate
 * @returns Object with valid flag and error message
 */
export function validatePostcode(postcode: string): { valid: boolean; error?: string } {
  if (!postcode || postcode.trim().length === 0) {
    return { valid: false, error: 'Postal code is required' };
  }

  const trimmed = postcode.trim().toUpperCase();

  // UK postcode pattern: AA9A 9AA or A9A 9AA or A9 9AA or A99 9AA or AA9 9AA or AA99 9AA
  // Examples: IG9 5BT, SW1A 1AA, M1 1AA, EC1A 1BB
  const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/;

  if (!UK_POSTCODE_REGEX.test(trimmed)) {
    return { valid: false, error: 'Please enter a valid UK postal code (e.g., IG9 5BT)' };
  }

  return { valid: true };
}

/**
 * Password validation regex patterns
 * - At least one number: \d
 * - At least one letter (alphanumeric): [a-zA-Z]
 * - At least one special character: [!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]
 */
const PASSWORD_HAS_NUMBER = /\d/;
const PASSWORD_HAS_LETTER = /[a-zA-Z]/;
const PASSWORD_HAS_SPECIAL = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

/**
 * Validate password
 * 
 * Requirements:
 * - Minimum 8 characters
 * - At least one number
 * - At least one letter (alphanumeric)
 * - At least one special character
 * 
 * @param password - Password to validate
 * @returns Object with valid flag and error message
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || password.trim().length === 0) {
    return { valid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }

  if (!PASSWORD_HAS_NUMBER.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' };
  }

  if (!PASSWORD_HAS_LETTER.test(password)) {
    return { valid: false, error: 'Password must contain at least one letter' };
  }

  if (!PASSWORD_HAS_SPECIAL.test(password)) {
    return { valid: false, error: 'Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)' };
  }

  return { valid: true };
}

/**
 * Get HTML5 pattern attribute for password input
 * 
 * Pattern requires:
 * - At least 8 characters
 * - At least one number
 * - At least one letter
 * - At least one special character
 * 
 * @returns Pattern string for HTML5 validation
 */
export function getPasswordPattern(): string {
  // HTML5 pattern: at least 8 chars, contains number, letter, and special char
  // (?=.*\d) - positive lookahead for at least one digit
  // (?=.*[a-zA-Z]) - positive lookahead for at least one letter
  // (?=.*[!@#$%^&*()_+\-=\[\]{};':",.<>\/?]) - positive lookahead for at least one special char
  // .{8,} - at least 8 characters total
  // Note: Removed pipe (|) from character class as it causes issues in HTML5 patterns
  // Removed backslash and quotes that cause escaping issues
  // The pattern string will be used directly in HTML pattern attribute
  return "(?=.*\\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};',.<>\\/?]).{8,}";
}

