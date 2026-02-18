/**
 * Address Entity
 * 
 * Domain entity representing a UK address with business rules.
 * 
 * Clean Architecture Layer: Domain (Entity)
 * Purpose: Encapsulates address data and validation logic
 */

export class Address {
  private constructor(
    private readonly _fullAddress: string,
    private readonly _line1: string,
    private readonly _postcode: string,
    private readonly _region: string,
    private readonly _line2?: string,
    private readonly _town?: string,
    private readonly _city?: string,
    private readonly _county?: string,
    private readonly _latitude?: number,
    private readonly _longitude?: number
  ) {
    this.validate();
  }

  /**
   * Create Address from API response
   */
  static create(
    fullAddress: string,
    line1: string,
    postcode: string,
    region: string,
    line2?: string,
    town?: string,
    city?: string,
    county?: string,
    latitude?: number,
    longitude?: number
  ): Address {
    return new Address(
      fullAddress,
      line1,
      postcode,
      region,
      line2,
      town,
      city,
      county,
      latitude,
      longitude
    );
  }

  /**
   * Create Address from manual entry
   */
  static createManual(
    fullAddress: string,
    postcode: string,
    region: string
  ): Address {
    return new Address(
      fullAddress,
      fullAddress, // Use full address as line1 for manual entries
      postcode,
      region
    );
  }

  private validate(): void {
    if (!this._fullAddress || this._fullAddress.trim().length === 0) {
      throw new Error('Address fullAddress is required');
    }

    if (!this._line1 || this._line1.trim().length === 0) {
      throw new Error('Address line1 is required');
    }

    if (!this._postcode || this._postcode.trim().length === 0) {
      throw new Error('Address postcode is required');
    }

    if (!this._region || this._region.trim().length === 0) {
      throw new Error('Address region is required');
    }
  }

  get fullAddress(): string {
    return this._fullAddress;
  }

  get line1(): string {
    return this._line1;
  }

  get line2(): string | undefined {
    return this._line2;
  }

  get town(): string | undefined {
    return this._town;
  }

  get city(): string | undefined {
    return this._city;
  }

  get county(): string | undefined {
    return this._county;
  }

  get region(): string {
    return this._region;
  }

  get postcode(): string {
    return this._postcode;
  }

  get latitude(): number | undefined {
    return this._latitude;
  }

  get longitude(): number | undefined {
    return this._longitude;
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON(): {
    fullAddress: string;
    line1: string;
    line2?: string;
    town?: string;
    city?: string;
    county?: string;
    region: string;
    postcode: string;
    latitude?: number;
    longitude?: number;
  } {
    return {
      fullAddress: this._fullAddress,
      line1: this._line1,
      line2: this._line2,
      town: this._town,
      city: this._city,
      county: this._county,
      region: this._region,
      postcode: this._postcode,
      latitude: this._latitude,
      longitude: this._longitude,
    };
  }
}

