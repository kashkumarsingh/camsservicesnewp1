/**
 * Itinerary Renderer Component
 * 
 * Single component that uses the Strategy Factory to render the correct
 * itinerary form based on the selected mode. Follows Strategy + Factory pattern.
 */

'use client';

import React, { useEffect } from 'react';
import { getStrategyFactory } from './factory/registerStrategies';
import { IItineraryStrategy, ItineraryRenderProps } from './strategies/IItineraryStrategy';
import { UniversalItineraryData, ItineraryService } from './services/ItineraryService';
import { formatHours } from '@/utils/formatHours';

interface ItineraryRendererProps {
  modeKey: string | null;
  data: UniversalItineraryData;
  onChange: (patch: Partial<UniversalItineraryData>) => void;
  parentAddress?: string;
  remainingHours: number;
  parseTimeToMinutes: (t: string) => number;
  onInitialized?: (data: UniversalItineraryData) => void;
}

const ItineraryRenderer: React.FC<ItineraryRendererProps> = ({
  modeKey,
  data,
  onChange,
  parentAddress,
  remainingHours,
  parseTimeToMinutes,
  onInitialized,
}) => {
  const factory = getStrategyFactory();
  const strategy: IItineraryStrategy | null = modeKey ? factory.get(modeKey) : null;

  // Initialize data when mode changes
  useEffect(() => {
    if (strategy && (!data || Object.keys(data).length === 0)) {
      const initialized = strategy.initializeData(parentAddress);
      onChange(initialized);
      if (onInitialized) {
        onInitialized(initialized);
      }
    }
  }, [modeKey, strategy]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!modeKey || !strategy) {
    return (
      <div className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg border border-gray-200">
        Select a booking mode to see itinerary details
      </div>
    );
  }

  const renderProps: ItineraryRenderProps = {
    parentAddress,
    remainingHours,
    parseTimeToMinutes,
    formatHours,
  };

  return (
    <div>
      {strategy.render(data, onChange, renderProps)}
    </div>
  );
};

export default ItineraryRenderer;

