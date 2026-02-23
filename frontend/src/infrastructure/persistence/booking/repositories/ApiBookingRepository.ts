import { Booking } from '@/core/domain/booking/entities/Booking';
import { IBookingRepository } from '@/core/application/booking/ports/IBookingRepository';
import { BookingDTO } from '@/core/application/booking/dto/BookingDTO';
import { CreateBookingDTO } from '@/core/application/booking/dto/CreateBookingDTO';
import { BookingMapper } from '@/core/application/booking/mappers/BookingMapper';
import { apiClient, type ApiError } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';

function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && 'message' in error;
}

function getStatus(error: unknown): number | undefined {
  return isApiError(error) ? error.response?.status : undefined;
}

type BookingsPayload = BookingDTO[] | { data?: BookingDTO[] };

/**
 * Booking-specific list extraction. We do not use extractList() from responseHelpers here
 * because: (1) this repository works with response.data directly (payload) and may receive
 * slightly different envelope shapes from the bookings API; (2) toBookingList is used
 * in multiple list methods with consistent 404 → [] handling and optional dev warnings.
 * Do not replace with extractList without verifying all call sites and backend contract.
 */
function toBookingList(payload: unknown): BookingDTO[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object' && 'data' in payload && Array.isArray((payload as { data?: unknown }).data)) {
    return (payload as { data: BookingDTO[] }).data;
  }
  return [];
}

/**
 * API Booking Repository
 * Implements IBookingRepository for Laravel API integration
 * 
 * Clean Architecture: Infrastructure Layer (Data Access)
 * Uses centralized API_ENDPOINTS constants for CMS-agnostic endpoint management
 */
export class ApiBookingRepository implements IBookingRepository {
  // Store original CreateBookingDTO temporarily to preserve postcode/county
  // (domain entity doesn't store these optional fields)
  private originalCreateDTO: CreateBookingDTO | null = null;

  async findById(id: string): Promise<BookingDTO | null> {
    try {
      // ApiClient unwraps { success: true, data: {...} } to { data: {...} }
      const response = await apiClient.get<BookingDTO>(
        API_ENDPOINTS.BOOKING_BY_ID(id)
      );
      return response.data;
    } catch (error: unknown) {
      if (getStatus(error) === 404) return null;
      throw error;
    }
  }

  async findByReference(reference: string): Promise<BookingDTO | null> {
    try {
      // ApiClient unwraps { success: true, data: {...} } to { data: {...} }
      const response = await apiClient.get<BookingDTO>(
        API_ENDPOINTS.BOOKING_BY_REFERENCE(reference)
      );
      return response.data;
    } catch (error: unknown) {
      if (getStatus(error) === 404) return null;
      throw error;
    }
  }

  async findAll(): Promise<BookingDTO[]> {
    try {
      // Collection responses from ApiClient may be:
      // - A plain array: BookingDTO[]
      // - An object: { data: BookingDTO[]; meta?: {...} }
      const response = await apiClient.get<BookingsPayload>(API_ENDPOINTS.BOOKINGS);
      const bookings = toBookingList(response.data);
      const payload = response.data;
      const isObject = payload && typeof payload === 'object' && !Array.isArray(payload);
      const hasDataArray = isObject && 'data' in payload && Array.isArray((payload as { data?: unknown }).data);
      if (bookings.length === 0 && isObject && !hasDataArray && typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.warn('[ApiBookingRepository] Unexpected bookings payload shape in findAll:', response.data);
      }
      return bookings;
    } catch (error: unknown) {
      if (getStatus(error) === 404) return [];
      throw error;
    }
  }

  async findByPackageId(packageId: string): Promise<BookingDTO[]> {
    try {
      const response = await apiClient.get<BookingsPayload>(
        `${API_ENDPOINTS.BOOKINGS}?package_id=${packageId}`
      );
      const bookings = toBookingList(response.data);
      return bookings;
    } catch (error: unknown) {
      if (getStatus(error) === 404) return [];
      throw error;
    }
  }

  async findByParentEmail(email: string): Promise<BookingDTO[]> {
    try {
      const response = await apiClient.get<BookingsPayload>(
        `${API_ENDPOINTS.BOOKINGS}?parent_email=${encodeURIComponent(email)}`
      );
      return toBookingList(response.data);
    } catch (error: unknown) {
      if (getStatus(error) === 404) return [];
      throw error;
    }
  }

  async findByStatus(status: string): Promise<BookingDTO[]> {
    try {
      const response = await apiClient.get<BookingsPayload>(
        `${API_ENDPOINTS.BOOKINGS}?status=${status}`
      );
      return toBookingList(response.data);
    } catch (error: unknown) {
      if (getStatus(error) === 404) return [];
      throw error;
    }
  }

