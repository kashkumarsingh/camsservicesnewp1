/**
 * Session Note Strategy Factory
 * 
 * Singleton factory for creating and retrieving session note strategies.
 * Follows the Factory pattern for centralized strategy management.
 */

import { ISessionNoteStrategy } from '../strategies/ISessionNoteStrategy';

export class SessionNoteStrategyFactory {
  private static instance: SessionNoteStrategyFactory;
  private strategies: Map<string, ISessionNoteStrategy> = new Map();
  
  private constructor() {}
  
  /**
   * Get singleton instance
   */
  static getInstance(): SessionNoteStrategyFactory {
    if (!SessionNoteStrategyFactory.instance) {
      SessionNoteStrategyFactory.instance = new SessionNoteStrategyFactory();
    }
    return SessionNoteStrategyFactory.instance;
  }
  
  /**
   * Register a strategy
   */
  register(strategy: ISessionNoteStrategy): void {
    this.strategies.set(strategy.modeKey, strategy);
  }
  
  /**
   * Register multiple strategies
   */
  registerAll(strategies: ISessionNoteStrategy[]): void {
    strategies.forEach(strategy => this.register(strategy));
  }
  
  /**
   * Get strategy by mode key
   */
  get(modeKey: string): ISessionNoteStrategy | null {
    return this.strategies.get(modeKey) || null;
  }
  
  /**
   * Get all registered strategies
   */
  getAll(): ISessionNoteStrategy[] {
    return Array.from(this.strategies.values());
  }
  
  /**
   * Check if a strategy exists for a mode
   */
  has(modeKey: string): boolean {
    return this.strategies.has(modeKey);
  }
}



