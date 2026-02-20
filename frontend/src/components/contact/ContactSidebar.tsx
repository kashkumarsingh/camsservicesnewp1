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
      <div className="rounded-card border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-slate-500 shrink-0" />
          {CONTACT_SIDEBAR.WHY_TITLE}
        </h3>
        <ul className="divide-y divide-slate-100">
          {CONTACT_SIDEBAR.BENEFITS.map((benefit, index) => (
            <li
              key={index}
              className="flex items-start gap-3 py-3 text-sm text-slate-700 first:pt-0"
            >
              <CheckCircle2 className="h-4 w-4 text-slate-500 flex-shrink-0 mt-0.5" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-card border border-slate-200 bg-slate-50 p-6 sm:p-8">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          {CONTACT_SIDEBAR.PREFER_TALK_TITLE}
        </h3>
        <p className="text-sm text-slate-600 mb-4">{CONTACT_SIDEBAR.PREFER_TALK_DESCRIPTION}</p>
        <div className="space-y-2">
          <Button
            href={phoneHref ?? undefined}
            variant="primary"
            size="md"
            className="w-full"
            disabled={phoneDisabled}
          >
            <Phone size={18} className="mr-2" />
            {CONTACT_SIDEBAR.CALL_US}
          </Button>
          <Button
            href={whatsappHref ?? undefined}
            variant="bordered"
            size="md"
            className="w-full"
            disabled={whatsappDisabled}
          >
            <MessageSquare size={18} className="mr-2" />
            {CONTACT_SIDEBAR.WHATSAPP}
          </Button>
          <Button
            href={emailHref ?? undefined}
            variant="outline"
            size="md"
            className="w-full"
            disabled={emailDisabled}
          >
            <Mail size={18} className="mr-2" />
            {CONTACT_SIDEBAR.EMAIL}
          </Button>
        </div>
      </div>

      <div className="rounded-card border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-500 shrink-0" />
          {CONTACT_SIDEBAR.OFFICE_HOURS_TITLE}
        </h3>
        <ul className="divide-y divide-slate-100 text-sm text-slate-700">
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
        <p className="mt-4 pt-4 border-t border-slate-200 text-sm text-slate-600">
          {CONTACT_SIDEBAR.AFTER_HOURS}
        </p>
      </div>
    </div>
  );
}
