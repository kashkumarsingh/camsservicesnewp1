/**
 * Contact Submission Entity
 * 
 * Domain entity representing a contact form submission.
 */

import { BaseEntity } from '../../shared/BaseEntity';
import { Email } from '../valueObjects/Email';
import { PhoneNumber } from '../valueObjects/PhoneNumber';

export type InquiryType = 'package' | 'service' | 'general' | 'other';
export type UrgencyLevel = 'urgent' | 'soon' | 'exploring';
export type PreferredContactMethod = 'email' | 'phone' | 'whatsapp';

export class ContactSubmission extends BaseEntity {
  private _name: string;
  private _email: Email;
  private _phone?: PhoneNumber;
  private _address?: string;
  private _postalCode?: string;
  private _childAge?: string;
  private _inquiryType: InquiryType;
  private _inquiryDetails?: string;
  private _urgency: UrgencyLevel;
  private _preferredContact: PreferredContactMethod;
  private _message?: string;
  private _newsletter: boolean;
  private _sourcePage?: string;
  private _status: 'pending' | 'in_progress' | 'resolved' | 'archived';
  private _assignedTo?: string;

  private constructor(
    id: string,
    name: string,
    email: Email,
    urgency: UrgencyLevel,
    preferredContact: PreferredContactMethod,
    newsletter: boolean,
    inquiryType: InquiryType = 'general',
    message?: string,
    phone?: PhoneNumber,
    address?: string,
    postalCode?: string,
    childAge?: string,
    inquiryDetails?: string,
    sourcePage?: string,
    status: 'pending' | 'in_progress' | 'resolved' | 'archived' = 'pending',
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
    this._name = name;
    this._email = email;
    this._phone = phone;
    this._address = address;
    this._postalCode = postalCode;
    this._childAge = childAge;
    this._inquiryType = inquiryType;
    this._inquiryDetails = inquiryDetails;
    this._urgency = urgency;
    this._preferredContact = preferredContact;
    this._newsletter = newsletter;
    this._message = message;
    this._sourcePage = sourcePage;
    this._status = status;
  }

  static create(
    id: string,
    name: string,
    email: string,
    urgency: UrgencyLevel,
    preferredContact: PreferredContactMethod,
    newsletter: boolean,
    inquiryType: InquiryType = 'general',
    message?: string,
    phone?: string,
    address?: string,
    postalCode?: string,
    childAge?: string,
    inquiryDetails?: string,
    sourcePage?: string
  ): ContactSubmission {
    // Business rules validation
    if (!name || name.trim().length === 0) {
      throw new Error('Name is required');
    }

    if (name.length > 200) {
      throw new Error('Name cannot exceed 200 characters');
    }

    // Message is optional, but if provided, validate length
    if (message && message.length > 5000) {
      throw new Error('Message cannot exceed 5000 characters');
    }

    // Create value objects
    const emailVO = Email.fromString(email);
    const phoneVO = phone ? PhoneNumber.fromString(phone) : undefined;

    return new ContactSubmission(
      id,
      name.trim(),
      emailVO,
      urgency,
      preferredContact,
      newsletter,
      inquiryType,
      message?.trim(),
      phoneVO,
      address?.trim(),
      postalCode?.trim(),
      childAge?.trim(),
      inquiryDetails?.trim(),
      sourcePage?.trim()
    );
  }

  get name(): string {
    return this._name;
  }

  get email(): Email {
    return this._email;
  }

  get phone(): PhoneNumber | undefined {
    return this._phone;
  }

  get address(): string | undefined {
    return this._address;
  }

  get postalCode(): string | undefined {
    return this._postalCode;
  }

  get childAge(): string | undefined {
    return this._childAge;
  }

  get inquiryType(): InquiryType {
    return this._inquiryType;
  }

  get inquiryDetails(): string | undefined {
    return this._inquiryDetails;
  }

  get urgency(): UrgencyLevel {
    return this._urgency;
  }

  get preferredContact(): PreferredContactMethod {
    return this._preferredContact;
  }

  get message(): string | undefined {
    return this._message;
  }

  get newsletter(): boolean {
    return this._newsletter;
  }

  get sourcePage(): string | undefined {
    return this._sourcePage;
  }

  get status(): 'pending' | 'in_progress' | 'resolved' | 'archived' {
    return this._status;
  }

  get assignedTo(): string | undefined {
    return this._assignedTo;
  }

  isUrgent(): boolean {
    return this._urgency === 'urgent';
  }

  requiresPhoneContact(): boolean {
    return this._preferredContact === 'phone' || this._preferredContact === 'whatsapp';
  }

  updateStatus(status: 'pending' | 'in_progress' | 'resolved' | 'archived'): void {
    this._status = status;
    this.markAsUpdated();
  }

  assignTo(userId: string): void {
    this._assignedTo = userId;
    this.markAsUpdated();
  }

  validate(): boolean {
    return (
      this._name.trim().length > 0 &&
      this._email.value.length > 0
    );
  }
}


