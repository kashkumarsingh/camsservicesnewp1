import { PackageMapper } from '../mappers/PackageMapper';
import { IPackageRepository } from '../ports/IPackageRepository';
import { PackageListWithMetaDTO } from '../dto/PackageListWithMetaDTO';

export class ListPackagesWithMetricsUseCase {
  constructor(private readonly packageRepository: IPackageRepository) {}

  async execute(): Promise<PackageListWithMetaDTO> {
    const { packages, metrics } = await this.packageRepository.findAllWithMeta();

    // Get API-specific fields if available
    const apiRepo = this.packageRepository as any;
    const packageDTOs = apiRepo?.getApiSpecificFields
      ? packages.map(pkg => {
          const apiFields = apiRepo.getApiSpecificFields(pkg.id);
          return PackageMapper.toDTO(pkg, apiFields);
        })
      : PackageMapper.toDTOs(packages);

    return {
      packages: packageDTOs,
      metrics,
    };
  }
}


