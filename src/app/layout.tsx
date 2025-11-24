import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";

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
  title: "CopiéCollé",
  description: "Premium Product Mockups",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fontHeading.variable} ${fontBody.variable} font-sans antialiased`}
      >
        {children}
        <Footer />
      </body>
    </html>
  );
}
