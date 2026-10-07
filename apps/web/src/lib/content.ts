/** Marketing content — Salesforce-grade structure, QuickPOS-true capabilities only. */

export const IMPACT = [
  { value: 3, suffix: "×", label: "Faster checkout in peak hours" },
  { value: 40, suffix: "%", label: "More repeat visits with loyalty" },
  { value: 5, suffix: " min", label: "Average store setup" },
] as const;

export const PROBLEMS = [
  {
    title: "Stockouts hide until the shelf is empty",
    body: "Paper counts and delayed spreadsheets leave gaps during peak hours.",
  },
  {
    title: "Checkout slows when the floor gets busy",
    body: "Fragmented tools force cashiers to juggle barcodes, discounts, and receipts.",
  },
  {
    title: "Owners fly blind across locations",
    body: "Sales, staff, and inventory live in different places—decisions wait until tomorrow.",
  },
] as const;

/** Salesforce-style benefits triad */
export const BENEFITS = [
  {
    id: "operations",
    title: "Streamline operations",
    body: "One connected system for inventory, customer accounts, and transactions—so the floor and the office share the same truth.",
    points: [
      "Manage sales, stock, and customers in one ledger",
      "Automate stock updates after every sale",
      "Cloud access across devices and locations",
      "Consistent workflows and reporting for every shift",
    ],
  },
  {
    id: "experience",
    title: "Enhance the customer experience",
    body: "Fast checkout and remembered customers turn peak hours into smoother service—not longer queues.",
    points: [
      "Barcode-first, secure transactions at the counter",
      "Live stock awareness before you promise a sale",
      "Print or WhatsApp digital receipts instantly",
      "Loyalty and purchase history at the cashier’s fingertips",
      "Khata / udhaar that stays attached to the customer",
    ],
  },
  {
    id: "decisions",
    title: "Make smarter, data-driven decisions",
    body: "Turn every sale into insight—sales, product movement, and staff performance without waiting on a bookkeeper.",
    points: [
      "Reports on sales, inventory, and staff performance",
      "See top products and category trends",
      "Spot buying patterns that drive reorders",
      "Export when accounting or partners need a file",
    ],
  },
] as const;

/** Traditional vs cloud vs modern — educational, like Salesforce */
export const POS_TYPES = [
  {
    name: "Traditional POS",
    body: "Installed onsite on fixed terminals. Reliable for one counter, but updates and backups are manual—and multi-store is painful.",
  },
  {
    name: "Cloud POS",
    body: "Data lives online with remote access and automatic backup. Ideal when you need the same truth across devices and locations.",
  },
  {
    name: "Modern QuickPOS",
    body: "Cloud software that runs on the devices you already use—desktop, tablet, or phone—with inventory, loyalty, taxes, and reports built in.",
  },
] as const;

export const WORKFLOW = [
  {
    step: "01",
    title: "Ring the sale",
    body: "Scan, discount, split tender, print or WhatsApp the receipt.",
  },
  {
    step: "02",
    title: "Stock moves with you",
    body: "Every sale adjusts inventory. Low-stock alerts fire before you miss demand.",
  },
  {
    step: "03",
    title: "Know the customer",
    body: "Khata, loyalty, and purchase history stay attached to the person—not a notebook.",
  },
  {
    step: "04",
    title: "Read the day",
    body: "Live sales, margins, and store comparisons without waiting on a bookkeeper.",
  },
] as const;

/** How a sale flows through the system */
export const HOW_IT_WORKS = [
  {
    title: "Transaction recorded",
    body: "Cashier scans or searches products, applies discounts and tax, then settles cash, card, or split tender.",
  },
  {
    title: "Inventory updates",
    body: "Stock levels move with the sale. Low-stock thresholds can alert you before the shelf goes empty.",
  },
  {
    title: "Customer remembered",
    body: "If a profile is attached, purchase history, loyalty, and khata balances stay current.",
  },
  {
    title: "Reports stay live",
    body: "Owners see sales, product movement, and staff activity the same day—not after a spreadsheet merge.",
  },
] as const;

