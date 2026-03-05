/**
 * Time format utilities for API and display.
 * Backend expects start_time/end_time in H:i format (e.g. 14:30); no seconds.
 */

import moment from 'moment';
import { TIME_FORMAT_24H } from '@/utils/appConstants';

/** Accepted input formats from API or form (HH:mm or HH:mm:ss). */
const TIME_PARSE_FORMATS = ['HH:mm', 'HH:mm:ss'] as const;

/**
 * Normalises a time string to backend H:i format (HH:mm). Use before sending
 * start_time/end_time to booking schedule create/update endpoints.
 */
export function toApiTimeFormat(time: string): string {
  return moment(time, [...TIME_PARSE_FORMATS]).format(TIME_FORMAT_24H);
}
