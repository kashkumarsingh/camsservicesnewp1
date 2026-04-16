"use client";

import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ROUTES } from "@/shared/utils/routes";

const COOKIE_CONSENT_STORAGE_KEY = "cams_cookie_consent_v1";

type ConsentState = {
  preferences: boolean;
  statistics: boolean;
  marketing: boolean;
};

const DEFAULT_CONSENT: ConsentState = {
  preferences: false,
  statistics: false,
  marketing: false,
};

export function CookieConsent(): ReactElement | null {
  const [visible, setVisible] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [toggles, setToggles] = useState<ConsentState>(DEFAULT_CONSENT);

  useEffect(() => {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!raw) {
      setVisible(true);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as ConsentState;
      setToggles({
        preferences: Boolean(parsed.preferences),
        statistics: Boolean(parsed.statistics),
        marketing: Boolean(parsed.marketing),
      });
    } catch {
      setVisible(true);
    }
  }, []);

  const persist = (next: ConsentState) => {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(next));
    setToggles(next);
    setVisible(false);
    setManageOpen(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] border-t border-slate-200/90 bg-white/95 p-4 shadow-[0_-8px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-5">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl space-y-2">
          <h2 className="font-heading text-base font-bold text-cams-ink md:text-lg">Cookies and your privacy</h2>
          <p className="text-sm leading-relaxed text-cams-ink-secondary">
            We use essential cookies so the site works. With your permission we may also use optional cookies for
            preferences, usage statistics, or relevant updates. Read our{" "}
            <Link href={ROUTES.POLICIES} className="font-semibold text-cams-primary underline-offset-2 hover:underline">
              policies
            </Link>{" "}
            for details.
          </p>
          {manageOpen ? (
            <fieldset className="mt-3 grid gap-3 rounded-xl border border-slate-200 bg-cams-soft/80 p-4 sm:grid-cols-3">
              <legend className="sr-only">Optional cookie categories</legend>
              {(["preferences", "statistics", "marketing"] as const).map((key) => (
                <label key={key} className="flex cursor-pointer items-start gap-2 text-sm text-cams-ink-secondary">
                  <input
                    type="checkbox"
                    checked={toggles[key]}
                    onChange={(event) => setToggles((prev) => ({ ...prev, [key]: event.target.checked }))}
                    className="mt-1 size-4 rounded border-slate-300 text-cams-primary"
                  />
                  <span className="font-semibold capitalize text-cams-ink">{key}</span>
                </label>
              ))}
            </fieldset>
          ) : null}
        </div>
        <div className="flex flex-shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap lg:flex-col xl:flex-row">
          {manageOpen ? (
            <>
              <button
                type="button"
                onClick={() => persist(toggles)}
                className="inline-flex min-h-10 items-center justify-center rounded-md bg-gradient-to-r from-cams-primary to-cams-secondary px-4 py-2 text-sm font-semibold text-white"
              >
                Save choices
              </button>
              <button
                type="button"
                onClick={() => setManageOpen(false)}
                className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-cams-ink"
              >
                Back
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => persist({ preferences: true, statistics: true, marketing: true })}
                className="inline-flex min-h-10 items-center justify-center rounded-md bg-gradient-to-r from-cams-primary to-cams-secondary px-4 py-2 text-sm font-semibold text-white"
              >
                Accept all
              </button>
              <button
                type="button"
                onClick={() => persist(DEFAULT_CONSENT)}
                className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-cams-ink"
              >
                Essential only
              </button>
              <button
                type="button"
                onClick={() => setManageOpen(true)}
                className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-cams-ink"
              >
                Manage preferences
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
