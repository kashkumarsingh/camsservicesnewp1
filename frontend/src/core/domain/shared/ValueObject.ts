/**
 * Value Object
 * 
 * Base class for all value objects across all domains.
 * Value objects are immutable and compared by value, not identity.
 */

export abstract class ValueObject {
  equals(other: ValueObject): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    if (this.constructor !== other.constructor) {
      return false;
    }
    return this.valueEquals(other);
  }

  protected abstract valueEquals(other: ValueObject): boolean;
}


