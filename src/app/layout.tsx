import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'),
  title: {
    default: "Khojix - Professional Directory | Find Trusted Professionals Near You",
    template: "%s | Khojix"
  },
  description: "Connect with trusted professionals in your area. Find engineers, plumbers, electricians, designers, lawyers, accountants, and more. Browse verified professionals with ratings and reviews.",
  keywords: ["professional directory", "find professionals", "local services", "khojix", "directory app", "service providers", "verified professionals", "local business directory"],
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
    siteName: "Khojix",
    title: "Khojix - Professional Directory | Find Trusted Professionals Near You",
    description: "Connect with trusted professionals in your area. Find engineers, plumbers, electricians, designers, and more.",
    images: [
      {
        url: "/og-image.png", // You'll need to create this
        width: 1200,
        height: 630,
        alt: "Khojix - Professional Directory",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Khojix - Professional Directory",
    description: "Connect with trusted professionals in your area. Find engineers, plumbers, electricians, designers, and more.",
    images: ["/og-image.png"], // You'll need to create this
  },
  alternates: {
    canonical: "/",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Khojix",
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
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
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4f46e5" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Khojix" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
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
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
