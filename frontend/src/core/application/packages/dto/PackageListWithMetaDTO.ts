import { PackageListMetrics } from '../ports/IPackageRepository';
import { PackageDTO } from './PackageDTO';

export interface PackageListWithMetaDTO {
  packages: PackageDTO[];
  metrics?: PackageListMetrics;
}


