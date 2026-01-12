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
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
