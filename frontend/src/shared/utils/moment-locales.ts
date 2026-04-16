/**
 * Moment locale setup for Turbopack-only builds.
 * Only en-gb is imported (moment does not ship a generic 'en' locale);
 * do not import other moment/locale/* modules elsewhere.
 */
import moment from 'moment';
import 'moment/locale/en-gb';

moment.locale('en-gb');
