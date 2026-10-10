import { FAQ_ITEMS } from "@/lib/seo/faq";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tithi-calculator.vercel.app";

export function JsonLd() {
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const app = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Barshik Date Calculator",
    url: SITE,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Any",
    description:
      "Hindu death anniversary tithi calculator for Barshik / Barkhanta and annual shraddha, including Adhik Maas and local sunrise.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(app) }} />
    </>
  );
}
