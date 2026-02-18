import { Booking, PaymentStatus, PaymentStatusVO } from '@/core/domain/booking';
import { IBookingRepository } from '../ports/IBookingRepository';
import { IPaymentService } from '../ports/IPaymentService';
import { ProcessPaymentDTO } from '../dto/ProcessPaymentDTO';
import { BookingDTO } from '../dto/BookingDTO';
import { BookingMapper } from '../mappers/BookingMapper';

/**
 * Process Payment Use Case
 * Orchestrates payment processing for a booking
 */
export class ProcessPaymentUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly paymentService: IPaymentService
  ) {}

  async execute(paymentDTO: ProcessPaymentDTO): Promise<{ success: boolean; booking: BookingDTO; error?: string }> {
    // Get existing booking
    const existingDTO = await this.bookingRepository.findById(paymentDTO.bookingId);
    if (!existingDTO) {
      throw new Error(`Booking with ID ${paymentDTO.bookingId} not found`);
    }

    const booking = BookingMapper.toEntity(existingDTO);

    // Validate payment amount
    if (paymentDTO.amount <= 0) {
      throw new Error('Payment amount must be greater than zero');
    }

    if (paymentDTO.amount > booking.getRemainingAmount()) {
      throw new Error('Payment amount exceeds remaining balance');
    }

    // Process payment
    const paymentResult = await this.paymentService.processPayment(
      paymentDTO.amount,
      paymentDTO.currency,
      paymentDTO.paymentMethod,
      {
        bookingId: booking.getId(),
        bookingReference: booking.getReference().getValue(),
        ...paymentDTO.metadata,
      }
    );

    if (!paymentResult.success) {
      return {
        success: false,
        booking: existingDTO,
        error: paymentResult.error || 'Payment processing failed',
      };
    }

    // Update booking payment status
    const newPaidAmount = booking.getPaidAmount() + paymentDTO.amount;
    let newPaymentStatus: PaymentStatusVO;

    if (newPaidAmount >= booking.getTotalPrice()) {
      newPaymentStatus = PaymentStatusVO.create(PaymentStatus.PAID);
    } else if (newPaidAmount > 0) {
      newPaymentStatus = PaymentStatusVO.create(PaymentStatus.PARTIAL);
    } else {
      newPaymentStatus = PaymentStatusVO.create(PaymentStatus.PENDING);
    }

    const updatedBooking = Booking.reconstitute(
      booking.getId(),
      booking.getReference(),
      booking.getPackageId(),
      booking.getPackageSlug(),
      booking.getStatus(),
      newPaymentStatus,
      booking.getParentGuardian(),
      booking.getParticipants(),
      booking.getSchedules(),
      booking.getTotalHours(),
      booking.getTotalPrice(),
      newPaidAmount,
      booking.getCreatedAt(),
      new Date(),
      booking.getStartDate(),
      booking.getNotes(),
      booking.getCancellationReason(),
      booking.getCancelledAt()
    );

    // Save updated booking
    const updatedDTO = await this.bookingRepository.update(updatedBooking);

    return {
      success: true,
      booking: updatedDTO,
    };
  }
}

