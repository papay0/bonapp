import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import { Geist, Geist_Mono } from "next/font/google";
import { Brand } from '@/lib/brand';
import { QueryProvider } from '@/lib/providers/query-provider';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${Brand.name} - ${Brand.tagline}`,
    template: `%s | ${Brand.name}`,
  },
  description: Brand.description,
  keywords: ['meal planning', 'recipes', 'weekly planner', 'cooking', 'food'],
  authors: [{ name: 'Arthur Papailhau' }],
  metadataBase: new URL(Brand.urls.production),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: Brand.urls.production,
    siteName: Brand.name,
    title: `${Brand.name} - ${Brand.tagline}`,
    description: Brand.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${Brand.name} - ${Brand.tagline}`,
    description: Brand.description,
    creator: Brand.social.twitter,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <QueryProvider>{children}</QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
