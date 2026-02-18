/**
 * Base Entity
 * 
 * Base class for all domain entities across all domains.
 * Provides common functionality like ID, equality checks, and timestamps.
 */

export abstract class BaseEntity {
  protected readonly _id: string;
  protected readonly _createdAt: Date;
  protected _updatedAt: Date;

  constructor(id: string, createdAt?: Date, updatedAt?: Date) {
    this._id = id;
    this._createdAt = createdAt || new Date();
    this._updatedAt = updatedAt || new Date();
  }

  get id(): string {
    return this._id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  protected markAsUpdated(): void {
    this._updatedAt = new Date();
  }

  equals(other: BaseEntity): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    return this._id === other._id;
  }
}


