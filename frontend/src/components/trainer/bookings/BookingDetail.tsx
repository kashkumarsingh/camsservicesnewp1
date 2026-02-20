'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { TrainerBooking, TrainerSchedule } from '@/core/application/trainer/types';
import { Calendar, Users, Package, AlertCircle, CheckCircle, Clock, Plus, MapPin } from 'lucide-react';
import ScheduleStatusUpdate from './ScheduleStatusUpdate';
import AttendanceModal from '../schedules/AttendanceModal';
import NotesSection from '../schedules/NotesSection';
import ParticipantCard from './ParticipantCard';
import SessionActivityPlanner from '../activities/SessionActivityPlanner';
import Button from '@/components/ui/Button';

interface BookingDetailProps {
  booking: TrainerBooking;
}

export default function BookingDetail({ booking }: BookingDetailProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'scheduled':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'no_show':
        return 'bg-orange-100 text-orange-800';
      case 'rescheduled':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-5 w-5" />;
      case 'cancelled':
      case 'no_show':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Booking Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking</h1>
            <p className="text-gray-600">Reference: {booking.reference}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(booking.status)}`}>
            {booking.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="flex items-center gap-3 text-gray-600">
            <Package className="h-5 w-5 text-primary-blue" />
            <span>Reference: {booking.reference}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <Users className="h-5 w-5 text-primary-blue" />
            <span>Parent: {booking.parent.name}</span>
          </div>
        </div>
        {(booking.parent?.address || booking.parent?.postcode) && (
          <div className="flex items-start gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <MapPin className="h-5 w-5 text-primary-blue flex-shrink-0 mt-0.5" aria-hidden />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Pickup / session address</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {[booking.parent.address, booking.parent.postcode, booking.parent.county].filter(Boolean).join(', ')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Participants */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Participants</h2>
        <div className="space-y-6">
          {booking.participants.map((participant) => (
            <ParticipantCard
              key={participant.id}
              participant={participant}
              bookingId={booking.id}
            />
          ))}
        </div>
      </div>

      {/* Schedules */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Schedules</h2>
          {/* Note: Session booking will be handled via modal in unified dashboard */}
        </div>
        <div className="space-y-4">
          {booking.schedules.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No schedules assigned</p>
              <p className="text-sm text-gray-500">Session booking will be available soon</p>
            </div>
          ) : (
            booking.schedules.map((schedule) => (
              <ScheduleItem key={schedule.id} schedule={schedule} bookingId={booking.id} participants={booking.participants} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

interface ScheduleItemProps {
  schedule: TrainerSchedule;
  bookingId: number;
  participants: TrainerBooking['participants'];
}

function ScheduleItem({ schedule, bookingId, participants }: ScheduleItemProps) {
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no_show':
        return 'bg-orange-100 text-orange-800';
      case 'rescheduled':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary-blue" />
          <div>
            <p className="font-semibold text-gray-900">
              {new Date(schedule.date).toLocaleDateString('en-GB', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="text-sm text-gray-600">
              {schedule.start_time} - {schedule.end_time}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(schedule.status)}`}>
          {schedule.status}
        </span>
      </div>

      {schedule.activities.length > 0 && (
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-700 mb-1">Activities:</p>
          <div className="flex flex-wrap gap-2">
            {schedule.activities.map((activity) => (
              <span
                key={activity.id}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
              >
                {activity.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Activity Planning Section */}
      <div className="mb-4">
        <SessionActivityPlanner
          scheduleId={schedule.id}
          onActivityConfirmed={() => {
            // Refresh page to show updated activities
            window.location.reload();
          }}
        />
      </div>

      <div className="space-y-3">
        <ScheduleStatusUpdate schedule={schedule} bookingId={bookingId} />
        
        {/* Attendance Button */}
        {schedule.status !== 'cancelled' && (
          <button
            onClick={() => setShowAttendanceModal(true)}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Mark Attendance
          </button>
        )}

        {/* Notes Section */}
        <NotesSection scheduleId={schedule.id} />
      </div>

      {/* Attendance Modal */}
      <AttendanceModal
        schedule={schedule}
        participants={participants}
        isOpen={showAttendanceModal}
        onClose={() => setShowAttendanceModal(false)}
        onSuccess={() => {
          // Refresh page to show updated attendance
          window.location.reload();
        }}
      />
    </div>
  );
}

// Export for use in other components
export { ScheduleItem };


