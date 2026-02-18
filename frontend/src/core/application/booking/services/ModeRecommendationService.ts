/**
 * Mode Recommendation Service
 * 
 * Clean Architecture Layer: Application (Services)
 * Purpose: Provides intelligent mode recommendations based on child age, booking history, and package type
 */

import { BookingDTO } from '../dto/BookingDTO';

export interface ModeRecommendation {
  modeKey: string;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
  explanation: string;
}

export interface ModeRecommendationInput {
  childAge?: number | null; // Child's age in years
  childId?: number | null; // Child ID for history lookup
  previousBookings?: BookingDTO[]; // Previous bookings for this child/user
  packageHours?: number; // Total hours in package
  packageTotalWeeks?: number; // Package duration in weeks
  timeOfYear?: 'term-time' | 'holiday'; // Current time period
}

export class ModeRecommendationService {
  /**
   * Recommend the best booking mode based on context
   * 
   * NOTE: Currently, only "sessions" mode is available. Other modes (single-day-event, 
   * multi-day-event, etc.) will be introduced in the future. This service always 
   * recommends "sessions" mode for now, but uses intelligent reasoning.
   */
  static recommend(input: ModeRecommendationInput): ModeRecommendation | null {
    const { childAge, previousBookings, packageHours, packageTotalWeeks, timeOfYear } = input;

    // Business constraint: Only "sessions" mode is currently available
    // All other modes are coming soon
    const recommendedMode: string = 'sessions';
    let confidence: 'high' | 'medium' | 'low' = 'high';
    let reason = '';
    let explanation = '';

    // Strategy 1: Previous booking history (highest priority - user preference)
    if (previousBookings && previousBookings.length > 0) {
      const sessionsBookings = previousBookings.filter(b => 
        !b.modeKey || b.modeKey === 'sessions'
      );
      
      if (sessionsBookings.length > 0) {
        confidence = 'high';
        reason = 'previous-booking';
        explanation = `You've booked sessions before. "Sessions" mode gives you maximum flexibility to book hours whenever you need them.`;
        return { modeKey: recommendedMode, confidence, reason, explanation };
      }
    }

    // Strategy 2: Child age-based recommendations
    if (childAge !== null && childAge !== undefined) {
      if (childAge < 8) {
        confidence = 'high';
        reason = 'child-age';
        explanation = `For children under 8, "Sessions" mode offers flexible, shorter sessions that work well with younger attention spans.`;
        return { modeKey: recommendedMode, confidence, reason, explanation };
      } else if (childAge >= 8 && childAge <= 12) {
        confidence = 'high';
        reason = 'child-age';
        explanation = `For children aged 8-12, "Sessions" mode provides the perfect balance of structure and flexibility.`;
        return { modeKey: recommendedMode, confidence, reason, explanation };
      } else if (childAge > 12) {
        confidence = 'high';
        reason = 'child-age';
        explanation = `For teenagers, "Sessions" mode allows you to schedule longer, more intensive sessions when needed.`;
        return { modeKey: recommendedMode, confidence, reason, explanation };
      }
    }

    // Strategy 3: Package type-based recommendations
    if (packageHours && packageHours > 20) {
      confidence = 'high';
      reason = 'package-type';
      explanation = `For packages with ${packageHours}+ hours, "Sessions" mode gives you maximum flexibility to use hours as needed.`;
      return { modeKey: recommendedMode, confidence, reason, explanation };
    }

    if (packageTotalWeeks && packageTotalWeeks >= 6) {
      confidence = 'high';
      reason = 'package-duration';
      explanation = `For ${packageTotalWeeks}-week packages, "Sessions" mode allows you to book flexibly throughout the program.`;
      return { modeKey: recommendedMode, confidence, reason, explanation };
    }

    // Strategy 4: Time of year considerations
    if (timeOfYear === 'holiday') {
      confidence = 'medium';
      reason = 'time-of-year';
      explanation = `During school holidays, "Sessions" mode lets you book flexibly around your family schedule.`;
      return { modeKey: recommendedMode, confidence, reason, explanation };
    }

    if (timeOfYear === 'term-time') {
      confidence = 'high';
      reason = 'time-of-year';
      explanation = `During term time, "Sessions" mode works perfectly for after-school and weekend bookings.`;
      return { modeKey: recommendedMode, confidence, reason, explanation };
    }

    // Default: sessions (only available mode)
    confidence = 'high';
    reason = 'default';
    explanation = `"Sessions" mode offers maximum flexibility - book hours whenever you want. Other booking modes (events, school runs, etc.) will be available soon.`;
    return { modeKey: recommendedMode, confidence, reason, explanation };
  }

  /**
   * Get user's preferred mode from previous bookings
   */
  static getPreferredMode(previousBookings: BookingDTO[]): string | null {
    if (!previousBookings || previousBookings.length === 0) {
      return null;
    }

    // Count mode usage
    const modeCounts = new Map<string, number>();
    previousBookings.forEach(booking => {
      if (booking.modeKey) {
        modeCounts.set(booking.modeKey, (modeCounts.get(booking.modeKey) || 0) + 1);
      }
    });

    if (modeCounts.size === 0) {
      return null;
    }

    // Return most frequently used mode
    return Array.from(modeCounts.entries())
      .sort((a, b) => b[1] - a[1])[0][0];
  }

  /**
   * Get display name for mode key
   */
  private static getModeDisplayName(modeKey: string): string {
    const modeNames: Record<string, string> = {
      'sessions': 'Sessions (by the hour)',
      'single-day-event': 'Single-day event',
      'multi-day-event': 'Multi-day camp/retreat',
      'school-run-after': 'School run + wraparound',
      'weekend-respite': 'Weekend respite support',
      'club-escort': 'Club/Class escort',
      'therapy-companion': 'Therapy companion',
      'holiday-day-trip': 'Holiday day trip',
      'exam-support': 'Exam support',
      'hospital-appointment': 'Hospital appointment escort',
      'custom': 'Custom plan',
    };
    return modeNames[modeKey] || modeKey;
  }

  /**
   * Determine time of year (term-time vs holiday)
   */
  static getTimeOfYear(): 'term-time' | 'holiday' {
    const now = new Date();
    const month = now.getMonth(); // 0-11
    const day = now.getDate();

    // UK school holidays (approximate)
    // Summer: July-August
    // Christmas: December 20 - January 5
    // Easter: March-April (varies)
    // Half-term: varies

    if (month === 6 || month === 7) { // July-August
      return 'holiday';
    }
    if (month === 11 && day >= 20) { // December 20+
      return 'holiday';
    }
    if (month === 0 && day <= 5) { // January 1-5
      return 'holiday';
    }

    return 'term-time';
  }
}
