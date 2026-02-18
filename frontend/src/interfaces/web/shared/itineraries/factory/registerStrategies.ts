/**
 * Strategy Registration
 * 
 * Registers all itinerary strategies with the factory.
 * This is the single point of registration.
 */

import { ItineraryStrategyFactory } from './ItineraryStrategyFactory';
import { SingleDayEventStrategy } from '../strategies/SingleDayEventStrategy';
import { HospitalAppointmentStrategy } from '../strategies/HospitalAppointmentStrategy';
import { ExamSupportStrategy } from '../strategies/ExamSupportStrategy';
import { SchoolRunStrategy } from '../strategies/SchoolRunStrategy';
import { MultiDayEventStrategy } from '../strategies/MultiDayEventStrategy';

/**
 * Register all strategies with the factory
 * Call this once during app initialization
 */
export function registerAllStrategies(): void {
  const factory = ItineraryStrategyFactory.getInstance();
  
  factory.registerAll([
    new SingleDayEventStrategy(),
    new HospitalAppointmentStrategy(),
    new ExamSupportStrategy(),
    new SchoolRunStrategy(),
    new MultiDayEventStrategy(),
  ]);
}

/**
 * Get factory instance (with strategies registered)
 */
export function getStrategyFactory(): ItineraryStrategyFactory {
  const factory = ItineraryStrategyFactory.getInstance();
  
  // Auto-register if not already done
  if (factory.getAll().length === 0) {
    registerAllStrategies();
  }
  
  return factory;
}

