/**
 * Notification toast via Sonner — extends base Sonner with intelligent link.
 * Used when a new dashboard notification arrives (same time as bell count update).
 * Single source for notification toast copy and behaviour.
 */

import { toast } from 'sonner';
import { SONNER_TOAST_DURATION_MS, NOTIFICATION_TOAST_VIEW_LABEL } from '@/shared/utils/appConstants';

export interface NotificationToastPayload {
  title: string;
  message: string;
  link: string | null;
}

/**
 * Show a Sonner toast for a dashboard notification, with optional "View" action that navigates to the notification link.
 * Call this when the notification bell count increases (e.g. after live refresh refetch).
 */
export function showNotificationToast(
  notification: NotificationToastPayload,
  options: { navigate: (path: string) => void }
): void {
  toast.success(notification.title, {
    description: notification.message,
    duration: SONNER_TOAST_DURATION_MS,
    action:
      notification.link != null && notification.link !== ''
        ? {
            label: NOTIFICATION_TOAST_VIEW_LABEL,
            onClick: () => options.navigate(notification.link!),
          }
        : undefined,
  });
}
