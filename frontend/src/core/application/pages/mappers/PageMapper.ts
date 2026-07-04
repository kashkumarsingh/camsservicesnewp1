import { Page } from '../../../domain/pages/entities/Page';
import { PageDTO } from '../dto/PageDTO';

function safeToISOString(date?: Date): string | undefined {
  if (!date || Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

export class PageMapper {
  static toDTO(page: Page): PageDTO {
    return {
      id: page.id,
      title: page.title,
      slug: page.slug,
      type: page.type,
      summary: page.summary,
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      ogImage: page.ogImage,
      content: page.content,
      sections: page.sections,
      lastUpdated: safeToISOString(page.lastUpdated),
      effectiveDate: safeToISOString(page.effectiveDate),
      version: page.version,
      views: page.views,
      published: page.published,
      createdAt: safeToISOString(page.createdAt),
      updatedAt: safeToISOString(page.updatedAt),
      mission: page.mission ?? undefined,
      coreValues: page.coreValues ?? undefined,
      coreValuesSectionTitle: page.coreValuesSectionTitle ?? undefined,
      coreValuesSectionSubtitle: page.coreValuesSectionSubtitle ?? undefined,
      safeguarding: page.safeguarding ?? undefined,
      structuredContent: page.structuredContent ?? undefined,
    };
  }

  static fromDTO(dto: PageDTO): Page {
    return Page.create({
      id: dto.id,
      title: dto.title,
      slug: dto.slug,
      type: dto.type,
      summary: dto.summary,
      metaTitle: dto.metaTitle,
      metaDescription: dto.metaDescription,
      ogImage: dto.ogImage,
      content: dto.content,
      sections: dto.sections,
      lastUpdated: dto.lastUpdated,
      effectiveDate: dto.effectiveDate,
      version: dto.version,
      views: dto.views,
      published: dto.published,
      mission: dto.mission,
      coreValues: dto.coreValues,
      coreValuesSectionTitle: dto.coreValuesSectionTitle,
      coreValuesSectionSubtitle: dto.coreValuesSectionSubtitle,
      safeguarding: dto.safeguarding,
      structuredContent: dto.structuredContent,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    });
  }
}


