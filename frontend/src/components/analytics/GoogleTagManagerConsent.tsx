"use client";

import { useEffect } from "react";
import {
  getStoredConsent,
  hasAnalyticsConsent,
  pushConsentToDataLayer,
  subscribeToConsentChanges,
} from "@/lib/analytics/consent";

/** Applies stored consent and listens for cookie-banner updates (Consent Mode v2). */
export function GoogleTagManagerConsent(): null {
  useEffect(() => {
    const stored = getStoredConsent();
    if (stored && hasAnalyticsConsent(stored)) {
      pushConsentToDataLayer(stored);
    }

    return subscribeToConsentChanges((consent) => {
      if (hasAnalyticsConsent(consent)) {
        pushConsentToDataLayer(consent);
      }
    });
  }, []);

  return null;
}
