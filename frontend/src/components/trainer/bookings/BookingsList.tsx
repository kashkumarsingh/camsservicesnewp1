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
    <div className="space-y-3 md:space-y-4">
      {bookings.map((booking) => {
        const sessionInfo = needsSessions(booking);
        const nextSession = getNextSession(booking);
        const childNames = formatChildNames(booking.participants);
        
        return (
          <div
            key={booking.id}
            className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
          >
            <div
              onClick={() => onBookingClick?.(booking.id)}
              className={`block p-4 md:p-6 ${onBookingClick ? 'cursor-pointer' : ''}`}
            >
              <div className="flex items-start justify-between gap-3 md:mb-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 md:mb-2">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 md:text-lg">
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

                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400 md:gap-6 md:mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gcal-primary" />
                      <span>{booking.schedules?.length || 0} session{(booking.schedules?.length || 0) !== 1 ? 's' : ''}</span>
                    </div>
                    {nextSession && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gcal-primary" />
                        <span>
                          Next: {new Date(nextSession.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} at {nextSession.start_time}
                        </span>
                      </div>
                    )}
                    {nextSession?.activities && nextSession.activities.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gcal-primary" />
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

                <ArrowRight className="h-5 w-5 shrink-0 ml-2 text-slate-400 dark:text-slate-500 md:ml-4" />
              </div>
            </div>

            {/* Book Sessions Button - Prominent */}
            {sessionInfo.needs && (
              <div className="border-t border-slate-200 px-4 pb-4 pt-4 md:px-6">
                <Button 
                  onClick={() => onBookingClick?.(booking.id)}
                  className="w-full min-h-[44px] rounded-full bg-gcal-primary hover:bg-gcal-primary-hover text-white font-medium flex items-center justify-center gap-2 px-6 py-2.5 text-sm transition-all duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 md:min-h-0"
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

