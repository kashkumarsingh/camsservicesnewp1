import { IBookingRepository } from '@/core/application/booking/ports/IBookingRepository';
import { StaticBookingRepository } from './StaticBookingRepository';
import { ApiBookingRepository } from './ApiBookingRepository';

/**
 * Booking Repository Factory
 * Provides a way to switch between different booking repository implementations.
 *
 * IMPORTANT:
 * - For real booking + payment flows (Stripe / backend), we MUST use the API repository
 *   so that bookings exist in the Laravel backend before creating payment intents.
 * - The static repository is only for local demos or Storybook-style UI prototyping.
 */
export class BookingRepositoryFactory {
  static create(repositoryType: 'static' | 'api' = 'api'): IBookingRepository {
    switch (repositoryType) {
      case 'static':
        return new StaticBookingRepository();
      case 'api':
      default:
        return new ApiBookingRepository();
    }
  }
}

/**
 * Default booking repository
 *
 * - Uses API repository by default (production, Docker, real flows)
 * - Allows opting into static repository explicitly via env for demos:
 *   NEXT_PUBLIC_USE_API_REPOSITORY=static
 */
export const bookingRepository = BookingRepositoryFactory.create(
  process.env.NEXT_PUBLIC_USE_API_REPOSITORY === 'static' ? 'static' : 'api'
);


