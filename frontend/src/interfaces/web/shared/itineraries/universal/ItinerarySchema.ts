export type SegmentType = 'transport' | 'stop' | 'wait';

export interface SegmentBase {
  id: string;
  type: SegmentType;
  title?: string;
}

export interface TransportSegment extends SegmentBase {
  type: 'transport';
  pickupFieldKeys: {
    pickupAddress: string;
    pickupTime: string;
  };
  pickupSuggestions?: {
    eventTimeKey: string; // key in data for destination time
    fromAddressKey: string;
    toAddressKey: string;
  };
  dropoffFieldKeys: {
    dropoffAddress: string;
    dropoffSameAsPickup: string;
  };
}

export interface StopSegment extends SegmentBase {
  type: 'stop';
  label: string; // e.g., 'Event', 'Hospital', 'Exam'
  addressKey: string;
  startTimeKey?: string;
  endTimeKey?: string;
}

export interface WaitSegment extends SegmentBase {
  type: 'wait';
  durationKey: string; // e.g., waitingRoomDuration
  label?: string;
}

export type Segment = TransportSegment | StopSegment | WaitSegment;

export interface ItineraryTemplate {
  name: string;
  segments: Segment[];
}

export type ItineraryDataRecord = Record<string, any>;

