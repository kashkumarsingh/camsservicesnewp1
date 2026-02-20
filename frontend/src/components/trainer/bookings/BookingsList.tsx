'use client';

import React from 'react';
import Link from 'next/link';
import type { TrainerBooking } from '@/core/application/trainer/types';
import { Calendar, Users, Package, ArrowRight, Plus, Clock, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { getTrainerChildDisplayName } from '@/utils/trainerPrivacy';
import { EMPTY_STATE } from '@/utils/emptyStateConstants';

interface BookingsListProps {
  bookings: TrainerBooking[];
  onBookingClick?: (bookingId: number) => void;
}

export default function BookingsList({ bookings, onBookingClick }: BookingsListProps) {
  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Children Assigned</h3>
        <p className="text-gray-600">You don't have any children assigned to work with at the moment.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Calculate if booking needs sessions
  const needsSessions = (booking: TrainerBooking): { needs: boolean; reason: string; priority: 'high' | 'medium' | 'low' } => {
    const sessionCount = booking.schedules?.length || 0;
    
    if (sessionCount === 0) {
      return { 
        needs: true, 
        reason: `${EMPTY_STATE.NO_SESSIONS_BOOKED_YET.title} - Book first session`,
        priority: 'high' 
      };
    }
    
    return { needs: false, reason: '', priority: 'low' };
  };

  // Get next session date/time
  const getNextSession = (booking: TrainerBooking) => {
    if (!booking.schedules || booking.schedules.length === 0) return null;
    
    const upcomingSessions = booking.schedules
      .filter(s => new Date(`${s.date}T${s.start_time}`) >= new Date())
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.start_time}`);
        const dateB = new Date(`${b.date}T${b.start_time}`);
        return dateA.getTime() - dateB.getTime();
      });
    
    return upcomingSessions.length > 0 ? upcomingSessions[0] : null;
  };

  // Format child names (privacy-safe). Trainers never see full legal names.
  const formatChildNames = (participants: TrainerBooking['participants']) => {
    if (participants.length === 0) return 'No children';

    const masked = participants.map((p) => getTrainerChildDisplayName(p.name));

    if (masked.length === 1) return masked[0];
    if (masked.length === 2) return `${masked[0]} & ${masked[1]}`;
    return `${masked[0]} & ${masked.length - 1} more`;
  };

  return (
    <div className="space-y-4">
      {bookings.map((booking) => {
        const sessionInfo = needsSessions(booking);
        const nextSession = getNextSession(booking);
        const childNames = formatChildNames(booking.participants);
        
        return (
          <div
            key={booking.id}
            className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all overflow-hidden"
          >
            <div
              onClick={() => onBookingClick?.(booking.id)}
              className={`block p-6 ${onBookingClick ? 'cursor-pointer' : ''}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-bold text-gray-900">
                      {childNames}
                    </h3>
                    {sessionInfo.needs && (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        sessionInfo.priority === 'high' 
                          ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        Action Needed
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-600 mb-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary-blue" />
                      <span>{booking.schedules?.length || 0} session{(booking.schedules?.length || 0) !== 1 ? 's' : ''}</span>
                    </div>
                    {nextSession && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary-blue" />
                        <span>
                          Next: {new Date(nextSession.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} at {nextSession.start_time}
                        </span>
                      </div>
                    )}
                    {nextSession?.activities && nextSession.activities.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-primary-blue" />
                        <span>{nextSession.activities.map(a => a.name).join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Needed Banner */}
                  {sessionInfo.needs && (
                    <div className={`mt-3 p-3 rounded-lg border-2 ${
                      sessionInfo.priority === 'high' 
                        ? 'bg-amber-50 border-amber-200' 
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-start gap-2">
                        <AlertCircle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                          sessionInfo.priority === 'high' ? 'text-amber-600' : 'text-blue-600'
                        }`} />
                        <p className={`text-xs font-medium ${
                          sessionInfo.priority === 'high' ? 'text-amber-800' : 'text-blue-800'
                        }`}>
                          {sessionInfo.reason}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0 ml-4" />
              </div>
            </div>

            {/* Book Sessions Button - Prominent */}
            {sessionInfo.needs && (
              <div className="px-6 pb-4 border-t border-gray-200 pt-4">
                <Button 
                  onClick={() => onBookingClick?.(booking.id)}
                  className="w-full bg-gradient-to-r from-primary-blue to-light-blue-cyan hover:from-primary-blue/90 hover:to-light-blue-cyan/90 text-white font-semibold flex items-center justify-center gap-2"
                  size="lg"
                >
                  <Plus className="h-5 w-5" />
                  Book First Session
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

