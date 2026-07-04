import Script from "next/script";
import { GoogleTagManagerConsent } from "@/components/analytics/GoogleTagManagerConsent";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID?.trim();
const ANALYTICS_ENABLED = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== "false";

/**
 * Official Google Tag Manager install (head script + body noscript).
 * Consent defaults are denied until the cookie banner grants statistics/marketing.
 */
export function GoogleTagManager(): React.ReactElement | null {
  if (!ANALYTICS_ENABLED || !GTM_ID) {
    return null;
  }

  return (
    <>
      <Script id="gtm-consent-default" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: 'gtm.consent.default',
            analytics_storage: 'denied',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            functionality_storage: 'denied',
            personalization_storage: 'denied',
            wait_for_update: 500
          });
        `}
      </Script>
      <Script id="gtm-loader" strategy="beforeInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${GTM_ID}');
        `}
      </Script>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
          title="Google Tag Manager"
        />
      </noscript>
      <GoogleTagManagerConsent />
    </>
  );
}
