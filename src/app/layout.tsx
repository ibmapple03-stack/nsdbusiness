import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import { SITE, siteUrl } from "@/lib/site";
import "./globals.css";

// Self-hosted at build time by next/font — no runtime requests to Google.
const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["500", "600", "700", "800"], display: "swap" });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: `${SITE.legalName} — Yola, Adamawa State`, template: `%s | ${SITE.name}` },
  description:
    "Practical business, vocational, entrepreneurial and digital skills training in Yola, Adamawa State, Nigeria.",
  applicationName: SITE.name,
  openGraph: { type: "website", locale: "en_NG", siteName: SITE.legalName },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#1e3a5f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-NG" className={`${poppins.variable} ${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only z-50 rounded-[var(--radius-sm)] bg-navy-900 px-4 py-2 font-medium text-white focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