  /**
   * Transform Booking DTO to API request format (snake_case, flat structure)
   * Backend expects: package_id (integer), parent_first_name, parent_last_name, etc.
   * 
   * @param dto - BookingDTO from domain entity
   * @param originalCreateDTO - Optional original CreateBookingDTO to preserve postcode/county
   */
  private async transformDTOToApiRequest(
    dto: BookingDTO,
    originalCreateDTO?: CreateBookingDTO
  ): Promise<Record<string, unknown>> {
    // Extract numeric package ID from packageId (which might be slug or ID string)
    let packageId: number | null = null;

    // If packageId is numeric, use it directly
    if (/^\d+$/.test(dto.packageId)) {
      packageId = parseInt(dto.packageId, 10);
    } else {
      // If it's a slug, look up the package to get the numeric ID
      // Use GetPackageUseCase to properly handle the lookup (same as elsewhere in the app)
      try {
        const { GetPackageUseCase } = await import('@/core/application/packages/useCases/GetPackageUseCase');
        const { packageRepository } = await import('@/infrastructure/persistence/packages');
        const getPackageUseCase = new GetPackageUseCase(packageRepository);
        const pkg = await getPackageUseCase.execute(dto.packageId);
        
        if (pkg && pkg.id) {
          packageId = parseInt(pkg.id, 10);
        } else {
          throw new Error(`Package with slug ${dto.packageId} not found`);
        }
      } catch (error) {
        console.error('Failed to look up package ID from slug:', error);
        if (error instanceof Error) {
          throw error;
        }
        throw new Error(`Could not find package with slug: ${dto.packageId}`);
      }
    }

    if (!packageId) {
      throw new Error(`Invalid package ID: ${dto.packageId}. Could not determine numeric package ID.`);
    }

    // Handle optional parentGuardian - use fallback fields if not present
    const parentGuardian = dto.parentGuardian || {
      firstName: dto.parentFirstName || '',
      lastName: dto.parentLastName || '',
      email: dto.parentEmail || '',
      phone: dto.parentPhone || '',
      address: dto.parentAddress,
      postcode: dto.parentPostcode,
      county: dto.parentCounty,
      emergencyContact: dto.emergencyContact,
    };

    return {
      package_id: packageId,
      parent_first_name: parentGuardian.firstName,
      parent_last_name: parentGuardian.lastName,
      parent_email: parentGuardian.email,
      parent_phone: parentGuardian.phone,
      parent_address: parentGuardian.address || null,
      // Use postcode/county from original DTO if available (domain entity doesn't store them)
      parent_postcode: originalCreateDTO?.parentGuardian?.postcode || parentGuardian.postcode || dto.parentPostcode || null,
      parent_county: originalCreateDTO?.parentGuardian?.county || parentGuardian.county || dto.parentCounty || null,
      emergency_contact: parentGuardian.emergencyContact || dto.emergencyContact || null,
      participants: dto.participants.map((p, index) => {
        // Get childId from original DTO (domain entity doesn't preserve it)
        // Match participant by index and name to get the correct childId
        const originalParticipant = originalCreateDTO?.participants?.[index];
        let childId: number | undefined = originalParticipant?.childId;
        
        // Fallback: try to match by name if index doesn't match
        if (!childId && originalCreateDTO?.participants) {
          const matchedParticipant = originalCreateDTO.participants.find(
            op => op.firstName === p.firstName && op.lastName === p.lastName
          );
          childId = matchedParticipant?.childId;
        }
        
        // Ensure child_id is a number and is present
        if (!childId && childId !== 0) {
          console.error('Missing childId in participant:', {
            participant: p,
            index,
            allParticipants: dto.participants,
            originalParticipants: originalCreateDTO?.participants,
          });
          throw new Error(`Child ID is required for participant: ${p.firstName} ${p.lastName}. Please select an approved child.`);
        }
        
        const childIdNumber = typeof childId === 'string' ? parseInt(childId, 10) : Number(childId);
        
        if (isNaN(childIdNumber)) {
          console.error('Invalid childId value:', {
            originalChildId: childId,
            participant: p,
          });
          throw new Error(`Invalid child ID for participant: ${p.firstName} ${p.lastName}. Please select an approved child.`);
        }
        
        // Log in development for debugging
        if (process.env.NODE_ENV === 'development') {
          console.log(`Participant ${index + 1}:`, {
            childId: childIdNumber,
            firstName: p.firstName,
            lastName: p.lastName,
            fromOriginalDTO: !!originalParticipant,
          });
        }
        
        return {
          child_id: childIdNumber, // Convert to number if string
          first_name: p.firstName,
          last_name: p.lastName,
          date_of_birth: p.dateOfBirth,
          medical_info: p.medicalInfo || null,
          special_needs: p.specialNeeds || null,
        };
      }),
      start_date: dto.startDate || null,
      notes: dto.notes || null,
      // Use modeKey from original DTO (domain entity doesn't preserve it)
      modeKey: originalCreateDTO?.modeKey || dto.modeKey || null,
      // Schedules are created separately via /api/v1/bookings/{id}/schedules
      // So we don't include them in the initial booking creation
    };
  }

