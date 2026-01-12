import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Professional Directory",
  description: "Find trusted professionals in your area",
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
