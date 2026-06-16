"use client";

import Link from "next/link";
import { useEffect, useState, type ReactElement } from "react";
import { ArrowUp, Bot, MessageCircle, PhoneCall, X } from "lucide-react";
import { ROUTES } from "@/shared/utils/routes";
import { ReceptionistChatPanel } from "@/components/layout/receptionist/ReceptionistChatPanel";

const FLOATING_LINKS = [
  { id: "contact", href: ROUTES.CONTACT, label: "Contact form", icon: MessageCircle },
  { id: "call", href: ROUTES.CONTACT, label: "Book call", icon: PhoneCall },
] as const;

export function SiteFloatingActions(): ReactElement {
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 520);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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

  const toggleChat = () => {
    setMenuOpen(false);
    setChatOpen((value) => !value);
  };

  return (
    <>
      <ReceptionistChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />

      <div className="fixed bottom-24 right-4 z-[65] sm:right-6 md:bottom-8 md:right-8">
        <div className="flex flex-col items-end gap-2">
          <div
            className={`flex flex-col items-end gap-2 transition-all duration-200 ${
              menuOpen && !chatOpen
                ? "pointer-events-auto translate-y-0 opacity-100"
                : "pointer-events-none translate-y-2 opacity-0"
            }`}
          >
            {FLOATING_LINKS.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.id}
                  href={action.href}
                  className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/95 px-3 py-2 text-sm font-semibold text-cams-ink shadow-[0_10px_30px_-18px_rgba(2,12,27,0.5)] transition hover:border-cams-primary/45 hover:text-cams-primary"
                  onClick={() => setMenuOpen(false)}
                >
                  <Icon size={16} className="text-cams-primary" />
                  <span>{action.label}</span>
                </Link>
              );
            })}
            {showScrollTop ? (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/95 px-3 py-2 text-sm font-semibold text-cams-ink shadow-[0_10px_30px_-18px_rgba(2,12,27,0.5)] transition hover:border-cams-primary/45 hover:text-cams-primary"
              >
                <ArrowUp size={16} className="text-cams-primary" />
                <span>Back to top</span>
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {!chatOpen ? (
              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                aria-label={menuOpen ? "Close quick actions" : "Open quick actions"}
                aria-expanded={menuOpen}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/70 bg-white/95 text-cams-ink shadow-[0_10px_30px_-18px_rgba(2,12,27,0.5)] transition hover:border-cams-primary/45 hover:text-cams-primary"
              >
                <MessageCircle size={20} />
              </button>
            ) : null}

            <button
              type="button"
              onClick={toggleChat}
              aria-label={chatOpen ? "Close receptionist chat" : "Open CAMS receptionist"}
              aria-expanded={chatOpen}
              className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-cams-primary to-cams-secondary text-white shadow-[0_20px_40px_-24px_rgba(10,99,255,0.8)] transition hover:scale-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-cams-primary/60"
            >
              {chatOpen ? <X size={22} /> : <Bot size={22} />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
