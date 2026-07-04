"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import { ArrowUp, MessageCircle, X } from "lucide-react";
import { ReceptionistChatPanel } from "@/components/layout/receptionist/ReceptionistChatPanel";

const FAB_HINT_KEY = "cams_enquiries_fab_seen_v1";
const AUTO_OPEN_KEY = "cams_enquiries_auto_opened_v1";
/** First visit nudge — opens once per browser session after delay. */
const AUTO_OPEN_DELAY_MS = 8000;

type SiteFloatingActionsProps = {
  contactPhone?: string;
};

export function SiteFloatingActions({ contactPhone }: SiteFloatingActionsProps): ReactElement {
  const [chatOpen, setChatOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const autoOpenTimerRef = useRef<number | null>(null);

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
    setChatOpen(true);
  };

  const closeChat = () => {
    markEngaged();
    setChatOpen(false);
  };

  return (
    <>
      <ReceptionistChatPanel open={chatOpen} onClose={closeChat} contactPhone={contactPhone} />

      <div
        className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom,0px))] right-4 z-[65] flex flex-col items-end gap-2 sm:right-6 md:bottom-8 md:right-8"
        aria-label="Site help actions"
      >
        {showScrollTop && !chatOpen ? (
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0 })}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/90 bg-white/95 text-cams-ink shadow-md transition hover:border-cams-primary/40 hover:text-cams-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-cams-primary/50"
            aria-label="Back to top"
          >
            <ArrowUp size={18} aria-hidden />
          </button>
        ) : null}

        {!chatOpen ? (
          <div className="relative">
            {showHint ? (
              <span
                className="pointer-events-none absolute -top-1.5 right-1 inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-cams-secondary ring-4 ring-cams-secondary/25"
                aria-hidden
              />
            ) : null}

            <button
              type="button"
              onClick={openChat}
              aria-label="Ask CAMS a question"
              className="inline-flex min-h-[52px] items-center gap-2.5 rounded-full bg-gradient-to-r from-cams-primary to-cams-secondary py-3 pl-4 pr-5 text-white shadow-[0_16px_40px_-20px_rgba(0,102,255,0.85)] transition hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-cams-primary/60 focus-visible:ring-offset-2"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                <MessageCircle size={18} aria-hidden />
              </span>
              <span className="font-heading text-sm font-bold">Ask CAMS</span>
            </button>
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
