/**
 * Trainer Capability Value Object
 *
 * Represents a capability or service a trainer can provide.
 */

import { ValueObject } from '../../shared/ValueObject';

const ALLOWED_CAPABILITIES = [
  'travel_escort',
  'school_run',
  'respite',
  'therapy_companion',
  'exam_support',
  'hospital_support',
  'escort',
  'mentoring',
  'outdoor_support',
  'creative_support',
  'sequential_learning'
] as const;

type Capability = (typeof ALLOWED_CAPABILITIES)[number];

export class TrainerCapability extends ValueObject {
  private readonly _value: Capability;

  private constructor(value: Capability) {
    super();
    this._value = value;
  }

  get value(): Capability {
    return this._value;
  }

  static allowed(): Capability[] {
    return [...ALLOWED_CAPABILITIES];
  }

  static create(value: string): TrainerCapability {
    if (!value || value.trim().length === 0) {
      throw new Error('Trainer capability cannot be empty');
    }

    const normalized = value.trim().toLowerCase() as Capability;

    if (!ALLOWED_CAPABILITIES.includes(normalized)) {
      throw new Error(`Capability "${value}" is not supported`);
    }

    return new TrainerCapability(normalized);
  }

  protected valueEquals(other: ValueObject): boolean {
    if (!(other instanceof TrainerCapability)) {
      return false;
    }
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}

