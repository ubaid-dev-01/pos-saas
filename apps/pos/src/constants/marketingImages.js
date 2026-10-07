/** Real marketing photography   served from /public/marketing */
export const MARKETING_IMAGES = {
  hero: "/marketing/hero-live-snapshot.jpg",
  checkout: "/marketing/snapshot-checkout.jpg",
  customers: "/marketing/snapshot-customers.jpg",
  inventory: "/marketing/snapshot-inventory.jpg",
  payment: "/marketing/snapshot-payment.jpg",
  analytics: "/marketing/showcase-analytics.jpg",
  loyalty: "/marketing/showcase-loyalty.jpg",
  receipts: "/marketing/feature-receipts.jpg",
  team: "/marketing/feature-team.jpg",
  aboutStore: "/marketing/about-store.jpg",
  stepProducts: "/marketing/feature-receipts.jpg",
  testimonials: {
    ahmed: "/marketing/testimonial-ahmed.jpg",
    fatima: "/marketing/testimonial-fatima.jpg",
    bilal: "/marketing/testimonial-ahmed.jpg",
    sara: "/marketing/testimonial-fatima.jpg",
    usman: "/marketing/testimonial-ahmed.jpg",
    ayesha: "/marketing/testimonial-fatima.jpg",
  },
};

export const FEATURE_IMAGES = [
  { title: "Lightning-Fast Checkout", image: MARKETING_IMAGES.checkout },
  { title: "Real-Time Inventory", image: MARKETING_IMAGES.payment },
  { title: "Customer Management", image: MARKETING_IMAGES.loyalty },
  { title: "Powerful Analytics", image: MARKETING_IMAGES.analytics },
  { title: "Smart Receipts", image: MARKETING_IMAGES.receipts },
  { title: "Multi-User Access", image: MARKETING_IMAGES.team },
];

export const SHOWCASE_IMAGES = {
  pos: MARKETING_IMAGES.checkout,
  inventory: MARKETING_IMAGES.inventory,
  analytics: MARKETING_IMAGES.analytics,
  customers: MARKETING_IMAGES.loyalty,
};

export const BUILT_FOR_IMAGES = [
  { title: "Built for the floor", image: MARKETING_IMAGES.checkout },
  { title: "Built for the owner", image: MARKETING_IMAGES.payment },
  { title: "Built for growth", image: MARKETING_IMAGES.aboutStore },
];

export const STEP_IMAGES = [
  MARKETING_IMAGES.team,
  MARKETING_IMAGES.aboutStore,
  MARKETING_IMAGES.stepProducts,
  MARKETING_IMAGES.checkout,
];

export const FEATURE_PAGE_IMAGES = {
  pos: MARKETING_IMAGES.checkout,
  inventory: MARKETING_IMAGES.inventory,
  customers: MARKETING_IMAGES.loyalty,
  reports: MARKETING_IMAGES.analytics,
  users: MARKETING_IMAGES.team,
  payments: MARKETING_IMAGES.payment,
  receipts: MARKETING_IMAGES.receipts,
  multistore: MARKETING_IMAGES.aboutStore,
};
