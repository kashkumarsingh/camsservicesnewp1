/**
 * Service Stats Calculator
 * 
 * Domain service for calculating service statistics.
 */

import { Service } from '../entities/Service';

export class ServiceStatsCalculator {
  static calculateTotalServices(services: Service[]): number {
    return services.length;
  }

  static calculateTotalViews(services: Service[]): number {
    return services.reduce((total, service) => total + service.views, 0);
  }

  static calculateAverageViews(services: Service[]): number {
    if (services.length === 0) {
      return 0;
    }
    return this.calculateTotalViews(services) / services.length;
  }

  static findMostViewed(services: Service[]): Service | null {
    if (services.length === 0) {
      return null;
    }
    return services.reduce((mostViewed, service) => 
      service.views > mostViewed.views ? service : mostViewed
    );
  }

  static countByCategory(services: Service[]): Record<string, number> {
    const counts: Record<string, number> = {};
    services.forEach(service => {
      const category = service.category || 'uncategorized';
      counts[category] = (counts[category] || 0) + 1;
    });
    return counts;
  }
}