export const MODULES = [
  {
    id: "pos",
    title: "Checkout",
    body: "Barcode-first selling with hold carts, discounts, taxes, and split tender.",
  },
  {
    id: "products",
    title: "Products & catalog",
    body: "SKUs, barcodes, categories, pricing, and bulk-friendly product control.",
  },
  {
    id: "inventory",
    title: "Inventory",
    body: "Live stock, adjustments, history, expiry awareness, and low-stock alerts.",
  },
  {
    id: "alerts",
    title: "Alerts",
    body: "Low-stock and expiry signals so the floor acts before the shelf goes empty.",
  },
  {
    id: "customers",
    title: "Customers",
    body: "Profiles, udhaar/khata, loyalty, and purchase history at the counter.",
  },
  {
    id: "payments",
    title: "Payments & sessions",
    body: "Cash, card, split pay, and cash-session discipline for every shift.",
  },
  {
    id: "receipts",
    title: "Receipts",
    body: "Print, email, or WhatsApp branded receipts in one flow.",
  },
  {
    id: "transactions",
    title: "Transactions",
    body: "Searchable sale history for refunds, audits, and end-of-day checks.",
  },
  {
    id: "reports",
    title: "Reports",
    body: "Day, product, category, and staff performance—export when you need it.",
  },
  {
    id: "team",
    title: "Team & permissions",
    body: "Role-based access so cashiers, managers, and owners see the right screens.",
  },
  {
    id: "settings",
    title: "Store settings",
    body: "Taxes, categories, suppliers, branding, and store profile in one place.",
  },
  {
    id: "multistore",
    title: "Multi-store",
    body: "Shared catalog model and owner visibility across branches on Premium.",
  },
] as const;

/** Capability matrix for Features page — maps to live POS modules */
export const FEATURE_GROUPS = [
  {
    title: "Sales & checkout",
    items: [
      { name: "Barcode scan & quick search", detail: "Find products in seconds under peak pressure." },
      { name: "Discounts & taxes", detail: "Apply line or cart discounts with configured tax rates." },
      { name: "Hold & recall carts", detail: "Park a sale, serve the next customer, resume cleanly." },
      { name: "Split tender", detail: "Combine cash and card on one ticket." },
      { name: "Cash sessions", detail: "Open and close shifts with clearer cash discipline." },
      { name: "Transaction history", detail: "Look up past sales for audits and customer follow-ups." },
    ],
  },
  {
    title: "Products & inventory",
    items: [
      { name: "Product catalog", detail: "SKUs, barcodes, prices, images, and categories in one list." },
      { name: "Real-time stock after every sale", detail: "The shelf number matches what just sold." },
      { name: "Low-stock alerts", detail: "Thresholds fire before you lose the sale." },
      { name: "Expiry awareness", detail: "Catch aging stock before it becomes waste." },
      { name: "Adjustments & audit history", detail: "Know who changed stock and why." },
      { name: "Bulk-friendly updates", detail: "Adjust many items without spreadsheet chaos." },
    ],
  },
  {
    title: "Customers, khata & loyalty",
    items: [
      { name: "Unlimited customer profiles", detail: "History travels with the shopper, not a notebook." },
      { name: "Khata / udhaar", detail: "Credit balances that stay attached to the customer." },
      { name: "Loyalty points", detail: "Rewards cashiers can apply without a second app." },
      { name: "Purchase history", detail: "Reorder and recommend with context at the counter." },
    ],
  },
  {
    title: "Receipts & payments",
    items: [
      { name: "Print receipts", detail: "Layouts ready for counter printers." },
      { name: "WhatsApp & email receipts", detail: "Digital proof without retyping." },
      { name: "Custom branding", detail: "Store name and logo on the ticket customers keep." },
      { name: "Cash, card & split", detail: "Record every tender method on the sale." },
    ],
  },
  {
    title: "Reports & exports",
    items: [
      { name: "Live sales views", detail: "Day and period performance without waiting overnight." },
      { name: "Top products & categories", detail: "See what moves—and what sits." },
      { name: "Staff performance", detail: "Understand who rings what on busy shifts." },
      { name: "Export", detail: "CSV / structured exports when accounting asks." },
    ],
  },
  {
    title: "Team, settings & multi-store",
    items: [
      { name: "Role-based permissions", detail: "Cashiers sell; managers adjust; owners see everything." },
      { name: "Multi-user access", detail: "Invite staff without sharing one login." },
      { name: "Taxes, categories & suppliers", detail: "Configure the store once; sell every day." },
      { name: "Cloud backup", detail: "Your ledger isn’t trapped on one PC." },
      { name: "Multi-store visibility", detail: "Premium: one owner view across branches." },
      { name: "Works on any modern device", detail: "Desktop, tablet, or phone—browser-based." },
    ],
  },
] as const;

