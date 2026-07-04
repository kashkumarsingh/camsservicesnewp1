import type { Metadata } from "next";
import { DM_Sans, Outfit } from "next/font/google";
import "./globals.css";
import '@/shared/utils/moment-locales';
import ConditionalPublicLayout from '@/components/layout/ConditionalPublicLayout';
import { CookieConsent } from '@/components/layout/CookieConsent';
import { GoogleTagManager } from '@/components/analytics/GoogleTagManager';
import { ThemeProvider, ThemeScript } from '@/components/theme';
import { AuthProvider } from '@/interfaces/web/hooks/auth/useAuth';
import PerformanceFix from '@/utils/performanceFix';
import { shouldIndexSite } from '@/marketing/lib/site-indexing';
import { getSearchVerificationMetadata } from '@/marketing/lib/search-verification';

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ['400', '500', '600', '700'],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  weight: ['400', '500', '600', '700', '800'],
});

// Viewport must be exported separately in Next.js 15+ / 16
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.camsservices.co.uk'),
  title: 'Chaperone Services UK | Child Transport & Family Support | CAMS services',
  description:
    'Chaperone services UK, child transport services, school transport support, family support services, SEND support services, foster placement support, mentoring services, and local authority support services.',
  ...getSearchVerificationMetadata(),
  openGraph: {
    title: 'Chaperone Services UK | Child Transport & Family Support',
    description: 'Chaperone services UK, child transport services, family support services, SEND support services, and mentoring services across the UK.',
    url: 'https://www.camsservices.co.uk',
    type: 'website',
    images: [
      {
        url: '/og',
        width: 1200,
        height: 630,
        alt: 'CAMS services - Trusted Support Services',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chaperone Services UK | Child Transport & Family Support',
    description: 'Chaperone services UK, child transport services, family support services, SEND support services, and mentoring services.',
    images: ['/og'],
  },
  ...(!shouldIndexSite() && {
    robots: { index: false, follow: false },
  }),
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${outfit.variable} antialiased`}
      >
        <GoogleTagManager />
        <ThemeScript />
        <ThemeProvider>
          <AuthProvider>
            <PerformanceFix />
            <ConditionalPublicLayout>{children}</ConditionalPublicLayout>
            <CookieConsent />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}