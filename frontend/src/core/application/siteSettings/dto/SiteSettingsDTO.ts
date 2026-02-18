/**
 * Site Settings DTO (Data Transfer Object)
 * 
 * Clean Architecture Layer: Application
 * 
 * Represents the data structure received from the API.
 * This matches the backend API response format exactly.
 * 
 * Plain English: This is the shape of data we receive from the backend API.
 * It's a simple data container with no business logic - just the raw data
 * structure that matches what the API returns.
 */
export interface SiteSettingsDTO {
  id: string;
  contact: {
    phone?: string;
    email?: string;
    address?: string;
    fullAddress?: string;
    whatsappUrl?: string;
    mapEmbedUrl?: string;
  };
  social: {
    links: Array<{
      platform: string;
      url: string;
      icon?: string;
    }>;
  };
  company: {
    name: string;
    description?: string;
    registrationNumber?: string;
  };
  trustIndicators: Array<{
    label: string;
    value: string;
    icon?: string;
  }>;
  certifications: {
    ofstedRegistered: boolean;
    list: string[];
  };
  navigation: {
    links: Array<{
      href: string;
      label: string;
    }>;
    logoPath: string;
  };
  footer: {
    quickLinks: Array<{
      href: string;
      label: string;
    }>;
  };
  support?: {
    emails?: string[];
    whatsappNumbers?: string[];
  };
  packageBenefits: Array<{
    icon: string;
    title: string;
    description: string;
    gradient: string;
  }>;
  copyright: {
    text?: string;
  };
  updatedAt: string;
}