/** Starter vs Premium matrix */
export const PLAN_COMPARE = [
  { feature: "Products", starter: "Up to 50", premium: "Unlimited" },
  { feature: "Transactions", starter: "Unlimited", premium: "Unlimited" },
  { feature: "Users", starter: "Core users", premium: "Unlimited staff" },
  { feature: "Stores", starter: "1", premium: "Unlimited" },
  { feature: "POS checkout", starter: "Included", premium: "Included" },
  { feature: "Inventory & alerts", starter: "Included", premium: "Included" },
  { feature: "Customers & khata", starter: "Included", premium: "Included" },
  { feature: "Loyalty", starter: "Basic", premium: "Full program" },
  { feature: "Analytics", starter: "Basic", premium: "Advanced + export" },
  { feature: "Role permissions", starter: "Core", premium: "Full" },
  { feature: "Custom receipts", starter: "Included", premium: "Included" },
  { feature: "Support", starter: "Standard", premium: "Priority WhatsApp" },
  { feature: "Migration help", starter: "—", premium: "Included" },
] as const;

export const HARDWARE = [
  { name: "Tablet or laptop", body: "Any modern browser—no proprietary terminal required." },
  { name: "Barcode scanner", body: "USB or Bluetooth scanners cashiers already know." },
  { name: "Receipt printer", body: "Thermal printers for branded tickets." },
  { name: "Cash drawer", body: "Optional—pair with your existing drawer hardware." },
  { name: "Card reader", body: "Use your existing card acceptance; record tender in QuickPOS." },
] as const;

export const IMPLEMENTATION = [
  {
    step: "01",
    title: "Define the goal",
    body: "Faster checkout, accurate stock, multi-store visibility—or all three. We size the plan to that.",
  },
  {
    step: "02",
    title: "Create the store",
    body: "Sign up free, add store details, logo, tax rates, and categories.",
  },
  {
    step: "03",
    title: "Import the catalog",
    body: "Add products manually or with Premium migration help from Excel / CSV.",
  },
  {
    step: "04",
    title: "Train the floor",
    body: "Invite staff with roles. Most cashiers are productive the same day.",
  },
  {
    step: "05",
    title: "Go live & optimize",
    body: "Sell, watch low-stock alerts, and tune reports after the first busy weekend.",
  },
] as const;

export const INDUSTRIES = [
  {
    title: "Grocery & general trade",
    body: "High SKU velocity, barcode density, tight margins.",
    image: "/marketing/snapshot-inventory.webp",
  },
  {
    title: "Fashion & boutique",
    body: "Variants, seasonal buys, loyalty that brings them back.",
    image: "/marketing/showcase-loyalty.webp",
  },
  {
    title: "F&B counters",
    body: "Fast tickets, modifiers, and clear shift reporting.",
    image: "/marketing/snapshot-checkout.webp",
  },
  {
    title: "Pharmacy & specialty",
    body: "Controlled inventory and cleaner audit trails.",
    image: "/marketing/feature-receipts.webp",
  },
  {
    title: "Electronics & wholesale desks",
    body: "Higher ticket sizes, serials-friendly workflows, owner reporting.",
    image: "/marketing/showcase-analytics.webp",
  },
  {
    title: "Multi-branch retail",
    body: "One catalog model and a single owner view across cities.",
    image: "/marketing/about-store.webp",
  },
] as const;

export const CASES = [
  {
    name: "Hassan General Store",
    city: "Multan",
    result: "Checkout 3× faster in peak evenings",
    quote:
      "Inventory alerts stopped the stock-outs that used to hit us every Friday.",
  },
  {
    name: "Fatima Boutique",
    city: "Karachi",
    result: "Staff live in a day, not a week",
    quote:
      "Reports finally tell me what to reorder—without exporting three sheets.",
  },
  {
    name: "Ali Mart Chain",
    city: "3 cities",
    result: "One view across every counter",
    quote:
      "I see sales, stock, and staff without calling each store manager.",
  },
] as const;

export const TESTIMONIALS = [
  {
    quote:
      "QuickPOS transformed how we run our store. Checkout is 3× faster, and inventory alerts saved us during peak season.",
    name: "Ahmed Hassan",
    role: "Owner, Hassan General Store, Multan",
  },
  {
    quote:
      "My staff picked it up in a day. The reports help me make better buying decisions every week.",
    name: "Fatima Khan",
    role: "Founder, Fatima Boutique, Karachi",
  },
  {
    quote:
      "Loyalty alone paid for the subscription. Repeat customers are up sharply—and WhatsApp receipts are a hit.",
    name: "Muhammad Bilal",
    role: "Owner, Bilal Supermarket, Islamabad",
  },
] as const;

