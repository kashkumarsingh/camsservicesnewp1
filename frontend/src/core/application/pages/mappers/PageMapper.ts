import { Page } from '../../../domain/pages/entities/Page';
import { PageDTO } from '../dto/PageDTO';

export class PageMapper {
  static toDTO(page: Page): PageDTO {
    return {
      id: page.id,
      title: page.title,
      slug: page.slug,
      type: page.type,
      summary: page.summary,
      content: page.content,
      sections: page.sections,
      lastUpdated: page.lastUpdated?.toISOString(),
      effectiveDate: page.effectiveDate?.toISOString(),
      version: page.version,
      views: page.views,
      published: page.published,
      createdAt: page.createdAt?.toISOString(),
      updatedAt: page.updatedAt?.toISOString(),
      mission: page.mission ?? undefined,
      coreValues: page.coreValues ?? undefined,
      coreValuesSectionTitle: page.coreValuesSectionTitle ?? undefined,
      coreValuesSectionSubtitle: page.coreValuesSectionSubtitle ?? undefined,
      safeguarding: page.safeguarding ?? undefined,
    };
  }

  static fromDTO(dto: PageDTO): Page {
    return Page.create({
      id: dto.id,
      title: dto.title,
      slug: dto.slug,
      type: dto.type,
      summary: dto.summary,
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
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    });
  }
}


