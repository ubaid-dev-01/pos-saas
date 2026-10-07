import {
  BUILT_FOR_IMAGES,
  FEATURE_IMAGES,
  SHOWCASE_IMAGES,
} from "../constants/marketingImages";

const FEATURE_CARD_KEYS = [
  "lightningCheckout",
  "realTimeInventory",
  "customerManagement",
  "powerfulAnalytics",
  "smartReceipts",
  "multiUser",
];

const BUILT_FOR_KEYS = ["floor", "owner", "growth"];

const SHOWCASE_CONFIG = [
  { id: "pos", reverse: false },
  { id: "inventory", reverse: true },
  { id: "analytics", reverse: false },
  { id: "customers", reverse: true },
];

const COMPARISON_ROW_KEYS = [
  "setupTime",
  "upfrontCost",
  "anyDevice",
  "realtimeSync",
  "cloudBackup",
  "support",
  "loyalty",
];

const PRICING_COMPARE_ROWS = [
  "products",
  "transactions",
  "users",
  "analytics",
  "loyalty",
  "support",
  "multiStore",
  "rolePermissions",
  "export",
  "customReceipt",
  "forecasting",
  "apiIntegration",
];

const LIMITED_STARTER_ROWS = new Set([
  "users",
  "analytics",
  "loyalty",
  "multiStore",
  "forecasting",
  "apiIntegration",
]);

/** Marketing nav links */
export function getNavItems(t) {
  return [
    { to: "/", label: t("nav.home") },
    { to: "/features", label: t("nav.features") },
    { to: "/pricing", label: t("nav.pricing") },
    { to: "/about", label: t("nav.about") },
    { to: "/contact", label: t("nav.contact") },
  ];
}

/** FAQ accordion items (10 entries) */
export function getFaqs(t) {
  return Array.from({ length: 10 }, (_, i) => ({
    q: t(`marketing.faq.${i}.q`),
    a: t(`marketing.faq.${i}.a`),
  }));
}

/** Testimonial carousel items (6 entries) */
export function getTestimonials(t) {
  return Array.from({ length: 6 }, (_, i) => ({
    quote: t(`marketing.testimonial.${i}.quote`),
    name: t(`marketing.testimonial.${i}.name`),
    role: t(`marketing.testimonial.${i}.role`),
  }));
}

/** Home feature cards tied to FEATURE_IMAGES */
export function getFeatureCards(t) {
  return FEATURE_IMAGES.map((item, i) => {
    const key = FEATURE_CARD_KEYS[i] || FEATURE_CARD_KEYS[0];
    return {
      title: t(`marketing.featureCard.${key}.title`),
      image: item.image,
      desc: t(`marketing.featureCard.${key}.desc`),
      imageClassName:
        key === "powerfulAnalytics" ? "brightness-110 contrast-110" : "",
    };
  });
}

/** Built-for section cards */
export function getBuiltForCards(t) {
  return BUILT_FOR_IMAGES.map((item, i) => {
    const key = BUILT_FOR_KEYS[i] || "floor";
    return {
      title: t(`marketing.builtFor.${key}.title`),
      image: item.image,
      alt: t(`marketing.builtFor.${key}.title`),
      desc: t(`marketing.builtFor.${key}.desc`),
    };
  });
}

/** Showcase rows (POS, inventory, analytics, customers) */
export function getShowcaseSections(t) {
  return SHOWCASE_CONFIG.map(({ id, reverse }) => ({
    reverse,
    title: t(`marketing.showcase.${id}.title`),
    imageAlt: t(`marketing.showcase.${id}.alt`),
    desc: t(`marketing.showcase.${id}.desc`),
    previewType: id,
    image: SHOWCASE_IMAGES[id],
    bullets: [0, 1, 2, 3].map((n) => t(`marketing.showcase.${id}.bullet${n}`)),
  }));
}

/** Home comparison table rows */
export function getComparisonTable(t) {
  return COMPARISON_ROW_KEYS.map((key) => ({
    feature: t(`marketing.comparison.${key}.feature`),
    traditional: t(`marketing.comparison.${key}.traditional`),
    quickpos: t(`marketing.comparison.${key}.quickpos`),
  }));
}

/** Starter & Premium plan summaries for pricing sections */
export function getPricingPlans(t, phone = "") {
  const starterFeatures = Array.from({ length: 8 }, (_, i) =>
    t(`marketing.pricing.starter.feature${i}`),
  );
  const premiumFeatures = Array.from({ length: 13 }, (_, i) =>
    t(`marketing.pricing.premium.feature${i}`),
  );

  return {
    starter: {
      badge: t("marketing.pricing.starter.badge"),
      price: t("marketing.pricing.starter.price"),
      period: t("marketing.pricing.starter.period"),
      tagline: t("marketing.pricing.starter.tagline"),
      cta: t("marketing.pricing.starter.cta"),
      features: starterFeatures,
    },
    premium: {
      badge: t("marketing.pricing.premium.badge"),
      popular: t("marketing.pricing.premium.popular"),
      price: t("marketing.pricing.premium.price"),
      tagline: t("marketing.pricing.premium.tagline"),
      callCta: t("marketing.pricing.premium.callCta", { phone }),
      whatsappCta: t("marketing.pricing.premium.whatsappCta"),
      features: premiumFeatures,
    },
    compareRows: PRICING_COMPARE_ROWS.map((row) => ({
      feature: t(`marketing.pricing.row.${row}`),
      starter: LIMITED_STARTER_ROWS.has(row)
        ? t("marketing.pricing.compare.limited")
        : t("marketing.pricing.compare.included"),
      premium: t("marketing.pricing.compare.included"),
    })),
  };
}
