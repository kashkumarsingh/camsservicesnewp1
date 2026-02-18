import { IPageRepository } from '@/core/application/pages/ports/IPageRepository';
import { Page } from '@/core/domain/pages/entities/Page';
import { pagesData } from '@/data/pagesData';

export class StaticPageRepository implements IPageRepository {
  private pages = pagesData.map((page) =>
    Page.create({
      id: page.id,
      title: page.title,
      slug: page.slug,
      type: page.type,
      summary: page.summary,
      content: page.content,
      lastUpdated: page.lastUpdated,
      effectiveDate: page.effectiveDate,
      version: page.version,
      views: page.views ?? 0,
      published: page.published ?? true,
    }),
  );

  async findBySlug(slug: string): Promise<Page | null> {
    return this.pages.find((page) => page.slug === slug) ?? null;
  }

  async findAll(): Promise<Page[]> {
    return [...this.pages];
  }
}


