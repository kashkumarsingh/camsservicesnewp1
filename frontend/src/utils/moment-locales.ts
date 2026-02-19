/**
 * Moment locale setup for Turbopack-only builds.
 * Only these locales are imported so the bundle stays trimmed (en-gb + en);
 * do not import other moment/locale/* modules elsewhere.
 */
import moment from 'moment';
import 'moment/locale/en-gb';
import 'moment/locale/en';

moment.locale('en-gb');
