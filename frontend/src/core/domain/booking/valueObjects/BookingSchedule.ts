/**
 * Booking Schedule Value Object
 * Represents a scheduled session within a booking
 */
export class BookingSchedule {
  private constructor(
    private readonly date: Date,
    private readonly startTime: string,
    private readonly endTime: string,
    private readonly trainerId?: string,
    private readonly activityId?: string
  ) {
    if (!date) {
      throw new Error('Schedule date is required');
    }
    if (!startTime || !endTime) {
      throw new Error('Schedule start and end times are required');
    }
    if (new Date(date) < new Date(new Date().setHours(0, 0, 0, 0))) {
      throw new Error('Schedule date cannot be in the past');
    }
  }

  static create(
    date: Date,
    startTime: string,
    endTime: string,
    trainerId?: string,
    activityId?: string
  ): BookingSchedule {
    return new BookingSchedule(date, startTime, endTime, trainerId, activityId);
  }

  getDate(): Date {
    return this.date;
  }

  getStartTime(): string {
    return this.startTime;
  }

  getEndTime(): string {
    return this.endTime;
  }

  getTrainerId(): string | undefined {
    return this.trainerId;
  }

  getActivityId(): string | undefined {
    return this.activityId;
  }

  getDuration(): number {
    const start = new Date(`${this.date.toISOString().split('T')[0]}T${this.startTime}`);
    const end = new Date(`${this.date.toISOString().split('T')[0]}T${this.endTime}`);
    return (end.getTime() - start.getTime()) / (1000 * 60); // Duration in minutes
  }

  conflictsWith(other: BookingSchedule): boolean {
    if (this.date.toDateString() !== other.date.toDateString()) {
      return false;
    }
    const thisStart = new Date(`${this.date.toISOString().split('T')[0]}T${this.startTime}`);
    const thisEnd = new Date(`${this.date.toISOString().split('T')[0]}T${this.endTime}`);
    const otherStart = new Date(`${other.date.toISOString().split('T')[0]}T${other.startTime}`);
    const otherEnd = new Date(`${other.date.toISOString().split('T')[0]}T${other.endTime}`);

    return (
      (thisStart < otherEnd && thisEnd > otherStart) ||
      (otherStart < thisEnd && otherEnd > thisStart)
    );
  }
}


