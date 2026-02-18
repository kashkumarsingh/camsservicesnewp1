import { ItineraryTemplate, TransportSegment, StopSegment, WaitSegment } from '../universal/ItinerarySchema';
import { getSuggestedPickupOptions } from '../shared/pickupUtils';

export type UniversalItineraryData = Record<string, unknown>;

// Type guards
function isTransportSegment(seg: { type: string }): seg is TransportSegment {
  return seg.type === 'transport';
}

function isStopSegment(seg: { type: string }): seg is StopSegment {
  return seg.type === 'stop';
}

function isWaitSegment(seg: { type: string }): seg is WaitSegment {
  return seg.type === 'wait';
}

export class ItineraryService {
  static getAllFieldKeys(template: ItineraryTemplate): string[] {
    const keys = new Set<string>();

    template.segments.forEach(seg => {
      if (seg.type === 'transport') {
        keys.add(seg.pickupFieldKeys.pickupAddress);
        keys.add(seg.pickupFieldKeys.pickupTime);
        keys.add(seg.dropoffFieldKeys.dropoffAddress);
        keys.add(seg.dropoffFieldKeys.dropoffSameAsPickup);
      } else if (seg.type === 'stop') {
        keys.add(seg.addressKey);
        if (seg.startTimeKey) keys.add(seg.startTimeKey);
        if (seg.endTimeKey) keys.add(seg.endTimeKey);
      } else if (seg.type === 'wait') {
        keys.add(seg.durationKey);
      }
    });

    return Array.from(keys);
  }

  static getPickupTimeSuggestions(template: ItineraryTemplate, data: UniversalItineraryData): string[] {
    const transportSegment = template.segments.find(isTransportSegment);
    if (!transportSegment?.pickupSuggestions) return [];

    const { eventTimeKey, fromAddressKey, toAddressKey } = transportSegment.pickupSuggestions;
    const eventTime = data[eventTimeKey];
    const fromAddress = data[fromAddressKey];
    const toAddress = data[toAddressKey];

    if (!eventTime || !fromAddress || !toAddress) return [];
    
    // Type check for string values
    const eventTimeStr = typeof eventTime === 'string' ? eventTime : '';
    const fromAddressStr = typeof fromAddress === 'string' ? fromAddress : '';
    const toAddressStr = typeof toAddress === 'string' ? toAddress : '';
    
    if (!eventTimeStr || !fromAddressStr || !toAddressStr) return [];

    return getSuggestedPickupOptions({
      eventTime: eventTimeStr,
      fromAddress: fromAddressStr,
      toAddress: toAddressStr,
      minStartHHMM: '06:00',
    });
  }

  static getEffectivePickupTime(template: ItineraryTemplate, data: UniversalItineraryData): string | null {
    const transportSegment = template.segments.find(isTransportSegment);
    if (!transportSegment) return null;

    const pickupTimeKey = transportSegment.pickupFieldKeys.pickupTime;
    const pickupTime = data[pickupTimeKey];

    if (pickupTime && typeof pickupTime === 'string') return pickupTime;

    const suggestions = this.getPickupTimeSuggestions(template, data);
    return suggestions[0] || null;
  }

  static getEffectiveStartTime(
    template: ItineraryTemplate,
    data: UniversalItineraryData,
    fallbackTime: string = '09:00'
  ): string {
    const effectivePickup = this.getEffectivePickupTime(template, data);
    if (effectivePickup) return effectivePickup;

    const stopSegment = template.segments.find(isStopSegment);
    if (stopSegment?.startTimeKey) {
      const startTime = data[stopSegment.startTimeKey];
      if (startTime && typeof startTime === 'string') return startTime;
    }

    return fallbackTime;
  }

