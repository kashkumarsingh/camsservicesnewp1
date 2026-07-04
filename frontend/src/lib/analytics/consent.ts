export const COOKIE_CONSENT_STORAGE_KEY = "cams_cookie_consent_v1";

export type ConsentState = {
  preferences: boolean;
  statistics: boolean;
  marketing: boolean;
};

export const DEFAULT_CONSENT: ConsentState = {
  preferences: false,
  statistics: false,
  marketing: false,
};

export const CONSENT_UPDATED_EVENT = "cams:cookie-consent-updated";

export function getStoredConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ConsentState;
    return {
      preferences: Boolean(parsed.preferences),
      statistics: Boolean(parsed.statistics),
      marketing: Boolean(parsed.marketing),
    };
  } catch {
    return null;
  }
}

export function hasAnalyticsConsent(consent: ConsentState | null): boolean {
  if (!consent) return false;
  return consent.statistics || consent.marketing;
}

export function persistConsent(consent: ConsentState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(consent));
  window.dispatchEvent(new CustomEvent(CONSENT_UPDATED_EVENT, { detail: consent }));
}

export function subscribeToConsentChanges(
  listener: (consent: ConsentState) => void
): () => void {
  const handler = (event: Event) => {
    const custom = event as CustomEvent<ConsentState>;
    listener(custom.detail);
  };
  window.addEventListener(CONSENT_UPDATED_EVENT, handler);
  return () => window.removeEventListener(CONSENT_UPDATED_EVENT, handler);
}

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export function pushConsentToDataLayer(consent: ConsentState): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({
    event: "consent_update",
    analytics_storage: consent.statistics ? "granted" : "denied",
    ad_storage: consent.marketing ? "granted" : "denied",
    ad_user_data: consent.marketing ? "granted" : "denied",
    ad_personalization: consent.marketing ? "granted" : "denied",
    functionality_storage: consent.preferences ? "granted" : "denied",
    personalization_storage: consent.preferences ? "granted" : "denied",
  });
}
