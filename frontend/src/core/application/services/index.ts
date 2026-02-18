/**
 * Services Application Layer - Barrel Exports
 */

// Use Cases
export { ListServicesUseCase } from './useCases/ListServicesUseCase';
export { GetServiceUseCase } from './useCases/GetServiceUseCase';
export { IncrementViewsUseCase } from './useCases/IncrementViewsUseCase';

// Factories
export { ServiceFactory } from './factories/ServiceFactory';

// DTOs
export type { ServiceDTO } from './dto/ServiceDTO';
export type { CreateServiceDTO } from './dto/CreateServiceDTO';
export type { UpdateServiceDTO } from './dto/UpdateServiceDTO';
export type { ServiceFilterOptions } from './dto/ServiceFilterOptions';
export type { ServiceStatsDTO } from './dto/ServiceStatsDTO';

// Mappers
export { ServiceMapper } from './mappers/ServiceMapper';

// Ports
export type { IServiceRepository } from './ports/IServiceRepository';


