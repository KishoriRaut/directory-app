import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Khojix - Professional Directory",
  description: "Connect with trusted professionals in your area. Find engineers, plumbers, electricians, designers, and more.",
  keywords: "professional directory, find professionals, local services, khojix",
  authors: [{ name: "Siscora" }],
  creator: "Siscora",
  publisher: "Siscora",
  manifest: "/manifest.json",
  themeColor: "#4f46e5",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
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
