import { SiteSetting } from '@/core/domain/siteSettings/entities/SiteSetting';
import { SiteSettingsDTO } from '../dto/SiteSettingsDTO';

/**
 * Site Settings Mapper
 * 
 * Clean Architecture Layer: Application
 * 
 * Converts between Domain Entity (SiteSetting) and DTO (SiteSettingsDTO).
 * This keeps the domain layer isolated from API-specific data structures.
 * 
 * Plain English: This is a translator between two languages:
 * - DTO: The format the API speaks (simple data)
 * - Domain Entity: The format our business logic understands (rich objects)
 * 
 * It converts API data into domain entities and vice versa.
 */
export class SiteSettingsMapper {
  /**
   * Convert DTO to Domain Entity
   * 
   * Plain English: Takes the raw API response and converts it into
   * a rich domain object that our business logic can work with.
   */
  static toDomain(dto: SiteSettingsDTO): SiteSetting {
    return SiteSetting.create({
      id: dto.id,
      contact: {
        phone: dto.contact.phone,
        email: dto.contact.email,
        address: dto.contact.address,
        fullAddress: dto.contact.fullAddress,
        whatsappUrl: dto.contact.whatsappUrl,
        mapEmbedUrl: dto.contact.mapEmbedUrl,
      },
      social: {
        links: dto.social.links || [],
      },
      company: {
        name: dto.company.name,
        description: dto.company.description,
        registrationNumber: dto.company.registrationNumber,
      },
      trustIndicators: dto.trustIndicators || [],
      certifications: {
        ofstedRegistered: dto.certifications.ofstedRegistered ?? false,
        list: dto.certifications.list || [],
      },
      navigation: {
        links: dto.navigation.links || [],
        logoPath: dto.navigation.logoPath,
      },
      footer: {
        quickLinks: dto.footer.quickLinks || [],
      },
      packageBenefits: dto.packageBenefits || [],
      support: {
        emails: dto.support?.emails ?? [],
        whatsappNumbers: dto.support?.whatsappNumbers ?? [],
      },
      copyright: {
        text: dto.copyright.text,
      },
      updatedAt: dto.updatedAt,
    });
  }

  /**
   * Convert Domain Entity to DTO
   * 
   * Plain English: Takes a domain entity and converts it back to
   * the simple data format the API expects (if we ever need to send data back).
   */
  static toDTO(entity: SiteSetting): SiteSettingsDTO {
    return {
      id: entity.id,
      contact: {
        phone: entity.contact.phone,
        email: entity.contact.email,
        address: entity.contact.address,
        fullAddress: entity.contact.fullAddress,
        whatsappUrl: entity.contact.whatsappUrl,
        mapEmbedUrl: entity.contact.mapEmbedUrl,
      },
      social: {
        links: entity.social.links,
      },
      company: {
        name: entity.company.name,
        description: entity.company.description,
        registrationNumber: entity.company.registrationNumber,
      },
      trustIndicators: entity.trustIndicators,
      certifications: {
        ofstedRegistered: entity.certifications.ofstedRegistered,
        list: entity.certifications.list,
      },
      navigation: {
        links: entity.navigation.links,
        logoPath: entity.navigation.logoPath,
      },
      footer: {
        quickLinks: entity.footer.quickLinks,
      },
      packageBenefits: entity.packageBenefits,
      support: {
        emails: entity.support.emails,
        whatsappNumbers: entity.support.whatsappNumbers,
      },
      copyright: {
        text: entity.copyright.text,
      },
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}

