/**
 * Trainer Entity
 *
 * Domain entity representing a trainer with expertise, capabilities, and availability.
 */

import { BaseEntity } from '../../shared/BaseEntity';
import { TrainerSlug } from '../valueObjects/TrainerSlug';
import { TrainerRating } from '../valueObjects/TrainerRating';
import { TrainerCapability } from '../valueObjects/TrainerCapability';

export interface TrainerImage {
  src: string;
  alt: string;
}

export class Trainer extends BaseEntity {
  private _name: string;
  private _slug: TrainerSlug;
  private _role: string;
  private _summary: string;
  private _description?: string;
  private _rating: TrainerRating;
  private _certifications: string[];
  private _specialties: string[];
  private _capabilities: TrainerCapability[];
  private _image: TrainerImage;
  private _available: boolean;
  private _experienceYears?: number;
  private _views: number;

  private constructor(
    id: string,
    name: string,
    slug: TrainerSlug,
    role: string,
    summary: string,
    rating: TrainerRating,
    image: TrainerImage,
    certifications: string[],
    specialties: string[],
    capabilities: TrainerCapability[],
    description?: string,
    available: boolean = true,
    experienceYears?: number,
    views: number = 0,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
    this._name = name;
    this._slug = slug;
    this._role = role;
    this._summary = summary;
    this._description = description;
    this._rating = rating;
    this._image = image;
    this._certifications = certifications;
    this._specialties = specialties;
    this._capabilities = capabilities;
    this._available = available;
    this._experienceYears = experienceYears;
    this._views = views;
  }

  static create(
    id: string,
    name: string,
    role: string,
    summary: string,
    rating: number,
    image: TrainerImage,
    options?: {
      slug?: TrainerSlug;
      description?: string;
      certifications?: string[];
      specialties?: string[];
      capabilities?: string[];
      available?: boolean;
      experienceYears?: number;
      views?: number;
      createdAt?: Date;
      updatedAt?: Date;
    }
  ): Trainer {
    if (!name || name.trim().length === 0) {
      throw new Error('Trainer name is required');
    }

    if (!role || role.trim().length === 0) {
      throw new Error('Trainer role is required');
    }

    if (!summary || summary.trim().length === 0) {
      throw new Error('Trainer summary is required');
    }

    if (!image || !image.src) {
      throw new Error('Trainer image is required');
    }

    const slug = options?.slug || TrainerSlug.fromName(name);
    const trainerRating = TrainerRating.create(rating);

    const capabilities = (options?.capabilities ?? []).map(TrainerCapability.create);

    return new Trainer(
      id,
      name.trim(),
      slug,
      role.trim(),
      summary.trim(),
      trainerRating,
      image,
      options?.certifications ?? [],
      options?.specialties ?? [],
      capabilities,
      options?.description ?? summary.trim(),
      options?.available ?? true,
      options?.experienceYears,
      options?.views ?? 0,
      options?.createdAt,
      options?.updatedAt
    );
  }

  get name(): string {
    return this._name;
  }

  get slug(): TrainerSlug {
    return this._slug;
  }

  get role(): string {
    return this._role;
  }

  get summary(): string {
    return this._summary;
  }

  get description(): string | undefined {
    return this._description;
  }

  get rating(): TrainerRating {
    return this._rating;
  }

  get ratingValue(): number {
    return this._rating.value;
  }

  get image(): TrainerImage {
    return { ...this._image };
  }

  get certifications(): string[] {
    return [...this._certifications];
  }

  get specialties(): string[] {
    return [...this._specialties];
  }

  get capabilities(): string[] {
    return this._capabilities.map(capability => capability.value);
  }

  get available(): boolean {
    return this._available;
  }

  get experienceYears(): number | undefined {
    return this._experienceYears;
  }

  get views(): number {
    return this._views;
  }

  incrementViews(): void {
    this._views += 1;
    this.markAsUpdated();
  }

  updateAvailability(available: boolean): void {
    this._available = available;
    this.markAsUpdated();
  }

  updateRating(rating: number): void {
    this._rating = TrainerRating.create(rating);
    this.markAsUpdated();
  }

  updateCapabilities(capabilities: string[]): void {
    this._capabilities = capabilities.map(TrainerCapability.create);
    this.markAsUpdated();
  }

  addCertification(certification: string): void {
    if (!this._certifications.includes(certification)) {
      this._certifications.push(certification);
      this.markAsUpdated();
    }
  }

  addSpecialty(specialty: string): void {
    if (!this._specialties.includes(specialty)) {
      this._specialties.push(specialty);
      this.markAsUpdated();
    }
  }

  validate(): boolean {
    return (
      this._name.trim().length > 0 &&
      this._role.trim().length > 0 &&
      this._summary.trim().length > 0 &&
      this._rating.value >= 0
    );
  }
}

