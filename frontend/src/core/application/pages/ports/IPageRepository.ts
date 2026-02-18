import { Page } from '../../../domain/pages/entities/Page';

export interface IPageRepository {
  findBySlug(slug: string): Promise<Page | null>;
  findAll(): Promise<Page[]>;
}


