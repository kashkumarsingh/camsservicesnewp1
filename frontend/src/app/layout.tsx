import type { Metadata } from "next";
import { Fredoka, Baloo_2 } from "next/font/google";
import "./globals.css";
import ConditionalPublicLayout from '@/components/layout/ConditionalPublicLayout';
import { ThemeProvider, ThemeScript } from '@/components/theme';
import PerformanceFix from '@/utils/performanceFix';

const fredoka = Fredoka({
  variable: "--font-kid-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ['400', '500', '600', '700'],
});

const baloo_2 = Baloo_2({
  variable: "--font-kid-body",
  subsets: ["latin"],
  display: "swap",
  weight: ['400', '500', '600'],
});

// Viewport must be exported separately in Next.js 15+
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.camsservices.co.uk'),
  title: 'CAMS Services - Chaperone, Activity, Mentoring & Support for Young People',
  description:
    'Specialist support for children with SEN, trauma, and additional needs. Book trauma-informed activities and packages with CAMS Services today.',
  keywords: ['SEN support', 'trauma-informed care', 'child mentoring', 'activities for children', 'Buckhurst Hill', 'CAMS Services'],
  icons: {
    icon: {
      url: '/favicon.ico',
      type: 'image/x-icon',
    },
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  openGraph: {
    title: 'CAMS Services - Support for Young People',
    description: 'Trauma-informed care and activities for children with SEN and additional needs in Buckhurst Hill, England.',
    url: 'https://www.camsservices.co.uk',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CAMS Services - Supporting Young People',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CAMS Services - Support for Young People',
    description: 'Trauma-informed care and activities for children with SEN and additional needs.',
    images: ['/og-image.jpg'],
  },
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fredoka.variable} ${baloo_2.variable} font-kid-body antialiased`}
      >
        <ThemeScript />
        <ThemeProvider>
          <PerformanceFix />
          <ConditionalPublicLayout>{children}</ConditionalPublicLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}