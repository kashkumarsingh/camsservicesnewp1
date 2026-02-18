'use client';

/**
 * In-memory cache for dashboard data so that when users return to a tab or
 * navigate back to the dashboard route, we can show last-known data immediately
 * (no loading in the middle) and refetch in the background.
 *
 * Cache is keyed by user id so switching users never shows another user's data.
 * Admin today-bookings cache is bounded by date to avoid unbounded memory growth.
 */

type UserId = string | number;

/** Keep admin today-bookings only for dates within this many days of today (memory bound). */
const ADMIN_TODAY_CACHE_RETENTION_DAYS = 3;

/** Parent dashboard: bookings list from ListBookingsUseCase. */
export interface ParentBookingsCache {
  bookings: unknown[];
  at: number;
}

/** Parent dashboard: stats from dashboard stats API. */
export interface ParentStatsCache {
  stats: unknown;
  at: number;
}

/** Parent dashboard: session notes from session notes API. */
export interface ParentSessionNotesCache {
  items: unknown[];
  at: number;
}

/** Trainer dashboard: bookings from trainer booking repository. */
export interface TrainerBookingsCache {
  bookings: unknown[];
  at: number;
}

/** Trainer dashboard: profile (optional, for capacity/display). */
export interface TrainerProfileCache {
  profile: unknown;
  at: number;
}

/** Admin dashboard: stats from admin dashboard stats API. */
export interface AdminStatsCache {
  stats: unknown;
  at: number;
}

/** Admin dashboard: today's bookings (single-day view for overview). Keyed by userId + date. */
export interface AdminTodayBookingsCache {
  bookings: unknown[];
  totalCount: number;
  at: number;
}

class DashboardSyncStoreImpl {
  private parentBookings: Map<string, ParentBookingsCache> = new Map();
  private parentStats: Map<string, ParentStatsCache> = new Map();
  private parentSessionNotes: Map<string, ParentSessionNotesCache> = new Map();
  private trainerBookings: Map<string, TrainerBookingsCache> = new Map();
  private trainerProfile: Map<string, TrainerProfileCache> = new Map();
  private adminStats: Map<string, AdminStatsCache> = new Map();
  private adminTodayBookings: Map<string, AdminTodayBookingsCache> = new Map();

  private key(userId: UserId): string {
    return String(userId);
  }

  private adminTodayKey(userId: UserId, dateStr: string): string {
    return `${this.key(userId)}:${dateStr}`;
  }

  /** Evict admin today-bookings entries older than retention window to bound memory. */
  private evictOldAdminTodayBookings(userId: UserId): void {
    const prefix = `${this.key(userId)}:`;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - ADMIN_TODAY_CACHE_RETENTION_DAYS);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    Array.from(this.adminTodayBookings.keys())
      .filter((key) => key.startsWith(prefix))
      .forEach((key) => {
        const dateStr = key.slice(prefix.length);
        if (dateStr < cutoffStr) this.adminTodayBookings.delete(key);
      });
  }

  getParentBookings(userId: UserId): ParentBookingsCache | null {
    return this.parentBookings.get(this.key(userId)) ?? null;
  }

  setParentBookings(userId: UserId, bookings: unknown[]): void {
    this.parentBookings.set(this.key(userId), { bookings, at: Date.now() });
  }

  getParentStats(userId: UserId): ParentStatsCache | null {
    return this.parentStats.get(this.key(userId)) ?? null;
  }

  setParentStats(userId: UserId, stats: unknown): void {
    this.parentStats.set(this.key(userId), { stats, at: Date.now() });
  }

  getParentSessionNotes(userId: UserId): ParentSessionNotesCache | null {
    return this.parentSessionNotes.get(this.key(userId)) ?? null;
  }

  setParentSessionNotes(userId: UserId, items: unknown[]): void {
    this.parentSessionNotes.set(this.key(userId), { items, at: Date.now() });
  }

  getTrainerBookings(userId: UserId): TrainerBookingsCache | null {
    return this.trainerBookings.get(this.key(userId)) ?? null;
  }

  setTrainerBookings(userId: UserId, bookings: unknown[]): void {
    this.trainerBookings.set(this.key(userId), { bookings, at: Date.now() });
  }

  getTrainerProfile(userId: UserId): TrainerProfileCache | null {
    return this.trainerProfile.get(this.key(userId)) ?? null;
  }

  setTrainerProfile(userId: UserId, profile: unknown): void {
    this.trainerProfile.set(this.key(userId), { profile, at: Date.now() });
  }

  getAdminStats(userId: UserId): AdminStatsCache | null {
    return this.adminStats.get(this.key(userId)) ?? null;
  }

  setAdminStats(userId: UserId, stats: unknown): void {
    this.adminStats.set(this.key(userId), { stats, at: Date.now() });
  }

  getAdminTodayBookings(userId: UserId, dateStr: string): AdminTodayBookingsCache | null {
    return this.adminTodayBookings.get(this.adminTodayKey(userId, dateStr)) ?? null;
  }

  setAdminTodayBookings(userId: UserId, dateStr: string, bookings: unknown[], totalCount: number): void {
    this.adminTodayBookings.set(this.adminTodayKey(userId, dateStr), {
      bookings,
      totalCount,
      at: Date.now(),
    });
    this.evictOldAdminTodayBookings(userId);
  }

  /** Clear cache for a user (e.g. on logout). */
  clearUser(userId: UserId): void {
    const k = this.key(userId);
    this.parentBookings.delete(k);
    this.parentStats.delete(k);
    this.parentSessionNotes.delete(k);
    this.trainerBookings.delete(k);
    this.trainerProfile.delete(k);
    this.adminStats.delete(k);
    const prefix = `${k}:`;
    Array.from(this.adminTodayBookings.keys())
      .filter((key) => key.startsWith(prefix))
      .forEach((key) => this.adminTodayBookings.delete(key));
  }
}

export const dashboardSyncStore = new DashboardSyncStoreImpl();
