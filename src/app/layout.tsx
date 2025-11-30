import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import MetaPixel from "@/components/analytics/MetaPixel";
import GoogleAds from "@/components/analytics/GoogleAds";
import CookieBanner from "@/components/ui/CookieBanner";
import "./globals.css";

import { Toaster } from 'sonner';
import BlackFridayBanner from '@/components/ui/BlackFridayBanner';
import Footer from "@/components/ui/Footer";

const fontHeading = Syne({
  subsets: ["latin"],
  variable: "--font-heading",
});

const fontBody = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://copiecolle.ai'),
  title: {
    default: "CopiéCollé | AI Mockup Generator",
    template: "%s | CopiéCollé"
  },
  description: "Create photorealistic product mockups in seconds with AI. No Photoshop required.",
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://copiecolle.ai',
    siteName: 'CopiéCollé',
    title: 'CopiéCollé | AI Mockup Generator',
    description: 'Create photorealistic product mockups in seconds with AI. No Photoshop required.',
    images: [
      {
        url: '/banner.webp',
        width: 1200,
        height: 630,
        alt: 'CopiéCollé AI Mockup Generator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CopiéCollé | AI Mockup Generator',
    description: 'Create photorealistic product mockups in seconds with AI. No Photoshop required.',
    images: ['/banner.webp'],
    creator: '@copiecolle',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontHeading.variable} ${fontBody.variable} font-sans antialiased bg-cream text-ink`}>
        <BlackFridayBanner />
        {children}
        <Toaster position="bottom-right" />
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || "G-9SFRSNL1KC"} />
        <GoogleAds />
        <MetaPixel />
        <CookieBanner />
        <Footer />
      </body>
    </html>
  );
}
