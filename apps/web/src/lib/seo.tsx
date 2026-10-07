import type { Metadata } from "next";
import { CONTACT, SITE_URL } from "./site";

type BuildMetaInput = {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  /** Absolute document title (do not append brand suffix). */
  absoluteTitle?: boolean;
  robots?: Metadata["robots"];
  ogImage?: string;
};

export function absoluteUrl(path = "") {
  const base = SITE_URL.replace(/\/$/, "");
  const p = path.startsWith("/") || path === "" ? path : `/${path}`;
  return `${base}${p}`;
}

export function buildMetadata({
  title,
  description,
  path = "",
  keywords = [],
  absoluteTitle = false,
  robots,
  ogImage = "/brand/og-image.png",
}: BuildMetaInput): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = absoluteTitle || !path ? title : `${title} · QuickPOS`;
  const imageUrl = ogImage.startsWith("http") ? ogImage : absoluteUrl(ogImage);

  return {
    title: fullTitle,
    description,
    keywords: keywords.length ? keywords : undefined,
    alternates: { canonical: url },
    robots,
    openGraph: {
      type: "website",
      locale: "en_PK",
      url,
      title: fullTitle,
      description,
      siteName: "QuickPOS",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: "QuickPOS — retail POS for Pakistan",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [imageUrl],
    },
  };
}

/** Safe JSON-LD embed (prevents </script> breakout). */
export function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[];
}) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

export function faqPageLd(
  faqs: readonly { q: string; a: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };
}

export function breadcrumbLd(
  items: readonly { name: string; path: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function organizationLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${absoluteUrl()}/#organization`,
    name: "QuickPOS",
    url: absoluteUrl(),
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/brand/mark.svg"),
    },
    image: absoluteUrl("/brand/og-image.png"),
    email: CONTACT.email,
    telephone: CONTACT.phoneLink.replace("tel:", ""),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Multan",
      addressCountry: "PK",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+92-325-6482932",
        contactType: "sales",
        areaServed: "PK",
        availableLanguage: ["English", "Urdu"],
      },
    ],
    sameAs: [],
  };
}

/**
 * SoftwareApplication for entity understanding.
 * No AggregateRating — Google requires genuine ratings/reviews for rich results;
 * we do not invent them (Search Central SoftwareApplication docs).
 */
export function softwareApplicationLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": ["SoftwareApplication", "WebApplication"],
    "@id": `${absoluteUrl()}/#software`,
    name: "QuickPOS",
    url: absoluteUrl(),
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web browser",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "PKR",
      description: "Starter plan free for one store",
      url: absoluteUrl("/pricing"),
    },
    description:
      "Cloud point of sale for retail checkout, inventory, customers, khata, and reports—built for Pakistan stores.",
    featureList: [
      "Barcode checkout",
      "Live inventory",
      "Customer khata and loyalty",
      "Sales and staff reports",
      "WhatsApp receipts",
      "Role-based team access",
      "Multi-store (Premium)",
    ],
    screenshot: absoluteUrl("/brand/og-image.png"),
    image: absoluteUrl("/brand/og-image.png"),
    publisher: { "@id": `${absoluteUrl()}/#organization` },
  };
}

export function websiteLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${absoluteUrl()}/#website`,
    name: "QuickPOS",
    url: absoluteUrl(),
    publisher: { "@id": `${absoluteUrl()}/#organization` },
    inLanguage: "en-PK",
  };
}

export function localBusinessLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${absoluteUrl()}/#local`,
    name: "QuickPOS",
    url: absoluteUrl(),
    image: absoluteUrl("/brand/og-image.png"),
    telephone: "+92-325-6482932",
    email: CONTACT.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Multan",
      addressRegion: "Punjab",
      addressCountry: "PK",
    },
    areaServed: {
      "@type": "Country",
      name: "Pakistan",
    },
    parentOrganization: { "@id": `${absoluteUrl()}/#organization` },
  };
}
