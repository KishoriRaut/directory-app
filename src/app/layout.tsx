import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { initPerformanceMonitor } from "@/lib/performance-monitor";
import "./globals.css";

// Performance monitoring will be initialized client-side

// Optimize font loading with next/font
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  preload: true,
  variable: "--font-inter",
  fallback: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "system-ui", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'),
  title: {
    default: "Siscora Pro - Professional Service Directory | Find Trusted Professionals Near You",
    template: "%s | Siscora Pro"
  },
  description: "Connect with trusted professionals in your area. Find engineers, plumbers, electricians, designers, lawyers, accountants, and more. Browse verified professionals with ratings and reviews.",
  keywords: ["professional directory", "find professionals", "local services", "siscora pro", "directory app", "service providers", "verified professionals", "local business directory"],
  authors: [{ name: "Siscora" }],
  creator: "Siscora",
  publisher: "Siscora",
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Siscora Pro",
    title: "Siscora Pro - Professional Service Directory | Find Trusted Professionals Near You",
    description: "Connect with trusted professionals in your area. Find engineers, plumbers, electricians, designers, and more.",
    images: [
      {
        url: "/og-image.png", // You'll need to create this
        width: 1200,
        height: 630,
        alt: "Siscora Pro - Professional Service Directory",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Siscora Pro - Professional Service Directory",
    description: "Connect with trusted professionals in your area. Find engineers, plumbers, electricians, designers, and more.",
    images: ["/og-image.png"], // You'll need to create this
  },
  alternates: {
    canonical: "/",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Siscora Pro",
  },
  icons: {
    icon: [
      { url: "/vercel.svg", sizes: "any", type: "image/svg+xml" },
    ],
    apple: [],
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4f46e5" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Siscora Pro" />
        {/* DNS prefetch and preconnect for external resources - Performance optimization */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://piulmultzreflltuqaxs.supabase.co" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://piulmultzreflltuqaxs.supabase.co" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Remove browser extension attributes that cause hydration mismatch
                const attributesToRemove = [
                  'data-new-gr-c-s-check-loaded',
                  'data-gr-ext-installed',
                  'data-new-gr-c-s-loaded',
                  'data-gramm_id',
                  'data-gramm_editor'
                ];
                
                attributesToRemove.forEach(attr => {
                  if (document.body && document.body.hasAttribute(attr)) {
                    document.body.removeAttribute(attr);
                  }
                });
                
                // Unregister any stale service workers that might cause MIME type errors
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for(let registration of registrations) {
                      registration.unregister();
                    }
                  });
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`antialiased ${inter.className}`} suppressHydrationWarning>
        {/* Skip to main content link for keyboard navigation */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          aria-label="Skip to main content"
        >
          Skip to main content
        </a>
        
        {/* Aria live region for announcements */}
        <div 
          id="aria-live-region" 
          aria-live="polite" 
          aria-atomic="true" 
          className="sr-only"
        />
        
        {/* Initialize performance monitoring client-side only */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && window.initPerformanceMonitor) {
                window.initPerformanceMonitor();
              }
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
