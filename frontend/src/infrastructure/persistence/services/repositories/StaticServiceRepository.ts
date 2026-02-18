/**
 * Static Service Repository
 * 
 * Infrastructure implementation using static data.
 * Uses existing src/data/servicesData.tsx for now.
 */

import { IServiceRepository } from '@/core/application/services/ports/IServiceRepository';
import { Service } from '@/core/domain/services/entities/Service';
import { ServiceSlug } from '@/core/domain/services/valueObjects/ServiceSlug';
import { services } from '@/data/servicesData';

export class StaticServiceRepository implements IServiceRepository {
  private servicesList: Service[] = [];

  constructor() {
    // Initialize from static data
    this.servicesList = services.map((item, index) => {
      const slug = ServiceSlug.fromString(item.slug);
      // Extract icon name from component (e.g., Heart.name = 'Heart')
      const iconName = item.icon?.name || (item.icon as any)?.displayName || undefined;
      return Service.create(
        `service-${index + 1}`, // Generate simple ID
        item.title,
        item.description,
        slug,
        iconName
      );
    });
  }

  async save(service: Service): Promise<void> {
    const index = this.servicesList.findIndex(s => s.id === service.id);
    if (index >= 0) {
      this.servicesList[index] = service;
    } else {
      this.servicesList.push(service);
    }
  }

  async findById(id: string): Promise<Service | null> {
    return this.servicesList.find(s => s.id === id) || null;
  }

  async findBySlug(slug: string): Promise<Service | null> {
    return this.servicesList.find(s => s.slug.toString() === slug) || null;
  }

  async findAll(): Promise<Service[]> {
    return [...this.servicesList];
  }

  async search(query: string): Promise<Service[]> {
    const queryLower = query.toLowerCase();
    return this.servicesList.filter(service =>
      service.title.toLowerCase().includes(queryLower) ||
      service.description.toLowerCase().includes(queryLower)
    );
  }

  async delete(id: string): Promise<void> {
    this.servicesList = this.servicesList.filter(s => s.id !== id);
  }
}