  static calculateSuggestedDuration(
    template: ItineraryTemplate,
    data: UniversalItineraryData,
    remainingHours: number
  ): number {
    const stopSegment = template.segments.find(isStopSegment);
    const waitSegment = template.segments.find(isWaitSegment);
    const transportSegment = template.segments.find(isTransportSegment);

    let total = 0;

    if (stopSegment?.startTimeKey && stopSegment?.endTimeKey) {
      const startVal = data[stopSegment.startTimeKey];
      const endVal = data[stopSegment.endTimeKey];
      const startStr = typeof startVal === 'string' ? startVal : '';
      const endStr = typeof endVal === 'string' ? endVal : '';
      const start = parseTimeToMinutes(startStr);
      const end = parseTimeToMinutes(endStr);
      if (start > 0 && end > start) {
        total += (end - start) / 60;
      }
    } else if (stopSegment?.startTimeKey && waitSegment?.durationKey) {
      const waitVal = data[waitSegment.durationKey];
      const waitStr = typeof waitVal === 'string' || typeof waitVal === 'number' ? String(waitVal) : '0';
      const waitHours = parseFloat(waitStr);
      total += waitHours + 1;
    } else if (stopSegment?.startTimeKey && template.name === 'exam-support') {
      const examVal = data.examDuration;
      const examStr = typeof examVal === 'string' || typeof examVal === 'number' ? String(examVal) : '0';
      const examDuration = parseFloat(examStr);
      total += examDuration;
    }

    if (transportSegment) {
      const pickupAddressVal = data[transportSegment.pickupFieldKeys.pickupAddress];
      const dropoffAddressVal = data[transportSegment.dropoffFieldKeys.dropoffAddress];
      const dropoffSameAsPickupVal = data[transportSegment.dropoffFieldKeys.dropoffSameAsPickup];
      const pickupTimeVal = data[transportSegment.pickupFieldKeys.pickupTime];
      const stopSegmentDataVal = stopSegment ? data[stopSegment.addressKey] : undefined;
      
      const pickupAddress = typeof pickupAddressVal === 'string' ? pickupAddressVal : '';
      const dropoffAddress = typeof dropoffAddressVal === 'string' ? dropoffAddressVal : '';
      const dropoffSameAsPickup = !!dropoffSameAsPickupVal;
      const pickupTime = typeof pickupTimeVal === 'string' ? pickupTimeVal : '';
      const stopSegmentData = typeof stopSegmentDataVal === 'string' ? stopSegmentDataVal : '';

      const hasDiffTo = pickupAddress && stopSegmentData && pickupAddress.trim().toLowerCase() !== stopSegmentData.trim().toLowerCase();
      if (pickupTime && stopSegment?.startTimeKey) {
        const pMin = parseTimeToMinutes(pickupTime);
        const startTimeVal = data[stopSegment.startTimeKey];
        const startTimeStr = typeof startTimeVal === 'string' ? startTimeVal : '';
        const sMin = parseTimeToMinutes(startTimeStr);
        if (pMin > 0 && sMin > pMin) {
          total += (sMin - pMin) / 60;
        } else {
          total += hasDiffTo ? 2 : 1;
        }
      } else {
        total += hasDiffTo ? 2 : 1;
      }

      const finalDropoff = dropoffSameAsPickup ? pickupAddress : dropoffAddress;
      const hasDiffFrom = stopSegmentData && finalDropoff && stopSegmentData.trim().toLowerCase() !== finalDropoff.trim().toLowerCase();
      if (hasDiffFrom) {
        total += dropoffSameAsPickup ? (hasDiffTo ? 2 : 1) : 1;
      }
    }

    return Math.min(Math.max(0.5, total), Math.max(0.5, remainingHours));
  }

  static validateItinerary(
    template: ItineraryTemplate,
    data: UniversalItineraryData
  ): { valid: boolean; missingFields: string[] } {
    const missing: string[] = [];

    template.segments.forEach(seg => {
      if (seg.type === 'transport') {
        const pickupAddrVal = data[seg.pickupFieldKeys.pickupAddress];
        const pickupAddr = typeof pickupAddrVal === 'string' ? pickupAddrVal : '';
        if (!pickupAddr.trim()) {
          missing.push('Pickup address');
        }
        const pickupTime = data[seg.pickupFieldKeys.pickupTime];
        const effectivePickupTime = this.getEffectivePickupTime(template, data);
        if (!pickupTime && !effectivePickupTime) {
          missing.push('Pickup time');
        }
      } else if (seg.type === 'stop') {
        const addrVal = data[seg.addressKey];
        const addr = typeof addrVal === 'string' ? addrVal : '';
        if (!addr.trim()) {
          missing.push(`${seg.label} address`);
        }
        if (seg.startTimeKey && !data[seg.startTimeKey]) {
          missing.push(`${seg.label} start time`);
        }
        if (seg.endTimeKey && !data[seg.endTimeKey]) {
          missing.push(`${seg.label} end time`);
        }
      }
    });

    return {
      valid: missing.length === 0,
      missingFields: missing,
    };
  }

  static initializeItineraryData(template: ItineraryTemplate): UniversalItineraryData {
    const data: UniversalItineraryData = {};

    template.segments.forEach(seg => {
      if (seg.type === 'transport') {
        data[seg.pickupFieldKeys.pickupAddress] = '';
        data[seg.pickupFieldKeys.pickupTime] = '';
        data[seg.dropoffFieldKeys.dropoffAddress] = '';
        data[seg.dropoffFieldKeys.dropoffSameAsPickup] = false;
      } else if (seg.type === 'stop') {
        data[seg.addressKey] = '';
        if (seg.startTimeKey) data[seg.startTimeKey] = '';
        if (seg.endTimeKey) data[seg.endTimeKey] = '';
      } else if (seg.type === 'wait') {
        data[seg.durationKey] = '0';
      }
    });

    return data;
  }
}

function parseTimeToMinutes(t: string): number {
  if (!t) return 0;
  const [hh, mm] = t.split(':').map(Number);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return 0;
  return hh * 60 + mm;
}
