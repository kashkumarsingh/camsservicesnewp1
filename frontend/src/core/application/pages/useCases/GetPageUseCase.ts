import { PageMapper } from '../mappers/PageMapper';
import { PageDTO } from '../dto/PageDTO';
import { IPageRepository } from '../ports/IPageRepository';

export class GetPageUseCase {
  constructor(private readonly pageRepository: IPageRepository) {}

  async execute(slug: string): Promise<PageDTO | null> {
    const page = await this.pageRepository.findBySlug(slug);

    if (!page) {
      return null;
    }

    return PageMapper.toDTO(page);
  }
}


