'use client';

import React from 'react';
import { SessionPreviewProps } from '@/interfaces/web/shared/itineraries/strategies/IItineraryStrategy';
import { UniversalItineraryData } from '@/interfaces/web/shared/itineraries/services/ItineraryService';
import { getStrategyFactory } from '@/interfaces/web/shared/itineraries/factory/registerStrategies';

interface SessionPreviewComponentProps extends SessionPreviewProps {
  selectedPresetKey: string | null;
  itineraryData: UniversalItineraryData;
}

const SessionPreview: React.FC<SessionPreviewComponentProps> = ({
  selectedPresetKey,
  itineraryData,
  ...props
}) => {
  if (!selectedPresetKey) {
    return (
      <div className="text-xs text-gray-500 italic">Select a booking mode to see session preview</div>
    );
  }
  
  const factory = getStrategyFactory();
  const strategy = factory.get(selectedPresetKey);
  
  if (!strategy) {
    return (
      <div className="text-xs text-gray-500 italic">Preview not available for this mode</div>
    );
  }
  
  // Use strategy's renderPreview if available, otherwise fall back to default
  if (strategy.renderPreview) {
    return <>{strategy.renderPreview(itineraryData, props)}</>;
  }
  
  // Fallback to base implementation (shouldn't happen if all strategies implement renderPreview)
  return (
    <div className="text-xs text-gray-500 italic">Preview rendering not implemented for this mode</div>
  );
};

export default SessionPreview;

