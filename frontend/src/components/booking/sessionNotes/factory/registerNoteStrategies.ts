/**
 * Session Note Strategy Registration
 * 
 * Registers all session note strategies with the factory.
 */

import { SessionNoteStrategyFactory } from './SessionNoteStrategyFactory';
import { SingleDayEventNoteStrategy } from '../strategies/SingleDayEventNoteStrategy';
import { SchoolRunNoteStrategy } from '../strategies/SchoolRunNoteStrategy';
import { HospitalAppointmentNoteStrategy } from '../strategies/HospitalAppointmentNoteStrategy';
import { ExamSupportNoteStrategy } from '../strategies/ExamSupportNoteStrategy';

/**
 * Register all strategies with the factory
 */
export function registerAllNoteStrategies(): void {
  const factory = SessionNoteStrategyFactory.getInstance();
  
  factory.registerAll([
    new SingleDayEventNoteStrategy(),
    new SchoolRunNoteStrategy(),
    new HospitalAppointmentNoteStrategy(),
    new ExamSupportNoteStrategy(),
  ]);
}

/**
 * Get factory instance (with strategies registered)
 */
export function getNoteStrategyFactory(): SessionNoteStrategyFactory {
  const factory = SessionNoteStrategyFactory.getInstance();
  
  // Auto-register if not already done
  if (factory.getAll().length === 0) {
    registerAllNoteStrategies();
  }
  
  return factory;
}



