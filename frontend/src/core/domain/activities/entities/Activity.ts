/**
 * Activity Entity
 * 
 * Domain entity representing an activity with business rules.
 */

import { BaseEntity } from '../../shared/BaseEntity';
import { ActivitySlug } from '../valueObjects/ActivitySlug';
import { ActivityDuration } from '../valueObjects/ActivityDuration';

export interface ActivityTrainer {
  id: number;
  name: string;
  slug?: string;
}

export class Activity extends BaseEntity {
  private _name: string;
  private _slug: ActivitySlug;
  private _description: string;
  private _imageUrl: string;
  private _duration: ActivityDuration;
  private _trainerIds: number[];
  private _trainers?: ActivityTrainer[];
  private _category?: string;
  private _ageRange?: string;
  private _views: number;
  private _published: boolean;

  private constructor(
    id: string,
    name: string,
    slug: ActivitySlug,
    description: string,
    imageUrl: string,
    duration: ActivityDuration,
    trainerIds: number[],
    published: boolean = true,
    category?: string,
    ageRange?: string,
    trainers?: ActivityTrainer[],
    views: number = 0,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
    this._name = name;
    this._slug = slug;
    this._description = description;
    this._imageUrl = imageUrl;
    this._duration = duration;
    this._trainerIds = trainerIds;
    this._trainers = trainers;
    this._category = category;
    this._ageRange = ageRange;
    this._views = views;
    this._published = published;
  }

  static create(
    id: string,
    name: string,
    description: string,
    imageUrl: string,
    durationHours: number,
    trainerIds: number[],
    slug?: ActivitySlug,
    category?: string,
    ageRange?: string,
    trainers?: ActivityTrainer[],
    published: boolean = true
  ): Activity {
    // Business rules validation
    if (!name || name.trim().length === 0) {
      throw new Error('Activity name is required');
    }

    if (name.length > 200) {
      throw new Error('Activity name cannot exceed 200 characters');
    }

    if (!description || description.trim().length === 0) {
      throw new Error('Activity description is required');
    }

    if (description.length > 2000) {
      throw new Error('Activity description cannot exceed 2000 characters');
    }

    // Use default image if not provided (defensive programming)
    if (!imageUrl || imageUrl.trim().length === 0) {
      imageUrl = '/images/activities/default-activity.webp';
    }

    // Note: Activities can exist without trainers (will be auto-assigned during booking)
    // Allow empty trainerIds array - trainer will be assigned based on location/availability
    // This is acceptable for activities that can be done by any trainer

    // Generate slug if not provided
    const activitySlug = slug || ActivitySlug.fromName(name);

    // Create duration value object
    const duration = ActivityDuration.create(durationHours);

    return new Activity(
      id,
      name.trim(),
      activitySlug,
      description.trim(),
      imageUrl.trim(),
      duration,
      trainerIds,
      published,
      category?.trim(),
      ageRange?.trim(),
      trainers,
      0
    );
  }

  get name(): string {
    return this._name;
  }

  get slug(): ActivitySlug {
    return this._slug;
  }

  get description(): string {
    return this._description;
  }

  get imageUrl(): string {
    return this._imageUrl;
  }

  get duration(): ActivityDuration {
    return this._duration;
  }

  get trainerIds(): number[] {
    return [...this._trainerIds];
  }

  get trainers(): ActivityTrainer[] | undefined {
    return this._trainers ? [...this._trainers] : undefined;
  }

  get category(): string | undefined {
    return this._category;
  }

  get ageRange(): string | undefined {
    return this._ageRange;
  }

  get views(): number {
    return this._views;
  }

  get published(): boolean {
    return this._published;
  }

  isPublished(): boolean {
    return this._published;
  }

  incrementViews(): void {
    this._views += 1;
    this.markAsUpdated();
  }

  addTrainer(trainerId: number): void {
    if (!this._trainerIds.includes(trainerId)) {
      this._trainerIds.push(trainerId);
      this.markAsUpdated();
    }
  }

  removeTrainer(trainerId: number): void {
    this._trainerIds = this._trainerIds.filter(id => id !== trainerId);
    this.markAsUpdated();
  }

  updateTrainers(trainers: ActivityTrainer[]): void {
    this._trainers = trainers;
    this.markAsUpdated();
  }

  publish(): void {
    this._published = true;
    this.markAsUpdated();
  }

  unpublish(): void {
    this._published = false;
    this.markAsUpdated();
  }

  validate(): boolean {
    return (
      this._name.trim().length > 0 &&
      this._description.trim().length > 0 &&
      this._imageUrl.trim().length > 0 &&
      this._trainerIds.length > 0
    );
  }
}


