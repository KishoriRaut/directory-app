import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Siscora Connect - Professional Directory",
  description: "Connect with trusted professionals in your area. Find doctors, engineers, plumbers, electricians and more.",
  keywords: "professional directory, find professionals, local services, siscora connect",
  authors: [{ name: "Siscora" }],
  creator: "Siscora",
  publisher: "Siscora",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
