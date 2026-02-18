import { ItineraryTemplate } from './ItinerarySchema';

export const SingleDayTemplate: ItineraryTemplate = {
  name: 'single-day-event',
  segments: [
    {
      id: 'stop-event',
      type: 'stop',
      title: 'Event Information',
      label: 'Event',
      addressKey: 'eventAddress',
      startTimeKey: 'eventStartTime',
      endTimeKey: 'eventEndTime',
    },
    {
      id: 'transport',
      type: 'transport',
      title: 'Transport Details',
      pickupFieldKeys: { pickupAddress: 'pickupAddress', pickupTime: 'pickupTime' },
      pickupSuggestions: { eventTimeKey: 'eventStartTime', fromAddressKey: 'pickupAddress', toAddressKey: 'eventAddress' },
      dropoffFieldKeys: { dropoffAddress: 'dropoffAddress', dropoffSameAsPickup: 'dropoffSameAsPickup' },
    },
  ],
};

export const HospitalTemplate: ItineraryTemplate = {
  name: 'hospital-appointment',
  segments: [
    {
      id: 'stop-hospital',
      type: 'stop',
      title: 'Appointment Information',
      label: 'Hospital',
      addressKey: 'hospitalAddress',
      startTimeKey: 'appointmentTime',
    },
    {
      id: 'wait',
      type: 'wait',
      title: 'Waiting Room',
      durationKey: 'waitingRoomDuration',
      label: 'Waiting Room',
    },
    {
      id: 'transport',
      type: 'transport',
      title: 'Transport Details',
      pickupFieldKeys: { pickupAddress: 'hospitalPickupAddress', pickupTime: 'hospitalPickupTime' },
      pickupSuggestions: { eventTimeKey: 'appointmentTime', fromAddressKey: 'hospitalPickupAddress', toAddressKey: 'hospitalAddress' },
      dropoffFieldKeys: { dropoffAddress: 'hospitalDropoffAddress', dropoffSameAsPickup: 'hospitalDropoffSameAsPickup' },
    },
  ],
};

export const ExamTemplate: ItineraryTemplate = {
  name: 'exam-support',
  segments: [
    {
      id: 'stop-exam',
      type: 'stop',
      title: 'Exam Information',
      label: 'Exam',
      addressKey: 'examVenue',
      startTimeKey: 'examTime',
    },
    {
      id: 'transport',
      type: 'transport',
      title: 'Transport Details',
      pickupFieldKeys: { pickupAddress: 'examPickupAddress', pickupTime: 'examPickupTime' },
      pickupSuggestions: { eventTimeKey: 'examTime', fromAddressKey: 'examPickupAddress', toAddressKey: 'examVenue' },
      dropoffFieldKeys: { dropoffAddress: 'examDropoffAddress', dropoffSameAsPickup: 'examDropoffSameAsPickup' },
    },
  ],
};

export const MultiDayTemplate: ItineraryTemplate = {
  name: 'multi-day-event',
  // Per-day, we reuse the single-day structure
  segments: [
    {
      id: 'stop-event',
      type: 'stop',
      title: 'Event Information',
      label: 'Event',
      addressKey: 'eventAddress',
      startTimeKey: 'eventStartTime',
      endTimeKey: 'eventEndTime',
    },
    {
      id: 'transport',
      type: 'transport',
      title: 'Transport Details',
      pickupFieldKeys: { pickupAddress: 'pickupAddress', pickupTime: 'pickupTime' },
      pickupSuggestions: { eventTimeKey: 'eventStartTime', fromAddressKey: 'pickupAddress', toAddressKey: 'eventAddress' },
      dropoffFieldKeys: { dropoffAddress: 'dropoffAddress', dropoffSameAsPickup: 'dropoffSameAsPickup' },
    },
  ],
};