  /**
   * Set original CreateBookingDTO to preserve postcode/county
   * (called before create() to preserve optional fields not in domain entity)
   */
  setOriginalCreateDTO(dto: CreateBookingDTO): void {
    this.originalCreateDTO = dto;
  }

  async create(booking: Booking): Promise<BookingDTO> {
    const dto = BookingMapper.toDTO(booking);
    
    // Transform DTO to API request format (looks up package ID if needed)
    // Pass original CreateBookingDTO to preserve postcode/county
    const apiRequest = await this.transformDTOToApiRequest(dto, this.originalCreateDTO || undefined);
    
    // Log request in development for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('Booking API Request:', JSON.stringify(apiRequest, null, 2));
    }
    
    // Clear stored DTO after use
    this.originalCreateDTO = null;
    
    try {
      // ApiClient unwraps { success: true, data: {...} } to { data: {...} }
      const response = await apiClient.post<BookingDTO>(
        API_ENDPOINTS.BOOKINGS,
        apiRequest
      );
      
      // response.data is already the BookingDTO (ApiClient unwraps it)
      const bookingDTO = response.data;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[ApiBookingRepository] API response:', {
          rawResponse: response,
          bookingDTO,
          hasId: !!bookingDTO?.id,
          hasReference: !!bookingDTO?.reference,
        });
      }
      
      // After booking is created, create schedules separately
      // Note: Schedule creation failures are non-critical - booking is already created
      if (dto.schedules && dto.schedules.length > 0 && bookingDTO) {
        const createdBookingId = bookingDTO.id;
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[ApiBookingRepository] Creating schedules for booking:', {
            bookingId: createdBookingId,
            scheduleCount: dto.schedules.length,
          });
        }
        
        // Create schedules one by one (backend expects individual schedule creation)
        for (const schedule of dto.schedules) {
          try {
            await apiClient.post(
              API_ENDPOINTS.BOOKING_SCHEDULES(createdBookingId),
              {
                date: schedule.date,
                start_time: schedule.startTime,
                end_time: schedule.endTime,
                trainer_id: schedule.trainerId ? parseInt(schedule.trainerId, 10) : null,
                activities: schedule.activityId ? [{
                  activity_id: parseInt(schedule.activityId, 10),
                }] : [],
              }
            );
            if (process.env.NODE_ENV === 'development') {
              console.log('[ApiBookingRepository] Schedule created successfully:', {
                date: schedule.date,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
              });
            }
          } catch (scheduleError: unknown) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('[ApiBookingRepository] Schedule creation failed (non-critical):', {
                schedule,
                error: scheduleError instanceof Error ? scheduleError.message : 'Unknown error',
                status: getStatus(scheduleError),
              });
            }
          }
        }
      }
      return bookingDTO;
    } catch (error: unknown) {
      if (process.env.NODE_ENV === 'development' && isApiError(error)) {
        const data = error.response?.data as Record<string, unknown> | undefined;
        console.error('Booking creation error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data,
          errors: data?.errors,
          message: data?.message,
        });
      }
      if (isApiError(error) && error.response?.data && typeof error.response.data === 'object' && error.response.data !== null) {
        const data = error.response.data as Record<string, unknown>;
        if (data.errors && typeof data.errors === 'object') {
          const validationErrors = data.errors as Record<string, unknown>;
          const errorMessages = Object.entries(validationErrors)
            .map(([field, messages]) => {
              const msgArray = Array.isArray(messages) ? messages : [messages];
              return `${field}: ${String(msgArray.join(', '))}`;
            })
            .join('; ');
          const enhancedError = new Error(`Validation failed: ${errorMessages}`);
          (enhancedError as ApiError).response = error.response;
          throw enhancedError;
        }
        if (typeof data.message === 'string') {
          const enhancedError = new Error(data.message);
          (enhancedError as ApiError).response = error.response;
          throw enhancedError;
        }
      }
      throw error;
    }
  }

  async update(booking: Booking): Promise<BookingDTO> {
    const dto = BookingMapper.toDTO(booking);
    // ApiClient unwraps { success: true, data: {...} } to { data: {...} }
    const response = await apiClient.put<BookingDTO>(
      API_ENDPOINTS.BOOKING_BY_ID(booking.getId()),
      dto
    );
    return response.data;
  }

  async cancel(id: string, reason: string): Promise<BookingDTO> {
    const response = await apiClient.post<BookingDTO>(
      API_ENDPOINTS.BOOKING_CANCEL(id),
      { reason: reason || 'Cancelled by parent' }
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.BOOKING_BY_ID(id));
  }

  async referenceExists(reference: string): Promise<boolean> {
    try {
      const booking = await this.findByReference(reference);
      return booking !== null;
    } catch {
      return false;
    }
  }
}

