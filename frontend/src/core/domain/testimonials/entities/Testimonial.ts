/**
 * Testimonial Entity
 *
 * Clean Architecture Layer: Domain
 * Represents a curated testimonial shown on the marketing site.
 */

import { BaseEntity } from '../../shared/BaseEntity';

export interface TestimonialBadge {
  label: string;
  icon?: string;
}

export type TestimonialSourceType = 'manual' | 'google' | 'trustpilot' | 'other';

export class Testimonial extends BaseEntity {
  private constructor(
    id: string,
    createdAt: Date | undefined,
    updatedAt: Date | undefined,
    private readonly _publicId: string,
    private readonly _slug: string,
    private readonly _authorName: string,
    private readonly _authorRole: string | null,
    private readonly _authorAvatarUrl: string | null,
    private readonly _quote: string,
    private readonly _rating: number | null,
    private readonly _sourceType: TestimonialSourceType,
    private readonly _sourceLabel: string | null,
    private readonly _sourceUrl: string | null,
    private readonly _locale: string,
    private readonly _isFeatured: boolean,
    private readonly _badges: TestimonialBadge[],
    private readonly _metadata: Record<string, unknown> | null,
    private readonly _externalReviewId?: string | null
  ) {
    super(id, createdAt, updatedAt);
  }

  /**
   * Factory method with lightweight validation.
   */
  static create(props: {
    id: string;
    publicId: string;
    slug: string;
    authorName: string;
    authorRole?: string | null;
    authorAvatarUrl?: string | null;
    quote: string;
    rating?: number | null;
    sourceType: TestimonialSourceType;
    sourceLabel?: string | null;
    sourceUrl?: string | null;
    locale?: string;
    isFeatured?: boolean;
    badges?: TestimonialBadge[];
    metadata?: Record<string, unknown> | null;
    externalReviewId?: string | null;
    createdAt?: string | Date | null;
    updatedAt?: string | Date | null;
  }): Testimonial {
    if (!props.id) throw new Error('Testimonial id is required');
    if (!props.publicId) throw new Error('publicId is required');
    if (!props.slug) throw new Error('slug is required');
    if (!props.authorName) throw new Error('authorName is required');
    if (!props.quote) throw new Error('quote is required');

    return new Testimonial(
      props.id,
      props.createdAt ? new Date(props.createdAt) : undefined,
      props.updatedAt ? new Date(props.updatedAt) : undefined,
      props.publicId,
      props.slug,
      props.authorName,
      props.authorRole ?? null,
      props.authorAvatarUrl ?? null,
      props.quote,
      typeof props.rating === 'number' ? props.rating : null,
      props.sourceType,
      props.sourceLabel ?? null,
      props.sourceUrl ?? null,
      props.locale ?? 'en-GB',
      props.isFeatured ?? false,
      props.badges ?? [],
      props.metadata ?? null,
      props.externalReviewId ?? null
    );
  }

  get publicId(): string {
    return this._publicId;
  }

  get slug(): string {
    return this._slug;
  }

  get authorName(): string {
    return this._authorName;
  }

  get authorRole(): string | null {
    return this._authorRole;
  }

  get authorAvatarUrl(): string | null {
    return this._authorAvatarUrl;
  }

  get quote(): string {
    return this._quote;
  }

  get rating(): number | null {
    return this._rating;
  }

  get sourceType(): TestimonialSourceType {
    return this._sourceType;
  }

  get sourceLabel(): string | null {
    return this._sourceLabel;
  }

  get sourceUrl(): string | null {
    return this._sourceUrl;
  }

  get locale(): string {
    return this._locale;
  }

  get isFeatured(): boolean {
    return this._isFeatured;
  }

  get badges(): TestimonialBadge[] {
    return [...this._badges];
  }

  get metadata(): Record<string, unknown> | null {
    return this._metadata ? { ...this._metadata } : null;
  }

  get externalReviewId(): string | null | undefined {
    return this._externalReviewId;
  }
}

