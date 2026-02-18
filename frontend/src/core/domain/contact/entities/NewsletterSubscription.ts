/**
 * Newsletter Subscription Entity
 * 
 * Domain entity representing a newsletter subscription.
 */

import { BaseEntity } from '../../shared/BaseEntity';
import { Email } from '../valueObjects/Email';

export class NewsletterSubscription extends BaseEntity {
  private _email: Email;
  private _name?: string;
  private _active: boolean;
  private _subscribedAt: Date;
  private _unsubscribedAt?: Date;

  private constructor(
    id: string,
    email: Email,
    name?: string,
    active: boolean = true,
    subscribedAt?: Date,
    unsubscribedAt?: Date,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
    this._email = email;
    this._name = name;
    this._active = active;
    this._subscribedAt = subscribedAt || new Date();
    this._unsubscribedAt = unsubscribedAt;
  }

  static create(
    id: string,
    email: string,
    name?: string
  ): NewsletterSubscription {
    // Business rules validation
    if (name && name.length > 200) {
      throw new Error('Name cannot exceed 200 characters');
    }

    const emailVO = Email.fromString(email);

    return new NewsletterSubscription(
      id,
      emailVO,
      name?.trim(),
      true,
      new Date()
    );
  }

  static restore(props: {
    id: string;
    email: string;
    name?: string;
    active: boolean;
    subscribedAt?: string | Date;
    unsubscribedAt?: string | Date;
    createdAt?: string | Date;
    updatedAt?: string | Date;
  }): NewsletterSubscription {
    const emailVO = Email.fromString(props.email);
    return new NewsletterSubscription(
      props.id,
      emailVO,
      props.name,
      props.active,
      props.subscribedAt ? new Date(props.subscribedAt) : undefined,
      props.unsubscribedAt ? new Date(props.unsubscribedAt) : undefined,
      props.createdAt ? new Date(props.createdAt) : undefined,
      props.updatedAt ? new Date(props.updatedAt) : undefined
    );
  }

  get email(): Email {
    return this._email;
  }

  get name(): string | undefined {
    return this._name;
  }

  get active(): boolean {
    return this._active;
  }

  get subscribedAt(): Date {
    return this._subscribedAt;
  }

  get unsubscribedAt(): Date | undefined {
    return this._unsubscribedAt;
  }

  unsubscribe(): void {
    this._active = false;
    this._unsubscribedAt = new Date();
    this.markAsUpdated();
  }

  resubscribe(): void {
    this._active = true;
    this._unsubscribedAt = undefined;
    this.markAsUpdated();
  }

  validate(): boolean {
    return this._email.value.length > 0;
  }
}


