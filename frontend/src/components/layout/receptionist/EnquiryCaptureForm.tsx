"use client";

import { useId, useState, type FormEvent, type ReactElement } from "react";
import type { GeneralTopic } from "./useGuidedIntakeChat";

type EnquiryCaptureFormProps = {
  topic: GeneralTopic;
  loading: boolean;
  error: string | null;
  onBack: () => void;
  onSubmit: (fields: { name: string; email: string; phone: string; note: string }) => void;
};

export function EnquiryCaptureForm({
  topic,
  loading,
  error,
  onBack,
  onSubmit,
}: EnquiryCaptureFormProps): ReactElement {
  const baseId = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    onSubmit({ name, email, phone, note });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-2.5">
        <label htmlFor={`${baseId}-name`} className="sr-only">
          Your name
        </label>
        <input
          id={`${baseId}-name`}
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your name"
          autoComplete="name"
          disabled={loading}
          className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-cams-ink outline-none transition placeholder:text-slate-400 focus:border-cams-primary/50 focus:ring-2 focus:ring-cams-primary/15 disabled:opacity-60"
        />

        <label htmlFor={`${baseId}-email`} className="sr-only">
          Email address
        </label>
        <input
          id={`${baseId}-email`}
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email address"
          autoComplete="email"
          disabled={loading}
          className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-cams-ink outline-none transition placeholder:text-slate-400 focus:border-cams-primary/50 focus:ring-2 focus:ring-cams-primary/15 disabled:opacity-60"
        />

        <label htmlFor={`${baseId}-phone`} className="sr-only">
          Phone number (optional)
        </label>
        <input
          id={`${baseId}-phone`}
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="Phone (optional — for a call back)"
          autoComplete="tel"
          disabled={loading}
          className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-cams-ink outline-none transition placeholder:text-slate-400 focus:border-cams-primary/50 focus:ring-2 focus:ring-cams-primary/15 disabled:opacity-60"
        />

        {topic === "other" ? (
          <>
            <label htmlFor={`${baseId}-note`} className="sr-only">
              Brief note
            </label>
            <input
              id={`${baseId}-note`}
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Brief note (optional)"
              disabled={loading}
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-cams-ink outline-none transition placeholder:text-slate-400 focus:border-cams-primary/50 focus:ring-2 focus:ring-cams-primary/15 disabled:opacity-60"
            />
          </>
        ) : null}
      </div>

      {error ? (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="min-h-11 rounded-xl px-3 text-sm font-medium text-cams-ink-secondary transition hover:text-cams-ink disabled:opacity-60"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="min-h-11 flex-1 rounded-xl bg-gradient-to-r from-cams-primary to-cams-secondary px-4 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Sending…" : "Send enquiry"}
        </button>
      </div>
    </form>
  );
}
