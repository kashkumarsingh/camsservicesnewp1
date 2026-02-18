/**
 * Package Entity
 * 
 * Domain entity representing a package with business rules.
 */

import { BaseEntity } from '../../shared/BaseEntity';
import { PackageSlug } from '../valueObjects/PackageSlug';
import { PackageHours } from '../valueObjects/PackageHours';
import { PackagePrice } from '../valueObjects/PackagePrice';
import { PackageDuration } from '../valueObjects/PackageDuration';

export interface PackageActivity {
  id: number;
  name: string;
  slug?: string;
  imageUrl: string;
  duration: number;
  description: string;
  trainerIds?: number[];
  trainers?: PackageTrainerSummary[];
  order?: number;
}

export interface PackageTrainerSummary {
  id: string;
  name: string;
  slug: string;
  avatarUrl?: string;
  role?: string;
  rating?: number | null;
  totalReviews?: number;
  specialties?: string[];
  experienceYears?: number;
  isFeatured?: boolean;
}

export interface PackagePerformanceMetrics {
  activityCount: number;
  trainerCount: number;
  pricePerHour?: number | null;
  spotsRemaining?: number;
  totalSpots: number;
}

export interface PackageTestimonialSummary {
  id: string;
  authorName: string;
  authorRole?: string | null;
  quote: string;
  rating?: number | null;
  sourceLabel?: string | null;
  sourceType?: string | null;
  avatarUrl?: string | null;
}

export interface PackageTrustIndicator {
  label: string;
  value?: string;
  icon?: string;
}

export class Package extends BaseEntity {
  private _name: string;
  private _description: string;
  private _slug: PackageSlug;
  private _hours: PackageHours;
  private _price: PackagePrice;
  private _duration: PackageDuration;
  private _color: string;
  private _features: string[];
  private _activities: PackageActivity[];
  private _perks: string[];
  private _popular: boolean;
  private _spotsRemaining?: number;
  private _views: number;
  private _trainers: PackageTrainerSummary[];
  private _metrics?: PackagePerformanceMetrics;
  private _testimonials?: PackageTestimonialSummary[];
  private _trustIndicators?: PackageTrustIndicator[];

  private constructor(
    id: string,
    name: string,
    description: string,
    slug: PackageSlug,
    hours: PackageHours,
    price: PackagePrice,
    duration: PackageDuration,
    color: string,
    features: string[],
    activities: PackageActivity[],
    perks: string[],
    popular: boolean = false,
    spotsRemaining?: number,
    views: number = 0,
    trainers: PackageTrainerSummary[] = [],
    metrics?: PackagePerformanceMetrics,
    testimonials?: PackageTestimonialSummary[],
    trustIndicators?: PackageTrustIndicator[],
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
    this._name = name;
    this._description = description;
    this._slug = slug;
    this._hours = hours;
    this._price = price;
    this._duration = duration;
    this._color = color;
    this._features = features;
    this._activities = activities;
    this._perks = perks;
    this._popular = popular;
    this._spotsRemaining = spotsRemaining;
    this._views = views;
    this._trainers = trainers;
    this._metrics = metrics;
    this._testimonials = testimonials;
    this._trustIndicators = trustIndicators;
  }

  static create(
    id: string,
    name: string,
    description: string,
    hours: number,
    price: number,
    hoursPerWeek: number,
    totalWeeks: number,
    color: string,
    features: string[],
    activities: PackageActivity[],
    perks: string[],
    slug?: PackageSlug,
    popular: boolean = false,
    spotsRemaining?: number,
    trainers: PackageTrainerSummary[] = [],
    metrics?: PackagePerformanceMetrics,
    testimonials?: PackageTestimonialSummary[],
    trustIndicators?: PackageTrustIndicator[]
  ): Package {
    // Business rules validation
    if (!name || name.trim().length === 0) {
      throw new Error('Package name is required');
    }

    if (name.length > 200) {
      throw new Error('Package name cannot exceed 200 characters');
    }

    if (!description || description.trim().length === 0) {
      throw new Error('Package description is required');
    }

    if (description.length > 2000) {
      throw new Error('Package description cannot exceed 2000 characters');
    }

    // Generate slug if not provided
    const packageSlug = slug || PackageSlug.fromName(name);

    // Create value objects
    const packageHours = PackageHours.create(hours);
    const packagePrice = PackagePrice.create(price);
    const packageDuration = PackageDuration.create(hoursPerWeek, totalWeeks);

    return new Package(
      id,
      name,
      description,
      packageSlug,
      packageHours,
      packagePrice,
      packageDuration,
      color,
      features,
      activities,
      perks,
      popular,
      spotsRemaining,
      0,
      trainers,
      metrics,
      testimonials,
      trustIndicators
    );
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get slug(): PackageSlug {
    return this._slug;
  }

  get hours(): PackageHours {
    return this._hours;
  }

  get price(): PackagePrice {
    return this._price;
  }

  get duration(): PackageDuration {
    return this._duration;
  }

  get color(): string {
    return this._color;
  }

  get features(): string[] {
    return [...this._features];
  }

  get activities(): PackageActivity[] {
    return [...this._activities];
  }

  get perks(): string[] {
    return [...this._perks];
  }

  get trainers(): PackageTrainerSummary[] {
    return [...this._trainers];
  }

  get metrics(): PackagePerformanceMetrics | undefined {
    return this._metrics ? { ...this._metrics } : undefined;
  }

  get testimonials(): PackageTestimonialSummary[] | undefined {
    return this._testimonials ? this._testimonials.map((testimonial) => ({ ...testimonial })) : undefined;
  }

  get trustIndicators(): PackageTrustIndicator[] | undefined {
    return this._trustIndicators ? this._trustIndicators.map((indicator) => ({ ...indicator })) : undefined;
  }

  get popular(): boolean {
    return this._popular;
  }

  get spotsRemaining(): number | undefined {
    return this._spotsRemaining;
  }

  get views(): number {
    return this._views;
  }

  isAvailable(): boolean {
    return this._spotsRemaining === undefined || this._spotsRemaining > 0;
  }

  canBeBooked(): boolean {
    return this.isAvailable() && this._hours.value > 0 && this._price.amount > 0;
  }

  calculatePricePerHour(): number {
    return this._price.calculatePerHour(this._hours.value);
  }

  hasSpotsRemaining(): boolean {
    return this._spotsRemaining === undefined || this._spotsRemaining > 0;
  }

  incrementViews(): void {
    this._views += 1;
    this.markAsUpdated();
  }

  updateSpotsRemaining(spots: number): void {
    if (spots < 0) {
      throw new Error('Spots remaining cannot be negative');
    }
    this._spotsRemaining = spots;
    this.markAsUpdated();
  }

  validate(): boolean {
    return (
      this._name.trim().length > 0 &&
      this._description.trim().length > 0 &&
      this._hours.value > 0 &&
      this._price.amount > 0 &&
      this._features.length > 0
    );
  }
}


