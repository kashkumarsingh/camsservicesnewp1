/**
 * Itinerary Strategy Factory
 * 
 * Singleton factory that manages all itinerary strategies.
 * Follows Factory Pattern for creating the correct strategy based on mode key.
 */

import { IItineraryStrategy, ModeMetadata } from '../strategies/IItineraryStrategy';

export class ItineraryStrategyFactory {
  private static instance: ItineraryStrategyFactory;
  private strategies: Map<string, IItineraryStrategy> = new Map();
  
  private constructor() {
    // Private constructor for singleton
  }
  
  static getInstance(): ItineraryStrategyFactory {
    if (!ItineraryStrategyFactory.instance) {
      ItineraryStrategyFactory.instance = new ItineraryStrategyFactory();
    }
    return ItineraryStrategyFactory.instance;
  }
  
  /**
   * Register a strategy
   */
  register(strategy: IItineraryStrategy): void {
    this.strategies.set(strategy.key, strategy);
  }
  
  /**
   * Register multiple strategies
   */
  registerAll(strategies: IItineraryStrategy[]): void {
    strategies.forEach(strategy => this.register(strategy));
  }
  
  /**
   * Get strategy by key
   */
  get(key: string): IItineraryStrategy | null {
    return this.strategies.get(key) || null;
  }
  
  /**
   * Check if strategy exists
   */
  has(key: string): boolean {
    return this.strategies.has(key);
  }
  
  /**
   * Get all registered strategies
   */
  getAll(): IItineraryStrategy[] {
    return Array.from(this.strategies.values());
  }
  
  /**
   * Get all strategy keys
   */
  getKeys(): string[] {
    return Array.from(this.strategies.keys());
  }
  
  /**
   * Clear all strategies (useful for testing)
   */
  clear(): void {
    this.strategies.clear();
  }
  
  /**
   * Get all mode metadata for UI display
   */
  getAllMetadata(): Array<ModeMetadata & { key: string }> {
    return this.getAll().map(strategy => ({
      key: strategy.key,
      ...strategy.getMetadata(),
    }));
  }
  
  /**
   * Get mode metadata by key
   */
  getMetadata(key: string): (ModeMetadata & { key: string }) | null {
    const strategy = this.get(key);
    if (!strategy) return null;
    return {
      key: strategy.key,
      ...strategy.getMetadata(),
    };
  }
}

