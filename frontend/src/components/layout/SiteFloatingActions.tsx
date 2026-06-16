"use client";

import Link from "next/link";
import { useEffect, useState, type ReactElement } from "react";
import { ArrowUp, MessageCircle } from "lucide-react";
import { ROUTES } from "@/shared/utils/routes";
import { ReceptionistChatPanel } from "@/components/layout/receptionist/ReceptionistChatPanel";

const FAB_HINT_KEY = "cams_enquiries_fab_seen_v1";

export function SiteFloatingActions(): ReactElement {
  const [chatOpen, setChatOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showHint, setShowHint] = useState(false);

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
    if (!chatOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setChatOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [chatOpen]);

  const openChat = () => {
    window.sessionStorage.setItem(FAB_HINT_KEY, "1");
    setShowHint(false);
    setChatOpen(true);
  };

  return (
    <>
      <ReceptionistChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />

      {!chatOpen ? (
        <div
          className="fixed bottom-24 right-4 z-[65] flex flex-col items-end gap-3 sm:right-6 md:bottom-8 md:right-8"
          aria-label="Site help actions"
        >
          {showScrollTop ? (
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/90 bg-white/95 text-cams-ink shadow-md transition hover:border-cams-primary/40 hover:text-cams-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-cams-primary/50"
              aria-label="Back to top"
            >
              <ArrowUp size={18} aria-hidden />
            </button>
          ) : null}

          <div className="relative">
            {showHint ? (
              <span
                className="pointer-events-none absolute -top-2 right-0 inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-cams-secondary ring-4 ring-cams-secondary/25"
                aria-hidden
              />
            ) : null}

            <button
              type="button"
              onClick={openChat}
              aria-label="Ask CAMS a question"
              className="group inline-flex min-h-[52px] items-center gap-2.5 rounded-full bg-gradient-to-r from-cams-primary to-cams-secondary py-3 pl-4 pr-5 text-white shadow-[0_16px_40px_-20px_rgba(0,102,255,0.85)] transition hover:scale-[1.02] hover:shadow-[0_20px_44px_-18px_rgba(0,102,255,0.9)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cams-primary/60 focus-visible:ring-offset-2"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                <MessageCircle size={18} aria-hidden />
              </span>
              <span className="flex flex-col items-start leading-tight">
                <span className="font-heading text-sm font-bold">Ask CAMS</span>
                <span className="hidden text-[11px] font-medium text-white/85 sm:block">Questions · referrals · trainers</span>
              </span>
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
