/**
 * Currency Formatting Utility
 * Formats numbers as currency strings with proper locale support
 */

export interface CurrencyFormatterOptions {
  locale?: string;
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/**
 * Format a number as currency
 * 
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string (e.g., "£1,234.56")
 * 
 * @example
 * formatCurrency(1234.56) // "£1,234.56"
 * formatCurrency(1000) // "£1,000.00"
 * formatCurrency(1000, { minimumFractionDigits: 0 }) // "£1,000"
 */
export function formatCurrency(
  amount: number,
  options: CurrencyFormatterOptions = {}
): string {
  const {
    locale = 'en-GB',
    currency = 'GBP',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
}

/**
 * Format a number as currency without decimal places (for display purposes)
 * 
 * @param amount - The amount to format
 * @returns Formatted currency string without decimals (e.g., "£1,235")
 * 
 * @example
 * formatCurrencyWhole(1234.56) // "£1,235"
 * formatCurrencyWhole(1000) // "£1,000"
 */
export function formatCurrencyWhole(amount: number): string {
  return formatCurrency(amount, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/**
 * Format a number as currency with custom decimal places
 * 
 * @param amount - The amount to format
 * @param decimals - Number of decimal places (0-2)
 * @returns Formatted currency string
 * 
 * @example
 * formatCurrencyWithDecimals(1234.56, 0) // "£1,235"
 * formatCurrencyWithDecimals(1234.56, 1) // "£1,234.6"
 */
export function formatCurrencyWithDecimals(amount: number, decimals: number = 2): string {
  return formatCurrency(amount, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}





