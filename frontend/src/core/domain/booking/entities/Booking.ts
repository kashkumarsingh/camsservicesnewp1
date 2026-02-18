import { BookingStatus, BookingStatusVO } from '../valueObjects/BookingStatus';
import { PaymentStatus, PaymentStatusVO } from '../valueObjects/PaymentStatus';
import { BookingReference } from '../valueObjects/BookingReference';
import { Participant } from '../valueObjects/Participant';
import { BookingSchedule } from '../valueObjects/BookingSchedule';
import { ParentGuardian } from '../valueObjects/ParentGuardian';

/**
 * Booking Entity
 * Represents a core booking business object
 */
export class Booking {
  private constructor(
    private readonly id: string,
    private readonly reference: BookingReference,
    private readonly packageId: string,
    private readonly packageSlug: string,
    private readonly status: BookingStatusVO,
    private readonly paymentStatus: PaymentStatusVO,
    private readonly parentGuardian: ParentGuardian,
    private readonly participants: Participant[],
    private readonly schedules: BookingSchedule[],
    private readonly totalHours: number,
    private readonly totalPrice: number,
    private readonly paidAmount: number,
    private readonly createdAt: Date,
    private readonly updatedAt: Date,
    private readonly startDate?: Date,
    private readonly notes?: string,
    private readonly cancellationReason?: string,
    private readonly cancelledAt?: Date
  ) {
    if (!id || id.trim().length === 0) {
      throw new Error('Booking ID is required');
    }
    if (!packageId || packageId.trim().length === 0) {
      throw new Error('Package ID is required');
    }
    if (participants.length === 0) {
      throw new Error('At least one participant is required');
    }
    // Pay First → Book Later flow: Allow empty schedules for:
    // 1. DRAFT bookings (temporary booking for payment intent)
    // 2. CONFIRMED + PAID bookings (sessions booked later from dashboard)
    const isDraft = status.isDraft();
    const isConfirmedPaid = status.isConfirmed() && paymentStatus.getValue() === PaymentStatus.PAID;
    if (schedules.length === 0 && !isDraft && !isConfirmedPaid) {
      throw new Error('At least one schedule is required');
    }
    if (totalHours <= 0) {
      throw new Error('Total hours must be greater than zero');
    }
    if (totalPrice < 0) {
      throw new Error('Total price cannot be negative');
    }
    if (paidAmount < 0 || paidAmount > totalPrice) {
      throw new Error('Paid amount must be between 0 and total price');
    }
  }

  static create(
    id: string,
    packageId: string,
    packageSlug: string,
    parentGuardian: ParentGuardian,
    participants: Participant[],
    schedules: BookingSchedule[],
    totalHours: number,
    totalPrice: number,
    startDate?: Date,
    notes?: string
  ): Booking {
    const reference = BookingReference.generate();
    const status = BookingStatusVO.create(BookingStatus.DRAFT);
    const paymentStatus = PaymentStatusVO.create(PaymentStatus.PENDING);
    const now = new Date();

    return new Booking(
      id,
      reference,
      packageId,
      packageSlug,
      status,
      paymentStatus,
      parentGuardian,
      participants,
      schedules,
      totalHours,
      totalPrice,
      0,
      now,
      now,
      startDate,
      notes
    );
  }

  static reconstitute(
    id: string,
    reference: BookingReference,
    packageId: string,
    packageSlug: string,
    status: BookingStatusVO,
    paymentStatus: PaymentStatusVO,
    parentGuardian: ParentGuardian,
    participants: Participant[],
    schedules: BookingSchedule[],
    totalHours: number,
    totalPrice: number,
    paidAmount: number,
    createdAt: Date,
    updatedAt: Date,
    startDate?: Date,
    notes?: string,
    cancellationReason?: string,
    cancelledAt?: Date
  ): Booking {
    return new Booking(
      id,
      reference,
      packageId,
      packageSlug,
      status,
      paymentStatus,
      parentGuardian,
      participants,
      schedules,
      totalHours,
      totalPrice,
      paidAmount,
      createdAt,
      updatedAt,
      startDate,
      notes,
      cancellationReason,
      cancelledAt
    );
  }

  getId(): string {
    return this.id;
  }

  getReference(): BookingReference {
    return this.reference;
  }

  getPackageId(): string {
    return this.packageId;
  }

  getPackageSlug(): string {
    return this.packageSlug;
  }

  getStatus(): BookingStatusVO {
    return this.status;
  }

  getPaymentStatus(): PaymentStatusVO {
    return this.paymentStatus;
  }

  getParentGuardian(): ParentGuardian {
    return this.parentGuardian;
  }

  getParticipants(): Participant[] {
    return [...this.participants];
  }

  getSchedules(): BookingSchedule[] {
    return [...this.schedules];
  }

  getTotalHours(): number {
    return this.totalHours;
  }

  getTotalPrice(): number {
    return this.totalPrice;
  }

  getPaidAmount(): number {
    return this.paidAmount;
  }

  getRemainingAmount(): number {
    return this.totalPrice - this.paidAmount;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  getStartDate(): Date | undefined {
    return this.startDate;
  }

  getNotes(): string | undefined {
    return this.notes;
  }

  getCancellationReason(): string | undefined {
    return this.cancellationReason;
  }

  getCancelledAt(): Date | undefined {
    return this.cancelledAt;
  }

  isFullyPaid(): boolean {
    return this.paymentStatus.isPaid() || this.paidAmount >= this.totalPrice;
  }

  hasOutstandingBalance(): boolean {
    return this.paidAmount < this.totalPrice;
  }

  canBeCancelled(): boolean {
    return this.status.canBeCancelled();
  }

  canBeConfirmed(): boolean {
    return this.status.canBeConfirmed() && this.paymentStatus.isPaid();
  }
}


