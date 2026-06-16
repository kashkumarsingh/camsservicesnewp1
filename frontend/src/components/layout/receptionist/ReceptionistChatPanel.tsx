"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageCircle, Send, X } from "lucide-react";
import { ROUTES } from "@/shared/utils/routes";
import { useContactForm } from "@/interfaces/web/hooks/contact/useContactForm";
import { sendN8nReceptionistMessage } from "./n8nChatClient";
import {
  isN8nReceptionistEnabled,
  RECEPTIONIST_INITIAL_MESSAGES,
  getN8nChatWebhookUrl,
} from "./receptionistConfig";
import { useGuidedIntakeChat, type ChatMessage } from "./useGuidedIntakeChat";

type ReceptionistChatPanelProps = {
  open: boolean;
  onClose: () => void;
};

function MessageBubble({ message }: { message: ChatMessage }): ReactElement {
  const isAssistant = message.role === "assistant";

  return (
    <div className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 shadow-sm ${
          isAssistant
            ? "rounded-bl-md border border-slate-200/90 bg-white text-cams-ink"
            : "rounded-br-md bg-gradient-to-r from-cams-primary to-cams-secondary text-white"
        }`}
      >
        {message.text}
      </div>
    </div>
  );
}

function ChatFooterLinks({ onNavigate }: { onNavigate: () => void }): ReactElement {
  return (
    <p className="border-t border-slate-200/80 bg-slate-50/80 px-4 py-2.5 text-center text-[11px] leading-5 text-cams-ink-secondary">
      Prefer a form?{" "}
      <Link href={ROUTES.CONTACT} onClick={onNavigate} className="font-semibold text-cams-primary hover:underline">
        Contact
      </Link>
      {" · "}
      <Link href={ROUTES.REFERRAL} onClick={onNavigate} className="font-semibold text-cams-primary hover:underline">
        Referral
      </Link>
      {" · "}
      <Link href={ROUTES.BECOME_A_TRAINER} onClick={onNavigate} className="font-semibold text-cams-primary hover:underline">
        Become a trainer
      </Link>
    </p>
  );
}

export function ReceptionistChatPanel({ open, onClose }: ReceptionistChatPanelProps): ReactElement | null {
  const router = useRouter();
  const n8nEnabled = isN8nReceptionistEnabled();
  const guided = useGuidedIntakeChat();
  const { submit, loading: submitting } = useContactForm();

  const [n8nMessages, setN8nMessages] = useState<ChatMessage[]>(
    RECEPTIONIST_INITIAL_MESSAGES.map((text, index) => ({
      id: `n8n-welcome-${index}`,
      role: "assistant",
      text,
    }))
  );
  const [n8nError, setN8nError] = useState<string | null>(null);
  const [n8nSending, setN8nSending] = useState(false);
  const [input, setInput] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const messages = n8nEnabled ? n8nMessages : guided.messages;
  const busy = n8nEnabled ? n8nSending : submitting || guided.step === "submitting";
  const error = n8nEnabled ? n8nError : guided.error;
  const hideTextInput =
    !n8nEnabled &&
    (guided.step === "intent" ||
      guided.step === "confirm" ||
      guided.step === "redirect" ||
      guided.step === "done");

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, busy]);

  useEffect(() => {
    if (!open || hideTextInput) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 120);
    return () => window.clearTimeout(timer);
  }, [hideTextInput, open, guided.step]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleGuidedConfirm = useCallback(async () => {
    const payload = guided.buildSubmission();
    if (!payload) return;

    guided.markSubmitting();
    try {
      await submit(payload);
      guided.markDone();
    } catch (err) {
      const message = err instanceof Error ? err.message : "We couldn't send that just now — please try again.";
      guided.markFailed(message);
    }
  }, [guided, submit]);

  const handleQuickReply = useCallback(
    (replyId: string) => {
      const reply = guided.quickReplies.find((item) => item.id === replyId);
      if (reply?.href) {
        guided.submitQuickReply(replyId);
        router.push(reply.href);
        onClose();
        return;
      }

      if (!n8nEnabled && guided.step === "confirm" && replyId === "send") {
        void handleGuidedConfirm();
        return;
      }

      guided.submitQuickReply(replyId);
    },
    [guided, handleGuidedConfirm, n8nEnabled, onClose, router]
  );

  const handleN8nSend = useCallback(async (text: string) => {
    const webhookUrl = getN8nChatWebhookUrl();
    if (!webhookUrl) return;

    setN8nError(null);
    setN8nSending(true);
    setN8nMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: "user", text },
    ]);

    try {
      const reply = await sendN8nReceptionistMessage(webhookUrl, text);
      setN8nMessages((prev) => [
        ...prev,
        { id: `assistant-${Date.now()}`, role: "assistant", text: reply },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong — please try again.";
      setN8nError(message);
    } finally {
      setN8nSending(false);
    }
  }, []);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const text = input.trim();
      if (!text || busy) return;

      setInput("");

      if (n8nEnabled) {
        void handleN8nSend(text);
        return;
      }

      guided.submitText(text);
    },
    [busy, guided, handleN8nSend, input, n8nEnabled]
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-end p-0 sm:p-4 md:p-5"
      role="dialog"
      aria-modal="true"
      aria-label="CAMS enquiries chat"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] sm:bg-slate-900/25 md:bg-transparent md:backdrop-blur-none"
        aria-label="Close chat"
        onClick={onClose}
      />

      <section
        className="relative flex h-[min(100dvh,680px)] w-full max-w-md flex-col overflow-hidden border border-white/70 bg-white shadow-[0_24px_60px_-28px_rgba(2,12,27,0.55)] sm:h-[min(640px,calc(100dvh-6rem))] sm:rounded-2xl md:mb-20 md:mr-2 md:animate-in md:fade-in md:slide-in-from-bottom-4 md:duration-200"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200/90 bg-white px-4 py-3.5">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-cams-primary/[0.12] text-cams-primary">
              <MessageCircle size={20} aria-hidden />
            </span>
            <div>
              <p className="font-heading text-base font-bold text-cams-ink">Ask CAMS</p>
              <p className="text-xs text-cams-ink-secondary">We usually reply within one working day</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-cams-ink-secondary transition hover:bg-slate-100 hover:text-cams-ink"
            aria-label="Close chat"
          >
            <X size={20} />
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50/70 px-3 py-4 sm:px-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {busy ? (
            <div className="flex justify-start">
              <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-md border border-slate-200/90 bg-white px-3 py-2 text-sm text-cams-ink-secondary">
                <Loader2 size={16} className="animate-spin text-cams-primary" aria-hidden />
                One moment…
              </div>
            </div>
          ) : null}
        </div>

        {!n8nEnabled && guided.quickReplies.length > 0 ? (
          <div className="flex flex-col gap-2 border-t border-slate-200/80 bg-white px-3 py-3 sm:flex-row sm:flex-wrap">
            {guided.quickReplies.map((reply) => (
              <button
                key={reply.id}
                type="button"
                disabled={busy}
                onClick={() => handleQuickReply(reply.id)}
                className="min-h-11 flex-1 rounded-xl border border-cams-primary/25 bg-cams-primary/[0.06] px-4 py-2.5 text-sm font-semibold text-cams-primary transition hover:border-cams-primary/45 hover:bg-cams-primary/[0.12] disabled:opacity-60 sm:flex-none sm:rounded-full sm:px-3.5 sm:py-1.5 sm:text-xs"
              >
                {reply.label}
              </button>
            ))}
          </div>
        ) : null}

        {error ? (
          <p className="border-t border-red-100 bg-red-50 px-4 py-2.5 text-xs text-red-700" role="alert">
            {error}
          </p>
        ) : null}

        {!hideTextInput ? (
          <form onSubmit={handleSubmit} className="shrink-0 border-t border-slate-200/90 bg-white p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Type your reply…"
                disabled={busy}
                className="min-h-11 flex-1 rounded-full border border-slate-200 bg-white px-4 text-sm text-cams-ink outline-none transition placeholder:text-slate-400 focus:border-cams-primary/50 focus:ring-2 focus:ring-cams-primary/20 disabled:opacity-60"
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-cams-primary to-cams-secondary text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        ) : null}

        <ChatFooterLinks onNavigate={onClose} />
      </section>
    </div>
  );
}
