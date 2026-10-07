export const SITE_URL = "https://pos-saas-kappa.vercel.app";

export const MEGA_NAV = {
  platform: {
    label: "Platform",
    columns: [
      {
        title: "Commerce core",
        links: [
          { to: "/features#billing", label: "Checkout & billing", desc: "Scan, pay, receipt in seconds" },
          { to: "/features#inventory", label: "Inventory", desc: "Live stock across every shelf" },
          { to: "/features#purchasing", label: "Purchasing", desc: "Restock before you run out" },
        ],
      },
      {
        title: "Growth",
        links: [
          { to: "/features#crm", label: "Customers & CRM", desc: "History, loyalty, follow-ups" },
          { to: "/features#analytics", label: "Analytics", desc: "Margins, trends, branch view" },
          { to: "/features#loyalty", label: "Loyalty", desc: "Turn shoppers into regulars" },
        ],
      },
      {
        title: "Operations",
        links: [
          { to: "/features#employees", label: "Employees", desc: "Roles, permissions, activity" },
          { to: "/features#multi-store", label: "Multi-store", desc: "One OS for every branch" },
          { to: "/features#accounting", label: "Reporting", desc: "Export-ready business truth" },
        ],
      },
    ],
  },
  industries: {
    label: "Industries",
    links: [
      { to: "/#industries", label: "Retail & general stores" },
      { to: "/#industries", label: "Grocery & supermarket" },
      { to: "/#industries", label: "Pharmacy" },
      { to: "/#industries", label: "Fashion & garments" },
      { to: "/#industries", label: "Electronics" },
      { to: "/#industries", label: "Wholesale" },
      { to: "/#industries", label: "Restaurant & QSR" },
    ],
  },
  solutions: {
    label: "Solutions",
    links: [
      { to: "/features", label: "Replace spreadsheets" },
      { to: "/features#multi-store", label: "Multi-branch control" },
      { to: "/pricing", label: "Start free, scale later" },
      { to: "/contact", label: "Migration & onboarding" },
    ],
  },
};

export const TRUST_SECTORS = [
  "General retail",
  "Fashion",
  "Grocery",
  "Pharmacy",
  "Electronics",
  "Wholesale",
  "Multi-branch groups",
  "Specialty stores",
];

export const HOME_PROBLEMS = [
  {
    title: "Inventory that lies",
    body: "The till says in stock. The shelf is empty. Every mismatch costs a sale — and trust.",
    image: "/marketing/snapshot-inventory.webp",
  },
  {
    title: "Queues that kill margin",
    body: "Slow checkout turns peak hours into lost revenue. Staff guess. Customers leave.",
    image: "/marketing/snapshot-checkout.webp",
  },
  {
    title: "Billing stuck in notebooks",
    body: "Manual bills, missing discounts, and no audit trail when something goes wrong.",
    image: "/marketing/snapshot-payment.webp",
  },
  {
    title: "Reports that arrive too late",
    body: "Owners wait for end-of-day spreadsheets instead of seeing the business live.",
    image: "/marketing/showcase-analytics.webp",
  },
  {
    title: "Human error at scale",
    body: "Wrong prices, forgotten returns, and staff without clear permissions.",
    image: "/marketing/feature-team.webp",
  },
];

export const HOME_WORKFLOW = [
  {
    step: "01",
    title: "Sell with certainty",
    body: "Scan, search, discount, and settle — cash, card, or split — without leaving the counter.",
  },
  {
    step: "02",
    title: "Stock stays honest",
    body: "Every sale updates inventory instantly. Low-stock alerts fire before the shelf goes dark.",
  },
  {
    step: "03",
    title: "Customers become regulars",
    body: "Profiles, purchase history, and loyalty points travel with every receipt — including WhatsApp.",
  },
  {
    step: "04",
    title: "Owners see the truth",
    body: "Sales, margins, and branch performance in one operating view — not five disconnected tools.",
  },
];

