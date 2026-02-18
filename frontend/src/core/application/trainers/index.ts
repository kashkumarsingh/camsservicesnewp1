/**
 * Trainers Application Layer - Barrel Exports
 */

// Use Cases
export { ListTrainersUseCase } from './useCases/ListTrainersUseCase';
export { GetTrainerUseCase } from './useCases/GetTrainerUseCase';
export { SearchTrainersUseCase } from './useCases/SearchTrainersUseCase';
export { RankTrainersUseCase } from './useCases/RankTrainersUseCase';
export { MatchTrainersUseCase } from './useCases/MatchTrainersUseCase';
export { GetTrainerStatsUseCase } from './useCases/GetTrainerStatsUseCase';
export { IncrementTrainerViewsUseCase } from './useCases/IncrementTrainerViewsUseCase';

// Factories
export { TrainerFactory } from './factories/TrainerFactory';

// DTOs
export type { TrainerDTO, TrainerImageDTO } from './dto/TrainerDTO';
export type { CreateTrainerDTO } from './dto/CreateTrainerDTO';
export type { UpdateTrainerDTO } from './dto/UpdateTrainerDTO';
export type { TrainerFilterOptions } from './dto/TrainerFilterOptions';
export type { TrainerRankingCriteriaDTO } from './dto/TrainerRankingCriteria';
export type { TrainerRequirementsDTO } from './dto/TrainerRequirements';
export type { TrainerStatsDTO } from './dto/TrainerStatsDTO';

// Mappers
export { TrainerMapper } from './mappers/TrainerMapper';

// Ports
export type { ITrainerRepository } from './ports/ITrainerRepository';
