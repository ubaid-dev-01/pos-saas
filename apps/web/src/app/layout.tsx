import type { Metadata } from "next";
import { FloatingWhatsApp } from "@/components/marketing/FloatingWhatsApp";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import {
  JsonLd,
  buildMetadata,
  organizationLd,
  softwareApplicationLd,
  websiteLd,
} from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import "./globals.css";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});


export const metadata: Metadata = {
  ...buildMetadata({
    title: "QuickPOS — Cloud POS for retail stores in Pakistan",
    description:
      "Run checkout, inventory, customers, khata, and reports in one cloud POS. Free Starter for one store. Built for Pakistan retailers.",
    absoluteTitle: true,
    keywords: [
      "POS system Pakistan",
      "cloud POS",
      "point of sale software",
      "retail inventory software",
      "multi-store POS",
      "khata POS",
    ],
  }),
  metadataBase: new URL(SITE_URL),
  applicationName: "QuickPOS",
  authors: [{ name: "QuickPOS" }],
  creator: "QuickPOS",
  publisher: "QuickPOS",
  category: "business",
  icons: {
    icon: [
      { url: "/brand/mark.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/brand/manifest.webmanifest",
  formatDetection: {
    telephone: true,
    email: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-PK"
      className={`${plex.variable} ${plexMono.variable}`}
    >
      <body>
        <JsonLd
          data={[organizationLd(), websiteLd(), softwareApplicationLd()]}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-signal focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to main content
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
