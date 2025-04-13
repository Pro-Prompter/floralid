import type { Metadata, Viewport } from "next";
import localFont from 'next/font/local';
import "./globals.css";

// Local fonts with display swap to avoid invisible text while loading
const geistSans = localFont({
  src: [
    {
      path: '../public/fonts/GeistVF.woff',  // Updated path
      weight: '400',
      style: 'normal',
    }
  ],
  variable: '--font-geist-sans',
});

const geistMono = localFont({
  src: [
    {
      path: '../public/fonts/GeistMonoVF.woff',  // Updated path
      weight: '400',
      style: 'normal',
    }
  ],
  variable: '--font-geist-mono',
});

// Metadata configuration with direct viewport and themeColor settings
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  themeColor: '#4CAF50',
};

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_SITE_NAME,
  description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION,
  keywords: "plants, plant identification, plant care, FloralID",
  creator: "Sajawal Mirza",
  applicationName: "FloralID",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Sajawal Mirza" />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content={process.env.NEXT_PUBLIC_SITE_NAME} />
        <meta
          property="og:description"
          content={process.env.NEXT_PUBLIC_SITE_DESCRIPTION}
        />
        <meta property="og:image" content={process.env.NEXT_PUBLIC_OG_IMAGE} />
        <meta property="og:url" content={process.env.NEXT_PUBLIC_WEBSITE_URL} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:site"
          content={process.env.NEXT_PUBLIC_TWITTER_HANDLE}
        />
        <meta
          name="twitter:title"
          content={process.env.NEXT_PUBLIC_SITE_NAME}
        />
        <meta
          name="twitter:description"
          content={process.env.NEXT_PUBLIC_SITE_DESCRIPTION}
        />
        <meta
          name="twitter:image"
          content={process.env.NEXT_PUBLIC_TWITTER_IMAGE}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-green-50 text-green-900`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
