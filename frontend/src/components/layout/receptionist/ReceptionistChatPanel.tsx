"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageCircle, Send, X } from "lucide-react";
import { useContactForm } from "@/interfaces/web/hooks/contact/useContactForm";
import { EnquiryCaptureForm } from "./EnquiryCaptureForm";
import { sendN8nReceptionistMessage } from "./n8nChatClient";
import {
  isN8nReceptionistEnabled,
  RECEPTIONIST_INITIAL_MESSAGES,
  getN8nChatWebhookUrl,
} from "./receptionistConfig";
import { useGuidedIntakeChat, type ChatMessage, type GeneralTopic } from "./useGuidedIntakeChat";

type ReceptionistChatPanelProps = {
  open: boolean;
  onClose: () => void;
};

function MessageBubble({ message }: { message: ChatMessage }): ReactElement {
  const isAssistant = message.role === "assistant";

  return (
    <div className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${
          isAssistant
            ? "rounded-bl-md bg-white text-cams-ink shadow-sm ring-1 ring-slate-200/80"
            : "rounded-br-md bg-cams-primary text-white"
        }`}
      >
        {message.text}
      </div>
    </div>
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
  const showCaptureForm = !n8nEnabled && guided.step === "capture";
  const showQuickReplies = !n8nEnabled && guided.quickReplies.length > 0 && guided.step !== "capture";

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, busy, showCaptureForm]);

  useEffect(() => {
    if (!open || !n8nEnabled) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 120);
    return () => window.clearTimeout(timer);
  }, [n8nEnabled, open]);

  useEffect(() => {
    if (!open) return;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (!isMobile) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleCaptureSubmit = useCallback(
    async (fields: { name: string; email: string; phone: string; note: string }) => {
      const payload = guided.submitCapture(fields);
      if (!payload) return;

      guided.markSubmitting();
      try {
        await submit(payload);
        guided.markDone();
      } catch (err) {
        const message = err instanceof Error ? err.message : "We couldn't send that just now — please try again.";
        guided.markFailed(message);
      }
    },
    [guided, submit]
  );

  const handleQuickReply = useCallback(
    (replyId: string) => {
      if (replyId === "close") {
        onClose();
        return;
      }

      const reply = guided.quickReplies.find((item) => item.id === replyId);
      if (reply?.href) {
        guided.submitQuickReply(replyId);
        router.push(reply.href);
        onClose();
        return;
      }

      guided.submitQuickReply(replyId);
    },
    [guided, onClose, router]
  );

  const handleN8nSend = useCallback(async (text: string) => {
    const webhookUrl = getN8nChatWebhookUrl();
    if (!webhookUrl) return;

    setN8nError(null);
    setN8nSending(true);
    setN8nMessages((prev) => [...prev, { id: `user-${Date.now()}`, role: "user", text }]);

    try {
      const reply = await sendN8nReceptionistMessage(webhookUrl, text);
      setN8nMessages((prev) => [...prev, { id: `assistant-${Date.now()}`, role: "assistant", text: reply }]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong — please try again.";
      setN8nError(message);
    } finally {
      setN8nSending(false);
    }
  }, []);

  const handleN8nSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const text = input.trim();
      if (!text || busy) return;
      setInput("");
      void handleN8nSend(text);
    },
    [busy, handleN8nSend, input]
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-end md:pointer-events-none"
      role="dialog"
      aria-modal="true"
      aria-label="CAMS enquiries"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] md:hidden"
        aria-label="Close"
        onClick={onClose}
      />

      <section className="pointer-events-auto relative flex w-full flex-col overflow-hidden bg-white shadow-2xl ring-1 ring-slate-200/80 md:fixed md:bottom-24 md:right-8 md:max-h-[min(480px,calc(100dvh-8rem))] md:w-[360px] md:rounded-2xl max-md:mb-[4.5rem] max-md:h-[min(78dvh,560px)] max-md:rounded-t-2xl">
        <header className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-cams-primary/10 text-cams-primary">
              <MessageCircle size={18} aria-hidden />
            </span>
            <div>
              <p className="font-heading text-sm font-bold text-cams-ink">Ask CAMS</p>
              <p className="text-[11px] text-cams-ink-secondary">Reply within one working day</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-cams-ink-secondary transition hover:bg-slate-100 hover:text-cams-ink"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </header>

        <div ref={scrollRef} className="min-h-0 flex-1 space-y-2.5 overflow-y-auto bg-slate-50/60 px-3 py-3">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {busy ? (
            <div className="flex justify-start">
              <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-md bg-white px-3 py-2 text-sm text-cams-ink-secondary ring-1 ring-slate-200/80">
                <Loader2 size={15} className="animate-spin text-cams-primary" aria-hidden />
                One moment…
              </div>
            </div>
          ) : null}
        </div>

        <div className="shrink-0 border-t border-slate-100 bg-white px-3 py-3">
          {showCaptureForm ? (
            <EnquiryCaptureForm
              topic={guided.data.topic as GeneralTopic}
              loading={busy}
              error={guided.error}
              onBack={guided.goBack}
              onSubmit={(fields) => void handleCaptureSubmit(fields)}
            />
          ) : null}

          {showQuickReplies ? (
            <div className="flex flex-col gap-2">
              {guided.quickReplies.map((reply) => (
                <button
                  key={reply.id}
                  type="button"
                  disabled={busy}
                  onClick={() => handleQuickReply(reply.id)}
                  className={
                    reply.variant === "primary"
                      ? "min-h-11 w-full rounded-xl bg-gradient-to-r from-cams-primary to-cams-secondary px-4 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-60"
                      : "min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-cams-ink transition hover:border-cams-primary/35 hover:text-cams-primary disabled:opacity-60"
                  }
                >
                  {reply.label}
                </button>
              ))}
            </div>
          ) : null}

          {n8nEnabled ? (
            <>
              {n8nError ? (
                <p className="mb-2 text-xs text-red-600" role="alert">
                  {n8nError}
                </p>
              ) : null}
              <form onSubmit={handleN8nSubmit} className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Type your message…"
                  disabled={busy}
                  className="min-h-11 flex-1 rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-cams-primary/50 focus:ring-2 focus:ring-cams-primary/15"
                />
                <button
                  type="submit"
                  disabled={busy || !input.trim()}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cams-primary text-white disabled:opacity-50"
                  aria-label="Send"
                >
                  <Send size={17} />
                </button>
              </form>
            </>
          ) : null}
        </div>
      </section>
    </div>
  );
}
