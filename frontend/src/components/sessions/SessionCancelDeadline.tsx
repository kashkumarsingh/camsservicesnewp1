import React from 'react';
import moment from 'moment';

type CancelState = 'CAN_CANCEL' | 'LOCKED_24H' | 'IN_PROGRESS' | 'PAST';

interface SessionLike {
  date: string;
  startTime: string;
  endTime?: string | null;
}

interface SessionCancelDeadlineProps {
  session: SessionLike;
  compact?: boolean;
}

/**
 * SessionCancelDeadline
 *
 * Reusable component that displays a cancellation deadline / lock state
 * for a session, based on the global 24‑hour cancellation policy.
 *
 * States:
 * - CAN_CANCEL    → Shows "Cancel by ..." with hours remaining
 * - LOCKED_24H    → Shows "Cannot cancel (within 24h)"
 * - IN_PROGRESS   → Shows "In progress"
 * - PAST          → Renders nothing
 */
export const SessionCancelDeadline: React.FC<SessionCancelDeadlineProps> = ({
  session,
  compact = false,
}) => {
  const start = moment(`${session.date} ${session.startTime}`, 'YYYY-MM-DD HH:mm');
  const end = session.endTime
    ? moment(`${session.date} ${session.endTime}`, 'YYYY-MM-DD HH:mm')
    : start.clone().add(1, 'hour');
  const now = moment();

  const cancelDeadline = start.clone().subtract(24, 'hours');

  let state: CancelState = 'CAN_CANCEL';

  if (now.isSameOrAfter(end)) {
    state = 'PAST';
  } else if (now.isSameOrAfter(start) && now.isBefore(end)) {
    state = 'IN_PROGRESS';
  } else if (now.isSameOrAfter(cancelDeadline)) {
    state = 'LOCKED_24H';
  } else {
    state = 'CAN_CANCEL';
  }

  if (state === 'PAST') {
    return null;
  }

  const hoursUntilDeadline = cancelDeadline.diff(now, 'hours', true);
  const roundedHoursLeft = Math.max(0, Math.floor(hoursUntilDeadline));

  const baseClasses = 'mt-0.5 flex items-center gap-1 text-[11px]';

  const stateClasses: Record<CancelState, string> = {
    CAN_CANCEL: 'text-gray-500',
    LOCKED_24H: 'text-amber-600',
    IN_PROGRESS: 'text-red-600',
    PAST: '',
  };

  const stateIcons: Record<CancelState, string> = {
    CAN_CANCEL: '⏰',
    LOCKED_24H: '⚠️',
    IN_PROGRESS: '🔴',
    PAST: '',
  };

  const deadlineLabel = cancelDeadline.format(compact ? 'ddd D, hA' : 'ddd D, h:mm A');

  const message = (() => {
    switch (state) {
      case 'CAN_CANCEL':
        return `Cancel by ${deadlineLabel} (${roundedHoursLeft}h left)`;
      case 'LOCKED_24H':
        return 'Cannot cancel (within 24h)';
      case 'IN_PROGRESS':
        return 'In progress';
      default:
        return '';
    }
  })();

  const ariaLabel = (() => {
    switch (state) {
      case 'CAN_CANCEL':
        return `Cancellation deadline: ${cancelDeadline.format('dddd, MMMM D, YYYY [at] h:mm A')}, ${roundedHoursLeft} hours remaining`;
      case 'LOCKED_24H':
        return 'Cancellation is locked because the session starts within 24 hours.';
      case 'IN_PROGRESS':
        return 'Session is currently in progress and cannot be cancelled.';
      default:
        return undefined;
    }
  })();

  if (!message) {
    return null;
  }

  return (
    <div
      className={`${baseClasses} ${stateClasses[state]}`}
      aria-label={ariaLabel}
    >
      <span aria-hidden="true">{stateIcons[state]}</span>
      <span className="truncate">{message}</span>
    </div>
  );
};

export default SessionCancelDeadline;

