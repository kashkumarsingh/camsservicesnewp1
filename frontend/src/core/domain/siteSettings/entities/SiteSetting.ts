import { BaseEntity } from '../../shared/BaseEntity';

/**
 * Social Media Link
 * Represents a single social media platform link
 */
export interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
}

/**
 * Trust Indicator
 * Represents a trust metric displayed in the footer
 */
export interface TrustIndicator {
  label: string;
  value: string;
  icon?: string;
}

/**
 * Navigation Link
 * Represents a navigation menu item
 */
export interface NavigationLink {
  href: string;
  label: string;
}

/**
 * Contact Information
 * Represents contact details for the site
 */
export interface ContactInfo {
  phone?: string;
  email?: string;
  address?: string;
  fullAddress?: string;
  whatsappUrl?: string;
  mapEmbedUrl?: string;
}

/**
 * Company Information
 * Represents company details
 */
export interface CompanyInfo {
  name: string;
  description?: string;
  registrationNumber?: string;
}

/**
 * Certifications
 * Represents certification information
 */
export interface Certifications {
  ofstedRegistered: boolean;
  list: string[];
}

/**
 * Navigation Configuration
 * Represents header navigation settings
 */
export interface NavigationConfig {
  links: NavigationLink[];
  logoPath: string;
}

/**
 * Footer Configuration
 * Represents footer-specific settings
 */
export interface FooterConfig {
  quickLinks: NavigationLink[];
}

/**
 * Copyright Information
 * Represents copyright text
 */
export interface CopyrightInfo {
  text?: string;
}

/**
 * Package Benefit
 * Represents a benefit displayed in the "Why Choose Our Packages" section
 */
export interface PackageBenefit {
  icon: string;
  title: string;
  description: string;
  gradient: string;
}

/**
 * Support Contacts
 * Represents notification recipients for automation
 */
export interface SupportContacts {
  emails: string[];
  whatsappNumbers: string[];
}

/**
 * Site Setting Domain Entity
 * 
 * Clean Architecture Layer: Domain
 * 
 * Represents site-wide settings for Header and Footer components.
 * This is a singleton entity - only one instance should exist.
 * 
 * Plain English: This is the business representation of all site settings.
 * It contains all the data needed for the Footer and Header components,
 * including contact info, social media links, company details, trust indicators,
 * navigation links, and more.
 */
export class SiteSetting extends BaseEntity {
  private constructor(
    id: string,
    private readonly _contact: ContactInfo,
    private readonly _social: { links: SocialLink[] },
    private readonly _company: CompanyInfo,
    private readonly _trustIndicators: TrustIndicator[],
    private readonly _certifications: Certifications,
    private readonly _navigation: NavigationConfig,
    private readonly _footer: FooterConfig,
    private readonly _packageBenefits: PackageBenefit[],
    private readonly _support: SupportContacts,
    private readonly _copyright: CopyrightInfo,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt, updatedAt);
  }

  /**
   * Create a new SiteSetting instance
   * 
   * Plain English: Factory method to create a SiteSetting object with all required data.
   * This ensures the entity is always created in a valid state.
   */
  static create(params: {
    id: string;
    contact: ContactInfo;
    social: { links: SocialLink[] };
    company: CompanyInfo;
    trustIndicators: TrustIndicator[];
    certifications: Certifications;
    navigation: NavigationConfig;
    footer: FooterConfig;
    packageBenefits: PackageBenefit[];
    support: SupportContacts;
    copyright: CopyrightInfo;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  }): SiteSetting {
    const normalizedCreatedAt =
      typeof params.createdAt === 'string' ? new Date(params.createdAt) : params.createdAt;
    const normalizedUpdatedAt =
      typeof params.updatedAt === 'string' ? new Date(params.updatedAt) : params.updatedAt;

    return new SiteSetting(
      params.id,
      params.contact,
      params.social,
      params.company,
      params.trustIndicators,
      params.certifications,
      params.navigation,
      params.footer,
      params.packageBenefits,
      {
        emails: params.support?.emails ?? [],
        whatsappNumbers: params.support?.whatsappNumbers ?? [],
      },
      params.copyright,
      normalizedCreatedAt,
      normalizedUpdatedAt,
    );
  }

  get contact(): ContactInfo {
    return this._contact;
  }

  get social(): { links: SocialLink[] } {
    return this._social;
  }

  get company(): CompanyInfo {
    return this._company;
  }

  get trustIndicators(): TrustIndicator[] {
    return this._trustIndicators;
  }

  get certifications(): Certifications {
    return this._certifications;
  }

  get navigation(): NavigationConfig {
    return this._navigation;
  }

  get footer(): FooterConfig {
    return this._footer;
  }

  get packageBenefits(): PackageBenefit[] {
    return this._packageBenefits;
  }

  get support(): SupportContacts {
    return this._support;
  }

  get copyright(): CopyrightInfo {
    return this._copyright;
  }

  /**
   * Get formatted copyright text with current year
   * 
   * Plain English: Returns the copyright text, replacing {year} placeholder
   * with the current year if present.
   */
  getFormattedCopyright(): string {
    if (this._copyright.text) {
      return this._copyright.text.replace('{year}', new Date().getFullYear().toString());
    }
    return `© ${new Date().getFullYear()} ${this._company.name}. All rights reserved.`;
  }
}

