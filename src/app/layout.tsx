import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "./_components/site-header";
import { SiteFooter } from "./_components/site-footer";
import { DBProvider } from "./_components/db-provider";

export const metadata: Metadata = {
  title: "The Makers Archive — Fashion, held to account",
  description:
    "An archive of pieces that exist only because enough people wanted them to.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/*
          Fonts are loaded via Google Fonts CDN rather than next/font so the
          build doesn't require network access at compile time. In production
          on Vercel, switching to next/font (Playfair Display, Cormorant, Jost)
          will give you better LCP and zero CLS.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Cormorant:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <DBProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </DBProvider>
      </body>
    </html>
  );
}
