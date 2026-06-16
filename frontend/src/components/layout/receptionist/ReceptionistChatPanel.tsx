"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageCircle, Send, X } from "lucide-react";
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
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 shadow-sm ${
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
      className="fixed inset-0 z-[70] flex items-end justify-end p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label="CAMS enquiries chat"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/25 backdrop-blur-[1px]"
        aria-label="Close chat"
        onClick={onClose}
      />

      <section className="relative flex h-[min(640px,calc(100dvh-6rem))] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_24px_60px_-28px_rgba(2,12,27,0.55)]">
        <header className="flex items-center justify-between border-b border-slate-200/90 bg-gradient-to-r from-cams-primary/10 to-cams-secondary/10 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-cams-primary to-cams-secondary text-white">
              <MessageCircle size={18} aria-hidden />
            </span>
            <div>
              <p className="font-heading text-sm font-bold text-cams-ink">CAMS Enquiries</p>
              <p className="text-xs text-cams-ink-secondary">We usually reply within one working day</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-cams-ink transition hover:border-cams-primary/40 hover:text-cams-primary"
            aria-label="Close chat"
          >
            <X size={18} />
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50/70 px-3 py-4">
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
          <div className="flex flex-wrap gap-2 border-t border-slate-200/80 bg-white px-3 py-2.5">
            {guided.quickReplies.map((reply) => (
              <button
                key={reply.id}
                type="button"
                disabled={busy}
                onClick={() => handleQuickReply(reply.id)}
                className="rounded-full border border-cams-primary/30 bg-cams-primary/[0.06] px-3 py-1.5 text-xs font-semibold text-cams-primary transition hover:border-cams-primary/50 hover:bg-cams-primary/[0.12] disabled:opacity-60"
              >
                {reply.label}
              </button>
            ))}
          </div>
        ) : null}

        {error ? (
          <p className="border-t border-red-100 bg-red-50 px-4 py-2 text-xs text-red-700" role="alert">
            {error}
          </p>
        ) : null}

        {!hideTextInput ? (
          <form onSubmit={handleSubmit} className="border-t border-slate-200/90 bg-white p-3">
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
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-cams-primary to-cams-secondary text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        ) : null}
      </section>
    </div>
  );
}
