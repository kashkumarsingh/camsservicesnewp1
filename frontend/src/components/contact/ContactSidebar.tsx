'use client';

import React from 'react';
import Button from '@/components/ui/Button';
import { CheckCircle2, Phone, MessageSquare, Mail, Clock } from 'lucide-react';
import { CONTACT_SIDEBAR } from './constants';

interface ContactSidebarProps {
  phoneHref: string | null;
  whatsappHref: string | null;
  emailHref: string | null;
  phoneDisabled: boolean;
  whatsappDisabled: boolean;
  emailDisabled: boolean;
}

export default function ContactSidebar({
  phoneHref,
  whatsappHref,
  emailHref,
  phoneDisabled,
  whatsappDisabled,
  emailDisabled,
}: ContactSidebarProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-card p-6 sm:p-8 shadow-lg border border-gray-200">
        <h3 className="text-2xl font-bold text-navy-blue mb-6 flex items-center gap-3">
          <CheckCircle2 className="h-7 w-7 text-primary-blue shrink-0" aria-hidden />
          {CONTACT_SIDEBAR.WHY_TITLE}
        </h3>
        <ul className="space-y-4">
          {CONTACT_SIDEBAR.BENEFITS.map((benefit, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary-blue flex-shrink-0 mt-1" aria-hidden />
              <span className="text-navy-blue">{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-gradient-to-br from-primary-blue to-light-blue-cyan rounded-card p-6 sm:p-8 text-white shadow-lg">
        <h3 className="text-2xl font-bold mb-4">{CONTACT_SIDEBAR.PREFER_TALK_TITLE}</h3>
        <p className="mb-6 opacity-90">{CONTACT_SIDEBAR.PREFER_TALK_DESCRIPTION}</p>
        <div className="space-y-3">
          <Button
            href={phoneHref ?? '#'}
            variant="outlineWhite"
            size="lg"
            className="w-full rounded-full border-2 border-white bg-transparent text-white hover:bg-white hover:text-primary-blue hover:shadow-2xl hover:scale-105 transition-all duration-300 px-8 py-4 text-lg"
          >
            <Phone size={20} className="mr-2" />
            {CONTACT_SIDEBAR.PREFER_CALL_NOW}
          </Button>
          <Button
            href={whatsappHref ?? '#'}
            variant="secondary"
            size="lg"
            className="w-full rounded-full !bg-emerald-500 hover:!bg-emerald-600 !text-white !border-2 !border-white hover:!shadow-2xl hover:!scale-105 transition-all duration-300 px-8 py-4 text-lg"
          >
            <MessageSquare size={20} className="mr-2" />
            {CONTACT_SIDEBAR.WHATSAPP}
          </Button>
          <Button
            href={emailHref ?? '#'}
            variant="outlineWhite"
            size="lg"
            className="w-full rounded-full border-2 border-white bg-transparent text-white hover:bg-white hover:text-primary-blue hover:shadow-2xl hover:scale-105 transition-all duration-300 px-8 py-4 text-lg"
          >
            <Mail size={20} className="mr-2" />
            {CONTACT_SIDEBAR.EMAIL_US}
          </Button>
        </div>
      </div>

      <div className="rounded-card border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary-blue shrink-0" />
          {CONTACT_SIDEBAR.OFFICE_HOURS_TITLE}
        </h3>
        <ul className="divide-y divide-gray-100 text-sm text-gray-700">
          <li className="flex justify-between items-center py-2 first:pt-0">
            <span className="font-medium">{CONTACT_SIDEBAR.MONDAY_FRIDAY}</span>
            <span>{CONTACT_SIDEBAR.MONDAY_FRIDAY_HOURS}</span>
          </li>
          <li className="flex justify-between items-center py-2">
            <span className="font-medium">{CONTACT_SIDEBAR.SATURDAY}</span>
            <span>{CONTACT_SIDEBAR.SATURDAY_HOURS}</span>
          </li>
          <li className="flex justify-between items-center py-2">
            <span className="font-medium">{CONTACT_SIDEBAR.SUNDAY}</span>
            <span>{CONTACT_SIDEBAR.SUNDAY_HOURS}</span>
          </li>
        </ul>
        <p className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
          {CONTACT_SIDEBAR.AFTER_HOURS}
        </p>
      </div>
    </div>
  );
}
