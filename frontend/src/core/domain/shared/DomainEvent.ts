/**
 * Domain Event
 * 
 * Base class for all domain events across all domains.
 * Domain events represent something that happened in the domain.
 */

export abstract class DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventId: string;

  constructor(eventId?: string) {
    this.eventId = eventId || this.generateEventId();
    this.occurredOn = new Date();
  }

  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}


