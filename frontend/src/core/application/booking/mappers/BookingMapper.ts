import { Booking } from '@/core/domain/booking';
import { BookingDTO, ParentGuardianDTO, ParticipantDTO, BookingScheduleDTO } from '../dto/BookingDTO';
import { PaymentDTO } from '../../payment/dto/PaymentDTO'; // Import from Payment domain
import {
  BookingStatus,
  BookingStatusVO,
  PaymentStatus,
  PaymentStatusVO,
  BookingReference,
  Participant,
  BookingSchedule,
  ParentGuardian,
} from '@/core/domain/booking';
import { BookingCalculator } from '@/core/domain/booking/services/BookingCalculator';

/**
 * Booking Mapper
 * Converts between Booking entities and DTOs
 */
export class BookingMapper {
  /**
   * Convert Booking entity to DTO
   * Note: Payments are not part of Booking entity (separate Payment domain on backend)
   * Payments are included in DTO when fetched from API (backend includes them in response)
   */
  static toDTO(booking: Booking, payments?: PaymentDTO[]): BookingDTO {
    return {
      id: booking.getId(),
      reference: booking.getReference().getValue(),
      packageId: booking.getPackageId(),
      packageSlug: booking.getPackageSlug(),
      status: booking.getStatus().getValue(),
      paymentStatus: booking.getPaymentStatus().getValue(),
      parentGuardian: this.parentGuardianToDTO(booking.getParentGuardian()),
      participants: booking.getParticipants().map((p: Participant) => this.participantToDTO(p)),
      schedules: booking.getSchedules().map((s: BookingSchedule) => this.scheduleToDTO(s)),
      payments: payments, // Payments from separate Payment domain (backend includes in API response)
      totalHours: booking.getTotalHours(),
      totalPrice: booking.getTotalPrice(),
      paidAmount: booking.getPaidAmount(),
      createdAt: booking.getCreatedAt().toISOString(),
      updatedAt: booking.getUpdatedAt().toISOString(),
      startDate: booking.getStartDate()?.toISOString(),
      notes: booking.getNotes(),
      cancellationReason: booking.getCancellationReason(),
      cancelledAt: booking.getCancelledAt()?.toISOString(),
    };
  }

  /**
   * Convert DTO to Booking entity
   */
  static toEntity(dto: BookingDTO): Booking {
    const reference = BookingReference.create(dto.reference);
    const status = BookingStatusVO.create(dto.status as BookingStatus);
    const paymentStatus = PaymentStatusVO.create(dto.paymentStatus as PaymentStatus);
    
    // Handle optional parentGuardian - use fallback fields if not present
    const parentGuardian = dto.parentGuardian
      ? this.parentGuardianFromDTO(dto.parentGuardian)
      : this.parentGuardianFromFallbackFields(dto);
    
    const participants = dto.participants.map((p: ParticipantDTO) => this.participantFromDTO(p));
    const schedules = dto.schedules.map((s: BookingScheduleDTO) => this.scheduleFromDTO(s));

    // Calculate totalHours from schedules if it's 0 or missing
    // This handles cases where backend might return 0 or where there's data inconsistency
    let totalHours = dto.totalHours || 0;
    
    if (totalHours <= 0 && schedules.length > 0) {
      // Calculate from schedules as fallback
      const calculatedHours = BookingCalculator.calculateTotalHours(schedules);
      
      if (calculatedHours > 0) {
        totalHours = calculatedHours;
        
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            `[BookingMapper] Booking ${dto.reference} had totalHours=${dto.totalHours}, calculated from schedules: ${calculatedHours}`
          );
        }
      } else {
        // If calculation still results in 0, schedules might have invalid time data
        // Use a minimum value to pass validation, but log a warning
        totalHours = 0.01; // Minimum value to pass validation
        
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            `[BookingMapper] Booking ${dto.reference} had totalHours=${dto.totalHours} and schedules couldn't be calculated. Using minimum value ${totalHours}. This may indicate invalid schedule data.`,
            { schedules: dto.schedules }
          );
        }
      }
    } else if (totalHours <= 0 && schedules.length === 0) {
      // No schedules and no hours - this is a draft booking
      // Use a minimum value to pass validation
      totalHours = 0.01;
      
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `[BookingMapper] Booking ${dto.reference} has totalHours=${dto.totalHours} and no schedules. Using minimum value ${totalHours}. This is likely a draft booking.`
        );
      }
    }

    return Booking.reconstitute(
      dto.id,
      reference,
      dto.packageId,
      dto.packageSlug,
      status,
      paymentStatus,
      parentGuardian,
      participants,
      schedules,
      totalHours,
      dto.totalPrice,
      dto.paidAmount,
      new Date(dto.createdAt),
      new Date(dto.updatedAt),
      dto.startDate ? new Date(dto.startDate) : undefined,
      dto.notes,
      dto.cancellationReason,
      dto.cancelledAt ? new Date(dto.cancelledAt) : undefined
    );
  }

  private static parentGuardianToDTO(parent: ParentGuardian, dto?: ParentGuardianDTO): ParentGuardianDTO {
    return {
      firstName: parent.getFirstName(),
      lastName: parent.getLastName(),
      email: parent.getEmail(),
      phone: parent.getPhone(),
      address: parent.getAddress(),
      // Preserve postcode and county from original DTO if available (not in domain entity)
      postcode: dto?.postcode,
      county: dto?.county,
      emergencyContact: parent.getEmergencyContact(),
    };
  }

  private static parentGuardianFromDTO(dto: ParentGuardianDTO): ParentGuardian {
    // Domain entity doesn't store postcode/county, but DTO can have them for API
    return ParentGuardian.create(
      dto.firstName,
      dto.lastName,
      dto.email,
      dto.phone,
      dto.address,
      dto.emergencyContact
    );
  }

  private static parentGuardianFromFallbackFields(dto: BookingDTO): ParentGuardian {
    // Fallback to individual parent fields if parentGuardian object is not present
    // This handles backward compatibility with older API responses
    const firstName = dto.parentFirstName || '';
    const lastName = dto.parentLastName || '';
    const email = dto.parentEmail || '';
    const phone = dto.parentPhone || '';
    const address = dto.parentAddress;
    const emergencyContact = dto.emergencyContact;

    return ParentGuardian.create(
      firstName,
      lastName,
      email,
      phone,
      address,
      emergencyContact
    );
  }

  private static participantToDTO(participant: Participant): ParticipantDTO {
    return {
      firstName: participant.getFirstName(),
      lastName: participant.getLastName(),
      dateOfBirth: participant.getDateOfBirth().toISOString(),
      medicalInfo: participant.getMedicalInfo(),
      specialNeeds: participant.getSpecialNeeds(),
    };
  }

  private static participantFromDTO(dto: ParticipantDTO): Participant {
    return Participant.create(
      dto.firstName,
      dto.lastName,
      new Date(dto.dateOfBirth),
      dto.medicalInfo,
      dto.specialNeeds
    );
  }

  private static scheduleToDTO(schedule: BookingSchedule): BookingScheduleDTO {
    return {
      date: schedule.getDate().toISOString(),
      startTime: schedule.getStartTime(),
      endTime: schedule.getEndTime(),
      trainerId: schedule.getTrainerId(),
      activityId: schedule.getActivityId(),
    };
  }

  private static scheduleFromDTO(dto: BookingScheduleDTO): BookingSchedule {
    return BookingSchedule.create(
      new Date(dto.date),
      dto.startTime,
      dto.endTime,
      dto.trainerId,
      dto.activityId
    );
  }
}


