import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tithi-calculator.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Barshik Date Calculator | Hindu Death Anniversary Tithi",
    template: "%s",
  },
  description:
    "Calculate Barshik / Barkhanta and annual shraddha dates from a Nepali gatey or Gregorian date of passing. Accounts for Adhik Maas, local sunrise tithi, and Purnimanta vs Amanta.",
  keywords: [
    "barshik date calculator",
    "how to calculate barshik date",
    "hindu death anniversary tithi calculator",
    "barkhanta date calculator",
    "barshik date calculator after adhik maas",
    "how to find hindu death anniversary date",
    "annual shraddha tithi",
    "nepali tithi calculator",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Barshik Date Calculator | Hindu Death Anniversary Tithi",
    description:
      "Find Barkhanta and yearly shraddha on the death tithi, including Adhik Maas and sunrise adjustments.",
    type: "website",
    url: SITE,
  },
  twitter: {
    card: "summary",
    title: "Barshik Date Calculator",
    description: "Hindu death anniversary tithi, Barkhanta, and annual shraddha dates.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