export const FAQS = [
  {
    q: "What is a POS system?",
    a: "A point-of-sale system combines software (and usually counter hardware) to process sales, update inventory, manage customers, and report performance—replacing a standalone cash register.",
  },
  {
    q: "Is QuickPOS only for retail stores?",
    a: "No. Grocery, fashion, pharmacy, electronics, wholesale desks, and F&B counters all run on QuickPOS. Anything with a counter that needs stock truth and fast checkout fits.",
  },
  {
    q: "What’s the difference between traditional and cloud POS?",
    a: "Traditional POS sits on a local PC or server. Cloud POS like QuickPOS keeps your ledger online—so you can access sales, stock, and customers from another device or another branch.",
  },
  {
    q: "How fast can we go live?",
    a: "Most single stores finish setup in under an hour—products, users, and first sale the same day.",
  },
  {
    q: "Does QuickPOS work offline?",
    a: "QuickPOS is cloud-first for real-time sync. Checkout is designed to keep the floor moving through brief network dips; full offline mode for Premium is on the roadmap.",
  },
  {
    q: "Can I run multiple stores?",
    a: "Yes. Premium covers multi-store visibility so owners see sales and stock without juggling spreadsheets.",
  },
  {
    q: "How much does QuickPOS cost?",
    a: "Starter is free forever for one store with core POS, inventory, and customers. Premium is a custom quote based on stores, staff, and onboarding—no surprise transaction fees from us.",
  },
  {
    q: "Do I need special hardware?",
    a: "No proprietary terminal. Use a laptop or tablet, plus optional barcode scanner, receipt printer, and cash drawer you already own or can buy locally.",
  },
  {
    q: "Can a POS help with customer loyalty?",
    a: "Yes. QuickPOS includes customer profiles, purchase history, and loyalty points cashiers can use at checkout—plus WhatsApp receipts customers actually keep.",
  },
  {
    q: "Do you help with migration?",
    a: "Yes—Premium includes help importing product lists and training cashiers so you are not alone on day one.",
  },
] as const;

export const COST_BREAKDOWN = [
  {
    title: "Software",
    body: "Starter is free. Premium is a clear monthly/annual quote—no hidden POS licensing surprises.",
  },
  {
    title: "Hardware",
    body: "Bring your own laptop/tablet, scanner, and printer. We don’t lock you into proprietary terminals.",
  },
  {
    title: "Payments",
    body: "Use your existing card acceptance. QuickPOS records tender; your bank/processor sets card fees.",
  },
  {
    title: "Onboarding",
    body: "Self-serve on Starter. Premium includes migration help and staff training.",
  },
] as const;

export const PRICING = {
  starter: {
    name: "Starter",
    price: "Free",
    tagline: "One store. Core floor tools.",
    features: [
      "POS checkout (scan, discount, tax)",
      "Inventory + low-stock alerts",
      "Customer profiles & khata",
      "Print & WhatsApp receipts",
      "1 store · core users",
    ],
  },
  premium: {
    name: "Premium",
    price: "Custom",
    tagline: "Multi-store ops with full reporting.",
    features: [
      "Everything in Starter",
      "Advanced analytics & exports",
      "Multi-store dashboard",
      "Loyalty program",
      "Priority onboarding & WhatsApp support",
    ],
  },
} as const;

/** Comparison table — traditional vs QuickPOS */
export const COMPARISON = [
  { feature: "Setup time", traditional: "Weeks + installer", quickpos: "Minutes, browser-based" },
  { feature: "Upfront software cost", traditional: "High license fees", quickpos: "Rs 0 on Starter" },
  { feature: "Works on any device", traditional: "Often fixed terminal", quickpos: "Laptop, tablet, phone" },
  { feature: "Real-time stock", traditional: "Manual / delayed", quickpos: "Updates with every sale" },
  { feature: "Cloud backup", traditional: "Extra or none", quickpos: "Built-in" },
  { feature: "Multi-store view", traditional: "Expensive add-on", quickpos: "Premium included" },
  { feature: "Loyalty & khata", traditional: "Separate tools", quickpos: "Built into checkout" },
  { feature: "Support", traditional: "Ticket queues", quickpos: "WhatsApp-first on Premium" },
] as const;
