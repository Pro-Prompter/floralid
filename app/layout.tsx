import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Local fonts with display swap to avoid invisible text while loading
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

// Metadata configuration with direct viewport and themeColor settings
export const metadata: Metadata = {
  title: "FloralID - Identify and Care for Plants",
  description: "FloralID helps you identify plants and provides care tips.",
  keywords: "plants, plant identification, plant care, FloralID",
  creator: "Sajawal Mirza",
  applicationName: "FloralID",
  viewport: "width=device-width, initial-scale=1.0",
  themeColor: "#4CAF50", // Green theme color
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Your Name or Company" />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content="FloralID - Identify and Care for Plants" />
        <meta property="og:description" content="FloralID helps you identify plants and provides care tips." />
        <meta property="og:image" content="/path/to/your/og-image.jpg" />
        <meta property="og:url" content="https://yourwebsite.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@yourtwitterhandle" />
        <meta name="twitter:title" content="FloralID - Identify and Care for Plants" />
        <meta name="twitter:description" content="FloralID helps you identify plants and provides care tips." />
        <meta name="twitter:image" content="/path/to/your/twitter-image.jpg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-green-50 text-green-900`}
      >
        {children}
      </body>
    </html>
  );
}