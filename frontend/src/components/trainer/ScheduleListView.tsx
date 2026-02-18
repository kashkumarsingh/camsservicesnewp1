'use client';

import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import type { Shift, AvailabilityEntry } from '@/core/trainer/domain/entities/TrainerSchedule';
import { Clock, MapPin, MessageSquare } from 'lucide-react';
import styles from './ScheduleListView.module.css';

interface ScheduleListViewProps {
  shifts: Shift[];
  availability: AvailabilityEntry[];
  viewMode: 'schedule' | 'available';
  /**
   * Base path for the shift detail route.
   *
   * Example:
   * - Trainer dashboard: /dashboard/trainer/schedule
   * - Admin viewing trainer: /dashboard/admin/trainers/[trainerId]/schedule
   */
  basePath?: string;
  /** When false, hides rate/total pay row (e.g. admin session view). Default true. */
  showPay?: boolean;
}

export function ScheduleListView({
  shifts,
  availability,
  viewMode,
  basePath,
  showPay = true,
}: ScheduleListViewProps) {
  if (!shifts.length && !availability.length) {
    return <div className={styles.emptyState}>No shifts or availability records for this period.</div>;
  }

  const groupedShifts = shifts.reduce<Record<string, Shift[]>>((acc, shift) => {
    if (!acc[shift.date]) acc[shift.date] = [];
    acc[shift.date].push(shift);
    return acc;
  }, {});

  const availableDates = availability
    .filter((a) => a.type === 'available')
    .map((a) => a.date);
  const dates = Array.from(
    new Set([...Object.keys(groupedShifts), ...availableDates])
  ).sort();

  if (viewMode === 'available') {
    return <div className={styles.emptyState}>No available shifts yet – this will be populated from the backend.</div>;
  }

  const shiftDetailBasePath = basePath ?? '/dashboard/trainer/schedule';

  return (
    <div className={styles.list}>
      {dates.map((date) => {
        const dayShifts = groupedShifts[date] ?? [];
        const parsedDate = parseISO(date);
        const dayName = format(parsedDate, 'EEE').toUpperCase();
        const dayNumber = format(parsedDate, 'd');
        const unavailable = availability.find((a) => a.date === date && a.type === 'unavailable');
        const availableFromTrainer =
          !unavailable &&
          dayShifts.length === 0 &&
          availability.some((a) => a.date === date && a.type === 'available');

        return (
          <div key={date} className={styles.dayGroup}>
            <div className={styles.dayLabel}>
              <span className={styles.dayName}>{dayName}</span>
              <span className={styles.dayNumber}>{dayNumber}</span>
            </div>

            {unavailable ? (
              <div className={styles.unavailableCard}>
                <div className={styles.unavailableLabel}>UNAVAILABLE</div>
                <div>All day</div>
              </div>
            ) : availableFromTrainer ? (
              <div className={styles.availableCard}>
                <div className={styles.availableLabel}>AVAILABLE</div>
                <div className={styles.availableSubtext}>From trainer&apos;s dashboard</div>
              </div>
            ) : (
              <div className={styles.shiftsContainer}>
                {dayShifts.map((shift) => (
                  <Link
                    key={shift.id}
                    href={`${shiftDetailBasePath}/shift/${shift.id}`}
                    className={styles.shiftCard}
                  >
                    <div className={styles.shiftHeader}>
                      <div className={styles.shiftTime}>
                        <Clock size={16} aria-hidden />
                        <span>
                          {shift.startTime} – {shift.endTime}
                        </span>
                      </div>
                      {shift.notesCount && shift.notesCount > 0 && (
                        <div className={styles.notesIndicator}>
                          <MessageSquare size={14} aria-hidden />
                          <span>{shift.notesCount}</span>
                        </div>
                      )}
                    </div>

                    <h3 className={styles.shiftPosition}>{shift.position}</h3>

                    <div className={styles.shiftLocation}>
                      <MapPin size={14} aria-hidden />
                      <span>{shift.location.name}</span>
                    </div>

                    {showPay && (
                      <div className={styles.shiftFooter}>
                        <span className={styles.shiftRate}>£{shift.rate.toFixed(2)}/hr</span>
                        <span className={styles.shiftPay}>Total: £{shift.totalPay.toFixed(2)}</span>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ScheduleListView;

