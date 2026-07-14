"use client";

import type { ReactElement } from "react";
import { CalendarCheck, Phone, User, X } from "lucide-react";
import { PRACTITIONER_PAGE } from "@/app/(public)/constants/practitionerPageConstants";
import { FloatingStackMenu, type FloatingStackAction } from "@/components/layout/FloatingStackMenu";
import { contactData } from "@/data/contactData";
import { ROUTES } from "@/shared/utils/routes";

export const KENNETH_HOLDER_SLUG = "kenneth-holder" as const;

function WhatsAppIcon(): ReactElement {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

type PractitionerHolderFabProps = {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  phoneHref: string;
};

export function PractitionerHolderFab({
  open,
  onToggle,
  onClose,
  phoneHref,
}: PractitionerHolderFabProps): ReactElement {
  const whatsappHref = `${contactData.whatsapp}?text=${encodeURIComponent(PRACTITIONER_PAGE.WHATSAPP_MESSAGE)}`;

  const actions: FloatingStackAction[] = [
    {
      id: "profile",
      label: "View Kenneth's profile",
      href: ROUTES.PRACTITIONER_BY_SLUG(KENNETH_HOLDER_SLUG),
      icon: <User size={18} aria-hidden />,
      className: "bg-cams-dark text-white hover:bg-cams-dark/90",
    },
    {
      id: "whatsapp-kenneth",
      label: "WhatsApp about Kenneth",
      href: whatsappHref,
      external: true,
      icon: <WhatsAppIcon />,
      className: "border-transparent bg-[#25D366] text-white hover:bg-[#1ebe5d]",
    },
    {
      id: "call-cams",
      label: "Call CAMS Services",
      href: phoneHref,
      icon: <Phone size={18} aria-hidden />,
      className: "bg-white text-cams-ink hover:border-cams-primary/40 hover:text-cams-primary",
    },
    {
      id: "book-kenneth",
      label: "Book this practitioner",
      href: ROUTES.CONTACT,
      icon: <CalendarCheck size={18} aria-hidden />,
      className: "bg-cams-accent/20 text-cams-ink hover:bg-cams-accent/30",
    },
    {
      id: "referral",
      label: "Make a referral",
      href: ROUTES.REFERRAL,
      icon: <User size={18} aria-hidden />,
      className: "bg-white text-cams-ink hover:border-cams-primary/40 hover:text-cams-primary",
    },
  ];

  return (
    <div className="flex flex-col items-end gap-2">
      {open ? <FloatingStackMenu actions={actions} onAction={onClose} /> : null}

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-label={open ? "Close Kenneth Holder menu" : "Enquire about Kenneth Holder"}
        className="inline-flex min-h-[52px] max-w-[min(100vw-2rem,17rem)] items-center gap-2.5 rounded-full border-2 border-cams-accent/80 bg-cams-dark py-3 pl-3 pr-4 text-white shadow-[0_16px_40px_-20px_rgba(2,6,23,0.75)] transition hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-cams-accent/70 focus-visible:ring-offset-2"
      >
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cams-accent font-heading text-xs font-bold text-cams-dark">
          {open ? <X size={18} aria-hidden /> : "KH"}
        </span>
        <span className="text-left leading-tight">
          <span className="block font-heading text-sm font-bold">{open ? "Close" : "Kenneth Holder"}</span>
          {!open ? <span className="block text-[0.65rem] font-medium text-white/75">Book via CAMS</span> : null}
        </span>
      </button>
    </div>
  );
}
