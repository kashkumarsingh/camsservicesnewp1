/**
 * Date Service
 * 
 * Business logic for date operations and calculations.
 * Handles date generation, validation, and date-based queries.
 */

import moment, { Moment } from 'moment';

export interface CalendarDay {
  dateString: string; // YYYY-MM-DD
  dayNumber: string; // DD
  dayOfWeek: string; // Mon, Tue
  month: string; // Jan, Feb
  monthNumber: number; // 1-12
  year: number;
  isToday: boolean;
  isSelected: boolean;
  isBooked: boolean;
  isDisabled: boolean;
}

export interface GenerateDaysOptions {
  startDate?: string; // YYYY-MM-DD, defaults to today
  daysCount?: number; // How many days to generate, defaults to 30
  minDate?: string; // YYYY-MM-DD, earliest selectable date
  maxDate?: string; // YYYY-MM-DD, latest selectable date (e.g., based on package weeks constraint)
  markedDates?: string[]; // Dates that already have sessions (in current booking)
  blockedDates?: string[]; // Dates that are booked in other bookings (should be disabled)
  editingDate?: string; // Date currently being edited (should NOT be grayed out)
  selectedDate?: string; // Currently selected date
}

export class DateService {
  /**
   * Generate calendar days for display
   * @param options - Options for generating days
   * @returns Array of CalendarDay objects
   * @example
   * const days = DateService.generateDays({
   *   startDate: '2025-11-01',
   *   daysCount: 30,
   *   markedDates: ['2025-11-05', '2025-11-10']
   * });
   */
  static generateDays(options: GenerateDaysOptions): CalendarDay[] {
    const {
      startDate = moment().format('YYYY-MM-DD'),
      daysCount = 30,
      minDate = moment().format('YYYY-MM-DD'),
      maxDate,
      markedDates = [],
      blockedDates = [],
      editingDate,
      selectedDate,
    } = options;

    const startMoment = moment(startDate);
    const minMoment = moment(minDate);
    const maxMoment = maxDate ? moment(maxDate) : null;

    return Array.from({ length: daysCount }, (_, i) => {
      const day = startMoment.clone().add(i, 'days');
      const dateString = day.format('YYYY-MM-DD');
      const isToday = this.isSameDay(day, moment());
      const isSelected = selectedDate ? this.isSameDay(day, moment(selectedDate)) : false;
      const isMarked = markedDates.includes(dateString);
      const isBlocked = blockedDates.includes(dateString);
      const isEditing = editingDate === dateString;
      // A date is "booked" if it's marked (in current booking) OR blocked (in other bookings)
      // But allow editing if it's the current editing date
      const isBooked = (isMarked || isBlocked) && !isEditing;
      // A date is disabled if it's before minDate, after maxDate, OR it's blocked (booked in other bookings)
      const isDisabled = 
        day.isBefore(minMoment, 'day') || 
        (maxMoment && day.isAfter(maxMoment, 'day')) ||
        (isBlocked && !isEditing);

      return {
        dateString,
        dayNumber: day.format('DD'),
        dayOfWeek: day.format('ddd'),
        month: day.format('MMM'),
        monthNumber: day.month() + 1,
        year: day.year(),
        isToday,
        isSelected,
        isBooked,
        isDisabled,
      };
    });
  }

  /**
   * Check if two dates are the same day
   * @param date1 - First date
   * @param date2 - Second date
   * @returns True if same day
   */
  static isSameDay(date1: Moment, date2: Moment): boolean {
    return date1.isSame(date2, 'day');
  }

  /**
   * Get next available date (skipping booked dates)
   * @param currentDate - Current date string
   * @param bookedDates - Array of booked date strings
   * @param minDate - Minimum date (defaults to today)
   * @returns Next available date string
   * @example
   * const next = DateService.getNextAvailableDate('2025-11-01', ['2025-11-02', '2025-11-03']);
   * // Returns: '2025-11-04'
   */
  static getNextAvailableDate(
    currentDate: string,
    bookedDates: string[],
    minDate: string = moment().format('YYYY-MM-DD')
  ): string {
    let nextDate = moment(currentDate).add(1, 'day');
    let attempts = 0;
    const maxAttempts = 30; // Prevent infinite loops, check up to a month ahead

    while (bookedDates.includes(nextDate.format('YYYY-MM-DD')) && attempts < maxAttempts) {
      nextDate = nextDate.add(1, 'day');
      attempts++;
    }

    // If all next 30 days are booked, return the current date or minDate
    if (attempts === maxAttempts) {
      return moment(minDate).format('YYYY-MM-DD');
    }

    return nextDate.format('YYYY-MM-DD');
  }

  /**
   * Add days to a given date
   */
  static addDays(date: string, days: number): string {
    return moment(date).add(days, 'days').format('YYYY-MM-DD');
  }

  /**
   * Calculate difference in days between two dates
   */
  static getDaysDifference(date1: string, date2: string): number {
    return moment(date1).diff(moment(date2), 'days');
  }

  /**
   * Get formatted month label (e.g., "November 2025")
   */
  static getMonthLabel(date: string): string {
    return moment(date).format('MMMM YYYY');
  }

  /**
   * Format a date using moment formatting tokens
   */
  static formatDate(date: string | Moment, format: string = 'YYYY-MM-DD'): string {
    return moment(date).format(format);
  }

  /**
   * Start of week for the provided date
   */
  static getWeekStart(date: string): string {
    return moment(date).startOf('week').format('YYYY-MM-DD');
  }

  /**
   * End of week for the provided date
   */
  static getWeekEnd(date: string): string {
    return moment(date).endOf('week').format('YYYY-MM-DD');
  }

  /**
   * Start of month for the provided date
   */
  static getMonthStart(date: string): string {
    return moment(date).startOf('month').format('YYYY-MM-DD');
  }

  /**
   * End of month for the provided date
   */
  static getMonthEnd(date: string): string {
    return moment(date).endOf('month').format('YYYY-MM-DD');
  }

  /**
   * Check if date is in the past
   * @param dateString - Date string to check
   * @returns True if date is in the past
   */
  static isPastDate(dateString: string): boolean {
    return moment(dateString).isBefore(moment(), 'day');
  }

  /**
   * Check if date is today
   * @param dateString - Date string to check
   * @returns True if date is today
   */
  static isToday(dateString: string): boolean {
    return this.isSameDay(moment(dateString), moment());
  }

  /**
   * Check if date is in the future
   * @param dateString - Date string to check
   * @returns True if date is in the future
   */
  static isFutureDate(dateString: string): boolean {
    return moment(dateString).isAfter(moment(), 'day');
  }

  /**
   * Get days between two dates
   * @param startDate - Start date string
   * @param endDate - End date string
   * @returns Number of days
   */
  static getDaysBetween(startDate: string, endDate: string): number {
    return moment(endDate).diff(moment(startDate), 'days');
  }

  /**
   * Get all dates in a range
   * @param startDate - Start date string
   * @param endDate - End date string
   * @returns Array of date strings
   */
  static getDatesInRange(startDate: string, endDate: string): string[] {
    const dates: string[] = [];
    const start = moment(startDate);
    const end = moment(endDate);

    while (start.isSameOrBefore(end, 'day')) {
      dates.push(start.format('YYYY-MM-DD'));
      start.add(1, 'day');
    }

    return dates;
  }

  /**
   * Validate date string format
   * @param dateString - Date string to validate
   * @returns True if valid format (YYYY-MM-DD)
   */
  static isValidDateString(dateString: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(dateString) && moment(dateString).isValid();
  }
}