export const HOME_MODULES = [
  {
    id: "billing",
    title: "Checkout & billing",
    body: "A counter built for speed: barcode scanning, hold carts, multi-tender payments, and branded receipts.",
    image: "/marketing/snapshot-checkout.webp",
    points: ["Barcode & quick search", "Split payments", "Hold & recall", "Print / WhatsApp receipts"],
  },
  {
    id: "inventory",
    title: "Inventory",
    body: "One stock truth from warehouse to till — with thresholds, history, and bulk adjustments.",
    image: "/marketing/snapshot-inventory.webp",
    points: ["Live stock levels", "Low-stock alerts", "Audit trail", "Bulk adjustments"],
  },
  {
    id: "crm",
    title: "Customers & CRM",
    body: "Know who buys what. Build relationships that survive staff changes and busy weekends.",
    image: "/marketing/snapshot-customers.webp",
    points: ["Unlimited profiles", "Purchase history", "Contact records", "Follow-up ready"],
  },
  {
    id: "analytics",
    title: "Analytics & reporting",
    body: "See top products, margins, and trends early enough to act — then export when finance asks.",
    image: "/marketing/showcase-analytics.webp",
    points: ["Live dashboards", "Margin insight", "Period comparisons", "CSV / PDF export"],
  },
  {
    id: "multi-store",
    title: "Multi-store",
    body: "Add branches without changing how the business thinks about products, staff, or reporting.",
    image: "/marketing/about-store.webp",
    points: ["Shared catalog model", "Branch performance", "Central oversight", "Role-based access"],
  },
  {
    id: "purchasing",
    title: "Purchasing",
    body: "Restock from real demand signals — not gut feel — so capital stays in moving product.",
    image: "/marketing/snapshot-payment.webp",
    points: ["Demand-led restock", "Supplier-ready lists", "Stock history", "Threshold triggers"],
  },
  {
    id: "employees",
    title: "Employees",
    body: "Give cashiers speed and owners control — permissions that match real floor roles.",
    image: "/marketing/feature-team.webp",
    points: ["Role permissions", "Secure access", "Activity clarity", "Team scale"],
  },
  {
    id: "loyalty",
    title: "Loyalty",
    body: "Points and rewards that actually get used — because they live inside the checkout flow.",
    image: "/marketing/showcase-loyalty.webp",
    points: ["Points on purchase", "Repeat incentives", "Customer memory", "Receipt moments"],
  },
  {
    id: "accounting",
    title: "Business reporting",
    body: "Cleaner books start with cleaner sales data — structured exports finance teams can trust.",
    image: "/marketing/feature-receipts.webp",
    points: ["Structured sales data", "Tax-ready totals", "Export workflows", "Owner clarity"],
  },
];

export const HOME_INDUSTRIES = [
  { name: "Retail", blurb: "General stores that need speed and stock truth." },
  { name: "Grocery", blurb: "High SKU count, fast queues, waste-sensitive." },
  { name: "Pharmacy", blurb: "Controlled inventory with audit discipline." },
  { name: "Fashion", blurb: "Variants, seasons, and loyal repeat buyers." },
  { name: "Electronics", blurb: "High-value SKUs and strict staff permissions." },
  { name: "Wholesale", blurb: "Bulk carts and customer-led purchasing." },
  { name: "Restaurant", blurb: "Counter speed when the line never stops." },
];

export const HOME_IMPACT = [
  { value: "3×", label: "Faster checkout reported by retailers" },
  { value: "40%", label: "Lift in repeat visits with loyalty" },
  { value: "99.9%", label: "Platform availability target" },
  { value: "500+", label: "Stores already operating on QuickPOS" },
];

export const HOME_CASES = [
  {
    title: "From stockouts to shelf confidence",
    business: "Hassan General Store · Multan",
    outcome: "Peak-season stockouts dropped after live inventory alerts replaced end-of-day counts.",
    metric: "3× faster checkout",
    image: "/marketing/testimonial-ahmed.webp",
  },
  {
    title: "Buying decisions backed by data",
    business: "Fatima Boutique · Karachi",
    outcome: "Weekly reports replaced guesswork — staff learned the counter in a day.",
    metric: "Same-day staff ramp",
    image: "/marketing/testimonial-fatima.webp",
  },
  {
    title: "Loyalty that shows up in the till",
    business: "Bilal Supermarket · Islamabad",
    outcome: "WhatsApp receipts and points turned casual shoppers into weekly regulars.",
    metric: "+40% repeat customers",
    image: "/marketing/showcase-loyalty.webp",
  },
];

export const HOME_HOTSPOTS = [
  { id: "scan", x: 18, y: 42, title: "Scan & search", body: "Find any SKU in a keystroke — barcode or name." },
  { id: "cart", x: 52, y: 38, title: "Living cart", body: "Discounts, holds, and split tenders without friction." },
  { id: "stock", x: 78, y: 58, title: "Stock truth", body: "Every sale writes back to inventory in real time." },
];
