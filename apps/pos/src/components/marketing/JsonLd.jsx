import { useEffect } from "react";
import { SITE_URL } from "../../constants/siteContent";

export default function JsonLd({ data, id = "quickpos-jsonld" }) {
  useEffect(() => {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("script");
      el.type = "application/ld+json";
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
    return () => {
      el?.remove();
    };
  }, [data, id]);

  return null;
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "QuickPOS",
    url: SITE_URL,
    logo: `${SITE_URL}/files/logo-full.svg`,
    description:
      "Retail commerce platform for checkout, inventory, customers, and multi-store operations.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Multan",
      addressCountry: "PK",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+92-325-6482932",
      contactType: "sales",
      availableLanguage: ["English", "Urdu"],
    },
  };
}

export function softwareSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "QuickPOS",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "PKR",
      description: "Starter plan free forever",
    },
    description:
      "Business operating system for retail — billing, inventory, CRM, analytics, and multi-branch control.",
    url: SITE_URL,
  };
}

export function faqSchema(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}
