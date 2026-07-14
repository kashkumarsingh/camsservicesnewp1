"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactElement } from "react";
import { ArrowUp, MessageCircle, Phone, X } from "lucide-react";
import { FloatingStackMenu, type FloatingStackAction } from "@/components/layout/FloatingStackMenu";
import { PractitionerHolderFab } from "@/components/layout/PractitionerHolderFab";
import { ReceptionistChatPanel } from "@/components/layout/receptionist/ReceptionistChatPanel";
import { contactData } from "@/data/contactData";
import { ROUTES } from "@/shared/utils/routes";

const FAB_HINT_KEY = "cams_enquiries_fab_seen_v1";
const AUTO_OPEN_KEY = "cams_enquiries_auto_opened_v1";
/** First visit nudge — opens chat once per browser session after delay. */
const AUTO_OPEN_DELAY_MS = 8000;

type SiteFloatingActionsProps = {
  contactPhone?: string;
};

function WhatsAppIcon(): ReactElement {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function SiteFloatingActions({ contactPhone }: SiteFloatingActionsProps): ReactElement {
  const pathname = usePathname();
  const [chatOpen, setChatOpen] = useState(false);
  const [askCamsDialOpen, setAskCamsDialOpen] = useState(false);
  const [kennethDialOpen, setKennethDialOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const autoOpenTimerRef = useRef<number | null>(null);
  const fabRef = useRef<HTMLDivElement | null>(null);

  const phoneDisplay = contactPhone ?? contactData.phone;
  const phoneHref = `tel:${phoneDisplay.replace(/\s/g, "")}`;
  const isKennethProfilePage = pathname.startsWith("/practitioners/kenneth-holder");
  const anyDialOpen = askCamsDialOpen || kennethDialOpen;

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 520);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const seen = window.sessionStorage.getItem(FAB_HINT_KEY);
    setShowHint(!seen);
  }, []);

  useEffect(() => {
    if (window.sessionStorage.getItem(AUTO_OPEN_KEY)) return;

    autoOpenTimerRef.current = window.setTimeout(() => {
      if (window.sessionStorage.getItem(AUTO_OPEN_KEY)) return;
      window.sessionStorage.setItem(AUTO_OPEN_KEY, "1");
      window.sessionStorage.setItem(FAB_HINT_KEY, "1");
      setShowHint(false);
      setChatOpen(true);
    }, AUTO_OPEN_DELAY_MS);

    return () => {
      if (autoOpenTimerRef.current !== null) {
        window.clearTimeout(autoOpenTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!chatOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setChatOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [chatOpen]);

  useEffect(() => {
    if (!anyDialOpen || chatOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAskCamsDialOpen(false);
        setKennethDialOpen(false);
      }
    };
    const onPointerDown = (event: MouseEvent) => {
      if (!fabRef.current?.contains(event.target as Node)) {
        setAskCamsDialOpen(false);
        setKennethDialOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onPointerDown);
    };
  }, [anyDialOpen, chatOpen]);

  const markEngaged = () => {
    window.sessionStorage.setItem(FAB_HINT_KEY, "1");
    window.sessionStorage.setItem(AUTO_OPEN_KEY, "1");
    if (autoOpenTimerRef.current !== null) {
      window.clearTimeout(autoOpenTimerRef.current);
      autoOpenTimerRef.current = null;
    }
  };

  const openChat = () => {
    markEngaged();
    setShowHint(false);
    setAskCamsDialOpen(false);
    setKennethDialOpen(false);
    setChatOpen(true);
  };

  const closeChat = () => {
    markEngaged();
    setChatOpen(false);
  };

  const toggleAskCamsDial = () => {
    markEngaged();
    setShowHint(false);
    setKennethDialOpen(false);
    setAskCamsDialOpen((open) => !open);
  };

  const toggleKennethDial = () => {
    markEngaged();
    setShowHint(false);
    setAskCamsDialOpen(false);
    setKennethDialOpen((open) => !open);
  };

  const closeAllDials = () => {
    setAskCamsDialOpen(false);
    setKennethDialOpen(false);
  };

  const askCamsActions: FloatingStackAction[] = [
    {
      id: "whatsapp",
      label: "WhatsApp CAMS",
      href: contactData.whatsapp,
      external: true,
      icon: <WhatsAppIcon />,
      className: "border-transparent bg-[#25D366] text-white hover:bg-[#1ebe5d]",
    },
    {
      id: "call",
      label: "Call CAMS",
      href: phoneHref,
      icon: <Phone size={18} aria-hidden />,
      className: "bg-white text-cams-ink hover:border-cams-primary/40 hover:text-cams-primary",
    },
    {
      id: "contact",
      label: "Contact form",
      href: ROUTES.CONTACT,
      icon: <MessageCircle size={18} aria-hidden />,
      className: "bg-white text-cams-ink hover:border-cams-primary/40 hover:text-cams-primary",
    },
    {
      id: "chat",
      label: "Live chat",
      onClick: openChat,
      icon: <MessageCircle size={18} aria-hidden />,
      className: "bg-cams-primary/10 text-cams-primary hover:bg-cams-primary/15",
    },
  ];

  return (
    <>
      <ReceptionistChatPanel open={chatOpen} onClose={closeChat} contactPhone={contactPhone} />

      {anyDialOpen && !chatOpen ? (
        <button
          type="button"
          aria-label="Close enquiry menus"
          className="fixed inset-0 z-[64] bg-slate-900/20 backdrop-blur-[1px] md:bg-transparent md:backdrop-blur-none"
          onClick={closeAllDials}
        />
      ) : null}

      <div
        ref={fabRef}
        className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] right-4 z-[65] flex flex-col items-end gap-3 sm:right-6 md:bottom-8 md:right-8"
        aria-label="Site help actions"
      >
        {showScrollTop && !chatOpen && !anyDialOpen ? (
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/90 bg-white/95 text-cams-ink shadow-md transition hover:border-cams-primary/40 hover:text-cams-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-cams-primary/50"
            aria-label="Back to top"
          >
            <ArrowUp size={18} aria-hidden />
          </button>
        ) : null}

        {isKennethProfilePage && !chatOpen ? (
          <PractitionerHolderFab
            open={kennethDialOpen}
            onToggle={toggleKennethDial}
            onClose={closeAllDials}
            phoneHref={phoneHref}
          />
        ) : null}

        {!chatOpen ? (
          <div className="flex flex-col items-end gap-2">
            {askCamsDialOpen ? <FloatingStackMenu actions={askCamsActions} onAction={closeAllDials} /> : null}

            <div className="relative">
              {showHint && !anyDialOpen ? (
                <span
                  className="pointer-events-none absolute -top-1.5 right-1 inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-cams-secondary ring-4 ring-cams-secondary/25"
                  aria-hidden
                />
              ) : null}

              <button
                type="button"
                onClick={toggleAskCamsDial}
                aria-expanded={askCamsDialOpen}
                aria-label={askCamsDialOpen ? "Close Ask CAMS menu" : "Ask CAMS a question"}
                className="inline-flex min-h-[52px] items-center gap-2.5 rounded-full bg-gradient-to-r from-cams-primary to-cams-secondary py-3 pl-4 pr-5 text-white shadow-[0_16px_40px_-20px_rgba(0,102,255,0.85)] transition hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-cams-primary/60 focus-visible:ring-offset-2"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                  {askCamsDialOpen ? <X size={18} aria-hidden /> : <MessageCircle size={18} aria-hidden />}
                </span>
                <span className="font-heading text-sm font-bold">{askCamsDialOpen ? "Close" : "Ask CAMS"}</span>
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={closeChat}
            aria-label="Close Ask CAMS"
            className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-cams-primary to-cams-secondary text-white shadow-[0_16px_40px_-20px_rgba(0,102,255,0.85)] transition hover:scale-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-cams-primary/60 focus-visible:ring-offset-2"
          >
            <X size={24} aria-hidden />
          </button>
        )}
      </div>
    </>
  );
}
