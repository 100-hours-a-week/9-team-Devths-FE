import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';

import ToastHost from '@/components/common/ToastHost';
import QueryProvider from '@/providers/QueryProvider';

import type { Metadata } from 'next';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

const GOOGLE_SITE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const NAVER_SITE_VERIFICATION = process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION;

const verification: Metadata['verification'] = {
  ...(GOOGLE_SITE_VERIFICATION ? { google: GOOGLE_SITE_VERIFICATION } : {}),
  ...(NAVER_SITE_VERIFICATION ? { other: { naver: NAVER_SITE_VERIFICATION } } : {}),
};

export const metadata: Metadata = {
  title: 'Devths',
  description: 'Devths 서비스 공식 홈페이지',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Devths',
  },
  icons: {
    apple: '/icons/apple-touch-icon.png',
  },
  ...(Object.keys(verification).length > 0 ? { verification } : {}),
};

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/icons/Devths2.png" as="image" type="image/png" />
        <link rel="preload" href="/images/background.webp" as="image" type="image/webp" />
        <link rel="preconnect" href="https://devths-storage-prod.s3.ap-northeast-2.amazonaws.com" />
        <meta name="theme-color" content="#3AB569" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {GA_MEASUREMENT_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="lazyOnload"
            />
            <Script id="ga-init" strategy="lazyOnload">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`}
            </Script>
          </>
        ) : null}
        <QueryProvider>
          {children}
          <ToastHost />
        </QueryProvider>
      </body>
    </html>
  );
}
