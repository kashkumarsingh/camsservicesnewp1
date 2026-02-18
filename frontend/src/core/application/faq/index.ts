/**
 * FAQ Application Layer - Barrel Exports
 */

// Use Cases
export { CreateFAQItemUseCase } from './useCases/CreateFAQItemUseCase';
export { ListFAQItemsUseCase } from './useCases/ListFAQItemsUseCase';
export { GetFAQItemUseCase } from './useCases/GetFAQItemUseCase';
export { IncrementViewsUseCase } from './useCases/IncrementViewsUseCase';
export { GetFAQStatsUseCase } from './useCases/GetFAQStatsUseCase';

// Factories
export { FAQItemFactory } from './factories/FAQItemFactory';

// DTOs
export type { FAQItemDTO } from './dto/FAQItemDTO';
export type { CreateFAQItemDTO } from './dto/CreateFAQItemDTO';
export type { UpdateFAQItemDTO } from './dto/UpdateFAQItemDTO';
export type { FAQFilterOptions } from './dto/FAQFilterOptions';
export type { FAQStatsDTO } from './dto/FAQStatsDTO';

// Mappers
export { FAQMapper } from './mappers/FAQMapper';

// Ports
export type { IFAQRepository } from './ports/IFAQRepository';
export type { IIdGenerator } from './ports/IIdGenerator';


