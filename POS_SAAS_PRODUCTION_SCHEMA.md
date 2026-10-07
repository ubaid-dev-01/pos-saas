# 🏭 PRODUCTION-GRADE POS SaaS COMPLETE FIRESTORE SCHEMA & ARCHITECTURE

## Deep Research Document Firebase Multi-Tenant, Inventory, Expiry, Stock In/Out, Purchase Orders, Suppliers

> **Based on research from**: Shopify POS, Square POS, Lightspeed, IT Retail, Zoho Inventory, HDPOS Smart, ReadyPOS, Microsoft Dynamics 365, industry standards (ISO 22000, FIFO/FEFO), and Firebase multi-tenancy best practices.
>
> This document defines EVERY collection, sub-collection, document field, relationship, and business rule needed for a production SaaS POS system. No childish shortcuts this follows real-world retail, grocery, pharmacy, and general store inventory standards.

---

## 📐 ARCHITECTURE OVERVIEW

### Multi-Tenant Data Isolation Model

```
Firebase Project
├── users/{uid}                          ← Platform-level (all tenants)
├── stores/{storeId}                     ← Tenant root document
│   ├── /products/{productId}            ← Store-scoped
│   ├── /productBatches/{batchId}        ← Batch & expiry tracking
│   ├── /categories/{categoryId}
│   ├── /suppliers/{supplierId}
│   ├── /purchaseOrders/{poId}
│   ├── /goodsReceivedNotes/{grnId}
│   ├── /stockMovements/{movementId}     ← Every stock in/out event
│   ├── /transactions/{txnId}            ← Sales
│   ├── /transactionReturns/{returnId}   ← Sale returns
│   ├── /customers/{customerId}
│   ├── /expenses/{expenseId}
│   ├── /cashRegisterSessions/{sessionId}
│   ├── /auditLog/{logId}               ← Full audit trail
│   └── /alerts/{alertId}               ← System alerts
├── leads/{leadId}                       ← Landing page leads
├── platformConfig/{configId}            ← Super admin config
└── activityLog/{logId}                  ← Platform-level activity
```

### Why Sub-Collections Under `stores/`?

1. **Data isolation**: Firestore security rules scope all reads/writes to `stores/{storeId}/*`, making tenant isolation trivial
2. **Scalability**: Each store's data scales independently a store with 50K products doesn't slow down a store with 50
3. **Real-time listeners**: `onSnapshot` on `stores/{storeId}/products` only delivers that tenant's data
4. **Cost efficiency**: Firestore charges per read sub-collections prevent reading other tenants' data
5. **Security**: One rule blocks cross-tenant access: `request.auth.uid` must map to a user with matching `storeId`

---

## 🗄 COMPLETE COLLECTION SCHEMAS

---

### 1. `users/{uid}` Platform User Accounts

```javascript
{
  // Identity
  uid: "firebase-auth-uid",              // Firebase Auth UID (doc ID = UID)
  email: "user@example.com",             // Unique, lowercase
  displayName: "Muhammad Ali",
  phone: "+923001234567",
  avatarUrl: null,                        // Firebase Storage URL or null

  // Tenant Binding
  storeId: "store-abc123",               // Which store this user belongs to (null for superadmin)

  // Role & Access
  role: "cashier",                       // "superadmin" | "admin" | "manager" | "cashier"
  permissions: {                         // Granular per-module access (for manager/cashier)
    pos: true,
    products: true,
    inventory: false,
    purchases: false,                    // Purchase orders & GRNs
    transactions: true,
    reports: false,
    customers: true,
    suppliers: false,
    expenses: false,
    settings: false,
  },

  // Status
  isActive: true,                        // false = cannot login
  lastLoginAt: "2026-04-20T10:30:00Z",
  lastActiveAt: "2026-04-20T14:45:00Z",  // For session timeout tracking
  loginCount: 47,
  failedLoginAttempts: 0,                // Lock after 5 consecutive failures
  lockedUntil: null,                     // Timestamp or null

  // Metadata
  createdAt: "2026-01-15T10:30:00Z",
  createdBy: "admin-uid",               // Who created this user
  updatedAt: "2026-04-20T10:30:00Z",
}
```

**Business Rules:**

- `role: "superadmin"` → `storeId: null`, sees platform dashboard, all stores
- `role: "admin"` → owns one store, full access to their store, creates sub-users
- `role: "manager"` → access controlled by `store.menuConfig` AND `user.permissions`
- `role: "cashier"` → most restricted, typically POS-only
- 5 failed logins → `lockedUntil` set to 30 minutes in future
- `lastActiveAt` updated every 5 minutes → session timeout at 30 min idle

---

### 2. `stores/{storeId}` Tenant Configuration

```javascript
{
  // Identity
  id: "store-abc123",                    // Same as doc ID
  name: "Ali General Store",
  legalName: "Ali Trading Company",      // For invoices/receipts

  // Contact
  email: "ali@alistore.com",
  phone: "+923001234567",
  whatsapp: "+923001234567",
  website: "https://alistore.com",

  // Address
  address: {
    line1: "Shop #12, Main Bazar",
    line2: "Near City Hospital",
    city: "Multan",
    state: "Punjab",
    country: "PK",
    postalCode: "60000",
    coordinates: { lat: 30.1575, lng: 71.5249 },  // For multi-store map
  },

  // Business Registration
  registrationType: "sole_proprietorship", // "sole_proprietorship" | "partnership" | "pvt_ltd" | "llc"
  registrationNumber: "NTN-1234567",     // NTN for Pakistan
  gstNumber: "GST-PK-1234567890",

  // Branding
  logo: null,                            // Firebase Storage URL
  receiptLogo: null,                     // Smaller version for thermal printers
  receiptFooter: "Thank you for shopping at Ali Store!",
  receiptHeader: null,                   // Optional custom header

  // Owner
  ownerId: "firebase-uid-of-admin",

  // Operational Config
  currency: "PKR",
  currencySymbol: "₹",                  // or "Rs."
  timezone: "Asia/Karachi",
  locale: "en-PK",
  financialYearStart: "07-01",           // July 1 for Pakistan

  // Tax Configuration
  taxRates: [
    { id: "tax-gst-17",  name: "GST 17%",  rate: 17, isDefault: true,  isActive: true },
    { id: "tax-gst-12",  name: "GST 12%",  rate: 12, isDefault: false, isActive: true },
    { id: "tax-gst-5",   name: "GST 5%",   rate: 5,  isDefault: false, isActive: true },
    { id: "tax-exempt",  name: "Tax Exempt", rate: 0, isDefault: false, isActive: true },
  ],

  // Menu Configuration (controls sidebar visibility + route access)
  menuConfig: {
    pos: true,
    products: true,
    inventory: true,
    purchases: true,
    transactions: true,
    reports: true,
    customers: true,
    suppliers: true,
    expenses: true,
    settings: true,
  },

  // POS Settings
  posConfig: {
    allowNegativeStock: false,           // Block sale if stock = 0
    defaultCustomer: "Walk-in Customer",
    enableBarcode: true,
    enableLoyalty: true,
    loyaltyPointsPerUnit: 1,             // 1 point per Rs.100 spent
    loyaltyRedemptionRate: 10,           // 100 points = Rs.10
    enableHoldCart: true,
    maxHeldCarts: 10,
    enableDiscount: true,
    maxDiscountPercent: 50,              // Cap discount at 50%
    requireManagerApprovalForDiscount: 20, // Above 20% needs manager
    enableSplitPayment: true,
    enableCreditSale: false,             // Allow "pay later"
    receiptAutoprint: true,
    soundEnabled: true,
  },

  // Inventory Settings
  inventoryConfig: {
    enableBatchTracking: true,           // Batch/lot numbers
    enableExpiryTracking: true,          // Expiry date management
    expiryAlertDays: 30,                 // Alert X days before expiry
    enableFIFO: true,                    // First In First Out auto-selection
    enableFEFO: true,                    // First Expiry First Out (overrides FIFO)
    lowStockAlertEnabled: true,
    defaultLowStockThreshold: 10,
    enableReorderPoint: true,
    enablePurchaseOrders: true,
    enableGRN: true,                     // Goods Received Notes
    enableStockTransfer: false,          // Multi-warehouse (future)
    stockValuationMethod: "weighted_average", // "weighted_average" | "fifo_cost" | "lifo_cost"
    enableSerialNumber: false,           // For electronics IMEI tracking
  },

  // Invoice/Receipt Counter
  counters: {
    invoice: 1045,                       // Auto-increment
    purchaseOrder: 87,
    grn: 82,
    return: 23,
    stockAdjustment: 156,
    expense: 234,
  },

  // Invoice Format
  invoicePrefix: "INV",
  invoiceFormat: "{PREFIX}-{YYYYMMDD}-{####}", // INV-20260420-1046

  // Payment Methods
  paymentMethods: [
    { id: "cash",     name: "Cash",       isActive: true,  icon: "banknote" },
    { id: "card",     name: "Card",       isActive: true,  icon: "credit-card" },
    { id: "upi",      name: "JazzCash",   isActive: true,  icon: "smartphone" },
    { id: "easypaisa", name: "EasyPaisa", isActive: true,  icon: "smartphone" },
    { id: "bank",     name: "Bank Transfer", isActive: false, icon: "building" },
    { id: "credit",   name: "Credit/Udhaar", isActive: false, icon: "clock" },
  ],

  // Subscription
  plan: "premium",                       // "free" | "premium" | "enterprise"
  planLimits: {
    maxProducts: -1,                     // -1 = unlimited
    maxUsers: -1,
    maxCustomers: -1,
    maxStores: 1,
  },
  planStartDate: "2026-01-15",
  planEndDate: "2027-01-15",

  // Status
  isActive: true,
  suspendedAt: null,
  suspendReason: null,

  // Metadata
  createdAt: "2026-01-15T10:30:00Z",
  updatedAt: "2026-04-20T10:30:00Z",
}
```

---

### 3. `stores/{storeId}/products/{productId}` Product Master

```javascript
{
  // Identity
  id: "prod-uuid-v4",
  sku: "ALI-ELC-0001",                  // Store-specific SKU
  barcode: "8901234560001",             // EAN-13 / UPC-A
  barcodes: ["8901234560001"],          // Multiple barcodes possible (pack sizes)

  // Basic Info
  name: "Samsung Galaxy S24 Ultra",
  shortName: "Galaxy S24 Ultra",         // For POS display & receipt
  description: "256GB, Titanium Black",

  // Classification
  categoryId: "cat-electronics",
  categoryName: "Electronics",           // Denormalized for fast reads
  subcategoryId: "cat-mobiles",
  subcategoryName: "Mobile Phones",
  brandId: "brand-samsung",
  brandName: "Samsung",

  // Pricing
  costPrice: 185000,                     // Purchase cost (weighted avg)
  sellingPrice: 224999,                  // MRP / retail price
  wholesalePrice: 215000,               // For wholesale customers (optional)
  minimumSellingPrice: 210000,           // Floor price (cannot sell below)
  marginPercent: 21.62,                  // Auto-calculated: ((selling - cost) / selling) * 100

  // Tax
  taxRateId: "tax-gst-17",
  taxRate: 17,                           // Denormalized
  taxInclusive: false,                   // true = price includes tax, false = tax added on top
  hsnCode: "8517",                       // Harmonized System Nomenclature (for GST filing)

  // Stock Summary (Denormalized Aggregates)
  currentStock: 12,                      // Total across all batches
  reservedStock: 2,                      // In held carts or pending orders
  availableStock: 10,                    // currentStock - reservedStock

  // Stock Thresholds
  lowStockThreshold: 5,                  // Alert when stock <= this
  reorderPoint: 8,                       // Trigger reorder suggestion
  reorderQuantity: 20,                   // Suggested quantity to reorder
  maxStock: 50,                          // Maximum storage capacity

  // Stock Valuation
  stockValue: 2220000,                   // currentStock × costPrice

  // Product Type
  type: "standard",                      // "standard" | "service" | "composite" | "variant_parent"
  trackInventory: true,                  // false for services

  // Batch & Expiry Config (per product override)
  batchTracking: true,                   // Track lot/batch numbers
  expiryTracking: true,                  // Track expiry dates
  serialTracking: false,                 // Track individual serial/IMEI

  // Variants (if applicable)
  hasVariants: false,
  variantAttributes: [],                 // ["Color", "Size"]
  parentProductId: null,                 // If this is a variant, link to parent

  // Unit of Measure
  unit: "piece",                         // "piece" | "kg" | "g" | "liter" | "ml" | "meter" | "box" | "pack"
  purchaseUnit: "piece",                 // Unit when purchasing from supplier
  conversionFactor: 1,                   // 1 purchaseUnit = X sellUnit (e.g., 1 box = 12 pieces)

  // Images
  images: [                              // Max 5
    { url: "https://storage.../img1.jpg", isPrimary: true },
  ],
  thumbnailUrl: null,                    // Auto-generated 150x150

  // Supplier Info (Primary)
  primarySupplierId: "sup-uuid",
  primarySupplierName: "Samsung Dist. PK",
  supplierSku: "SM-S928B/DS",           // Supplier's own SKU
  leadTimeDays: 7,                       // Days from order to delivery

  // Flags
  isActive: true,                        // false = soft deleted / archived
  isFeatured: false,                     // Show prominently in POS
  allowDiscount: true,
  isWeighed: false,                      // For items sold by weight

  // Analytics (updated periodically or on transaction)
  totalSold: 145,                        // Lifetime units sold
  totalRevenue: 32624855,               // Lifetime revenue
  lastSoldAt: "2026-04-19T16:30:00Z",

  // Metadata
  createdAt: "2026-01-20T10:00:00Z",
  createdBy: "user-uid",
  updatedAt: "2026-04-20T10:00:00Z",
  updatedBy: "user-uid",
}
```

**Key Design Decisions:**

- `currentStock` is a **denormalized aggregate** the source of truth is `productBatches` and `stockMovements`. A Cloud Function or batch update recalculates this.
- `categoryName` and `brandName` are denormalized to avoid joins (Firestore has no JOINs).
- `costPrice` uses weighted average: when new stock arrives at different cost, the weighted average is recalculated.

---

### 4. `stores/{storeId}/productBatches/{batchId}` Batch & Expiry Tracking

> **This is the CORE of professional inventory management.** Every unit of stock enters through a batch. FIFO/FEFO is managed here.

```javascript
{
  id: "batch-uuid",
  productId: "prod-uuid",
  productName: "Samsung Galaxy S24 Ultra",     // Denormalized

  // Batch Identity
  batchNumber: "B-2026-03-15-001",             // Supplier batch or auto-generated
  lotNumber: "LOT-SAM-2026-Q1",               // Supplier's lot number
  serialNumbers: [],                            // For IMEI/serial tracking: ["IMEI1", "IMEI2"]

  // Source
  sourceType: "purchase",                       // "purchase" | "return" | "adjustment" | "opening_stock" | "transfer"
  sourceId: "grn-uuid",                        // Reference to GRN, return, or adjustment doc
  purchaseOrderId: "po-uuid",
  supplierId: "sup-uuid",
  supplierName: "Samsung Dist. PK",

  // Dates
  manufacturingDate: "2026-02-01",             // When manufactured
  expiryDate: "2028-02-01",                   // When expires (null if no expiry)
  receivedDate: "2026-03-15",                 // When received into store

  // Expiry Status (computed)
  daysUntilExpiry: 652,                        // Auto-calculated, updated daily by Cloud Function
  expiryStatus: "good",                        // "good" | "warning" | "critical" | "expired"
  // good = > 60 days, warning = 30-60 days, critical = < 30 days, expired = past date

  // Quantities
  initialQuantity: 20,                         // How many received in this batch
  currentQuantity: 12,                         // How many remain (decremented on sale)
  reservedQuantity: 2,                         // In held carts
  availableQuantity: 10,                       // current - reserved
  damagedQuantity: 0,                          // Marked as damaged
  returnedToSupplier: 0,                       // Sent back to supplier

  // Costing
  unitCostPrice: 185000,                       // Cost per unit at time of purchase
  totalCostValue: 3700000,                     // initialQuantity × unitCostPrice
  remainingCostValue: 2220000,                 // currentQuantity × unitCostPrice

  // Quality
  qualityStatus: "passed",                     // "passed" | "quarantine" | "rejected"
  qualityNotes: null,
  inspectedBy: null,
  inspectedAt: null,

  // Status
  isActive: true,                              // false when fully consumed
  isExpired: false,                            // true when past expiryDate
  isBlocked: false,                            // Blocked from sale (quality hold)
  blockReason: null,

  // Metadata
  createdAt: "2026-03-15T10:00:00Z",
  createdBy: "user-uid",
  updatedAt: "2026-04-20T10:00:00Z",
}
```

**FIFO/FEFO Logic:**
When a sale happens, the system picks batches to deduct from:

1. **FEFO (First Expiry First Out)**: If `enableFEFO = true`, pick the batch with the EARLIEST `expiryDate` that has `availableQuantity > 0` and `isBlocked = false` and `isExpired = false`
2. **FIFO (First In First Out)**: If FEFO is off, pick the batch with the EARLIEST `receivedDate`
3. If the selected batch doesn't have enough quantity, cascade to the next batch

```javascript
// Pseudo-code for batch selection
function selectBatchesForSale(productId, quantityNeeded) {
  const batches = await getBatches(productId)
    .where('availableQuantity', '>', 0)
    .where('isBlocked', '==', false)
    .where('isExpired', '==', false)
    .orderBy(store.inventoryConfig.enableFEFO ? 'expiryDate' : 'receivedDate', 'asc');

  let remaining = quantityNeeded;
  const allocations = [];

  for (const batch of batches) {
    if (remaining <= 0) break;
    const deduct = Math.min(remaining, batch.availableQuantity);
    allocations.push({ batchId: batch.id, quantity: deduct, unitCost: batch.unitCostPrice });
    remaining -= deduct;
  }

  if (remaining > 0) throw new Error('Insufficient stock');
  return allocations;
}
```

---

### 5. `stores/{storeId}/suppliers/{supplierId}` Supplier Management

```javascript
{
  id: "sup-uuid",

  // Basic Info
  name: "Samsung Distribution Pakistan",
  contactPerson: "Ahmad Raza",
  email: "orders@samsungdist.pk",
  phone: "+923211234567",
  whatsapp: "+923211234567",

  // Address
  address: {
    line1: "Plot 45, Industrial Area",
    city: "Lahore",
    state: "Punjab",
    country: "PK",
    postalCode: "54000",
  },

  // Business Details
  registrationNumber: "NTN-7654321",
  gstNumber: "GST-PK-7654321",

  // Financial
  paymentTerms: "net_30",               // "cod" | "net_15" | "net_30" | "net_60" | "prepaid"
  creditLimit: 5000000,                  // Max outstanding balance
  currentBalance: 1250000,              // What you owe them

  // Performance (auto-calculated)
  totalOrders: 34,
  totalPurchaseValue: 12500000,
  averageDeliveryDays: 5,
  onTimeDeliveryRate: 92.3,             // Percentage
  qualityRejectionRate: 1.2,            // Percentage
  lastOrderDate: "2026-04-10",

  // Products this supplier provides
  productCount: 8,                       // How many of your products come from them

  // Status
  isActive: true,
  rating: 4,                            // 1-5 stars
  notes: "Reliable supplier. Sometimes late in Ramadan.",

  // Metadata
  createdAt: "2026-01-20T10:00:00Z",
  createdBy: "user-uid",
  updatedAt: "2026-04-20T10:00:00Z",
}
```

---

### 6. `stores/{storeId}/purchaseOrders/{poId}` Purchase Orders

```javascript
{
  id: "po-uuid",
  poNumber: "PO-20260420-0088",          // Auto-generated

  // Supplier
  supplierId: "sup-uuid",
  supplierName: "Samsung Distribution PK",
  supplierContact: "+923211234567",

  // Dates
  orderDate: "2026-04-20",
  expectedDeliveryDate: "2026-04-27",
  actualDeliveryDate: null,              // Filled when GRN created

  // Items
  items: [
    {
      productId: "prod-uuid-1",
      productName: "Samsung Galaxy S24 Ultra",
      sku: "ALI-ELC-0001",
      orderedQuantity: 20,
      receivedQuantity: 0,               // Updated as GRNs are created
      pendingQuantity: 20,               // ordered - received
      unitCost: 185000,
      totalCost: 3700000,
      taxRate: 17,
      taxAmount: 629000,
      unit: "piece",
    },
    {
      productId: "prod-uuid-2",
      productName: "Apple AirPods Pro",
      sku: "ALI-ELC-0015",
      orderedQuantity: 10,
      receivedQuantity: 0,
      pendingQuantity: 10,
      unitCost: 19000,
      totalCost: 190000,
      taxRate: 17,
      taxAmount: 32300,
      unit: "piece",
    },
  ],

  // Financials
  subtotal: 3890000,
  taxTotal: 661300,
  shippingCost: 5000,
  discount: 0,
  grandTotal: 4556300,

  // Terms
  paymentTerms: "net_30",
  notes: "Urgent order   needed before Eid rush",
  internalNotes: "Confirm delivery slot with supplier",

  // Documents
  attachments: [],                       // Uploaded docs (supplier quotes, etc.)

  // Status Workflow
  status: "sent",
  // "draft" → "sent" → "partially_received" → "received" → "closed"
  // Also: "cancelled"

  // Approval (if required)
  requiresApproval: false,
  approvedBy: null,
  approvedAt: null,

  // Linked GRNs
  grnIds: [],                            // Populated as GRNs are created
  grnCount: 0,

  // Metadata
  createdAt: "2026-04-20T10:00:00Z",
  createdBy: "user-uid",
  updatedAt: "2026-04-20T10:00:00Z",
}
```

**Purchase Order Workflow:**

```
DRAFT → SENT → PARTIALLY_RECEIVED → RECEIVED → CLOSED
                                                  ↓
                                              CANCELLED

- Draft: PO created but not sent to supplier
- Sent: Communicated to supplier (email/WhatsApp/print)
- Partially Received: Some items received (GRN created for partial)
- Received: All items received (all GRNs done)
- Closed: Invoice matched, payment made
- Cancelled: Order cancelled (with reason)
```

---

### 7. `stores/{storeId}/goodsReceivedNotes/{grnId}` Stock IN (GRN)

> **GRN is the ONLY way stock enters the system (except opening stock and returns).**

```javascript
{
  id: "grn-uuid",
  grnNumber: "GRN-20260427-0083",

  // Source
  purchaseOrderId: "po-uuid",
  poNumber: "PO-20260420-0088",
  supplierId: "sup-uuid",
  supplierName: "Samsung Distribution PK",

  // Delivery
  deliveryDate: "2026-04-27",
  deliveryNoteNumber: "DN-SAM-45678",    // Supplier's delivery note
  deliveredBy: "Express Logistics",
  vehicleNumber: "LHR-1234",

  // Items Received
  items: [
    {
      productId: "prod-uuid-1",
      productName: "Samsung Galaxy S24 Ultra",
      sku: "ALI-ELC-0001",
      orderedQuantity: 20,               // From PO
      receivedQuantity: 18,              // Actually received
      damagedQuantity: 1,                // Damaged on arrival
      acceptedQuantity: 17,              // received - damaged
      shortageQuantity: 2,               // ordered - received
      unitCost: 185000,
      totalCost: 3145000,               // acceptedQuantity × unitCost

      // Batch Info (created per item)
      batchNumber: "B-2026-04-27-001",
      lotNumber: "LOT-SAM-2026-Q1",
      manufacturingDate: "2026-02-01",
      expiryDate: "2028-02-01",

      // Quality
      qualityStatus: "passed",           // "passed" | "quarantine" | "rejected"
      qualityNotes: "1 unit screen cracked in transit",
    },
    {
      productId: "prod-uuid-2",
      productName: "Apple AirPods Pro",
      sku: "ALI-ELC-0015",
      orderedQuantity: 10,
      receivedQuantity: 10,
      damagedQuantity: 0,
      acceptedQuantity: 10,
      shortageQuantity: 0,
      unitCost: 19000,
      totalCost: 190000,
      batchNumber: "B-2026-04-27-002",
      lotNumber: null,
      manufacturingDate: null,
      expiryDate: null,
      qualityStatus: "passed",
      qualityNotes: null,
    },
  ],

  // Totals
  totalItemsOrdered: 30,
  totalItemsReceived: 28,
  totalItemsAccepted: 27,
  totalItemsDamaged: 1,
  totalValue: 3335000,

  // Status
  status: "completed",
  // "draft" → "inspecting" → "completed"
  // "completed" triggers: batch creation + stock update + stockMovement log

  // Who
  receivedBy: "user-uid",
  receivedByName: "Ali Store Manager",
  inspectedBy: "user-uid",
  approvedBy: "user-uid",

  // Metadata
  createdAt: "2026-04-27T10:00:00Z",
  completedAt: "2026-04-27T11:30:00Z",
}
```

**When GRN is completed (status → "completed"), the system MUST:**

1. Create `productBatch` document for each accepted item
2. Update `product.currentStock` += acceptedQuantity
3. Recalculate `product.costPrice` using weighted average
4. Create `stockMovement` with `type: "stock_in"` and `source: "grn"`
5. Update `purchaseOrder.items[x].receivedQuantity` and PO status
6. If damaged items exist, create `stockMovement` with `type: "damaged"` and `source: "grn"`

---

### 8. `stores/{storeId}/stockMovements/{movementId}` Stock Ledger (The Audit Trail)

> **EVERY stock change goes through this collection. It is the source of truth.**

```javascript
{
  id: "sm-uuid",
  movementNumber: "SM-20260427-0157",

  // Product
  productId: "prod-uuid",
  productName: "Samsung Galaxy S24 Ultra",
  sku: "ALI-ELC-0001",
  batchId: "batch-uuid",                 // Which batch affected
  batchNumber: "B-2026-04-27-001",

  // Movement
  type: "stock_in",
  // Stock increases: "stock_in" | "return_in" | "adjustment_add" | "opening_stock" | "transfer_in"
  // Stock decreases: "stock_out" | "return_out" | "adjustment_remove" | "damaged" | "expired" | "transfer_out" | "waste"

  direction: "in",                       // "in" | "out"

  // Quantities
  quantity: 17,                          // Always positive
  previousStock: 12,                     // Stock before this movement
  newStock: 29,                          // Stock after this movement

  // Costing
  unitCost: 185000,
  totalCost: 3145000,

  // Source Reference
  source: "grn",
  // "grn" | "sale" | "sale_return" | "purchase_return" | "adjustment" | "damage" | "expiry" | "opening" | "transfer"
  sourceId: "grn-uuid",                  // Link to GRN, transaction, return, etc.
  sourceNumber: "GRN-20260427-0083",

  // Reason (for adjustments)
  reason: null,
  // "recount" | "damaged" | "stolen" | "gifted" | "correction" | "expired" | "other"
  notes: "Received from Samsung Distribution PK against PO-20260420-0088",

  // Who
  performedBy: "user-uid",
  performedByName: "Ali Store Manager",
  approvedBy: null,                      // Required for adjustments > threshold

  // Timestamp
  timestamp: "2026-04-27T11:30:00Z",
  createdAt: "2026-04-27T11:30:00Z",
}
```

**Why This Collection is Critical:**

- It's an **immutable ledger** records are never edited or deleted
- Enables **stock reconciliation**: sum all movements for a product = current stock
- Enables **cost tracking**: every stock-in records the cost → weighted average
- Enables **audit trail**: who changed what, when, why
- Enables **stock reports**: movements by date range, by reason, by supplier, etc.

---

### 9. `stores/{storeId}/transactions/{txnId}` Sales

```javascript
{
  id: "txn-uuid",
  invoiceNo: "INV-20260420-1046",

  // Timing
  date: "2026-04-20T14:30:00Z",
  completedAt: "2026-04-20T14:31:45Z",

  // Customer
  customerId: "cust-uuid",              // null for walk-in
  customerName: "Rajesh Sharma",
  customerPhone: "+923001234567",

  // Cashier
  cashierId: "user-uid",
  cashierName: "Bilal Cashier",

  // Register
  registerSessionId: "session-uuid",

  // Items
  items: [
    {
      productId: "prod-uuid",
      productName: "Samsung Galaxy S24 Ultra",
      shortName: "Galaxy S24 Ultra",
      sku: "ALI-ELC-0001",
      barcode: "8901234560001",

      quantity: 1,
      unitPrice: 224999,                 // Selling price at time of sale
      costPrice: 185000,                 // For profit calculation

      // Discount
      discountType: "percentage",        // "percentage" | "fixed"
      discountValue: 5,
      discountAmount: 11250,             // 5% of 224999

      // Tax
      taxRate: 17,
      taxableAmount: 213749,             // unitPrice - discount
      taxAmount: 36337,

      // Totals
      subtotal: 224999,                  // qty × unitPrice
      total: 238836,                     // (subtotal - discount) + tax
      profit: 28749,                     // (unitPrice - discount - costPrice) per unit

      // Batch deductions (FIFO/FEFO)
      batchAllocations: [
        { batchId: "batch-uuid-1", batchNumber: "B-2026-03-15-001", quantity: 1, unitCost: 185000 },
      ],
    },
  ],

  // Cart-level Discount
  cartDiscountType: "percentage",        // null | "percentage" | "fixed"
  cartDiscountValue: 0,
  cartDiscountAmount: 0,

  // Totals
  itemCount: 1,
  subtotal: 224999,
  totalItemDiscount: 11250,
  totalCartDiscount: 0,
  totalDiscount: 11250,
  taxableAmount: 213749,
  totalTax: 36337,
  grandTotal: 250086,
  roundOff: -86,                         // Rounding to nearest 100 (Pakistan practice)
  netTotal: 250000,                      // grandTotal + roundOff (what customer actually pays)
  totalCost: 185000,                     // For profit reporting
  totalProfit: 28749,
  profitMargin: 11.5,                    // (profit / netTotal) × 100

  // Payment
  paymentMethod: "split",
  payments: [
    { method: "cash", amount: 200000, reference: null },
    { method: "card", amount: 50000, reference: "VISA-4242", cardType: "visa" },
  ],
  amountReceived: 250000,
  changeGiven: 0,

  // Loyalty
  loyaltyPointsEarned: 25,              // 250000/100 × 1 point
  loyaltyPointsRedeemed: 0,
  loyaltyDiscountApplied: 0,

  // Status
  status: "completed",
  // "completed" | "voided" | "returned" | "partially_returned"

  // Void Info
  voidedAt: null,
  voidedBy: null,
  voidReason: null,
  voidApprovedBy: null,

  // Return Info
  returnIds: [],                         // Linked return documents
  totalReturned: 0,

  // Receipt
  receiptPrinted: true,
  receiptEmailed: false,
  receiptWhatsapped: false,

  // Metadata
  createdAt: "2026-04-20T14:30:00Z",
}
```

---

### 10. `stores/{storeId}/transactionReturns/{returnId}` Sale Returns

```javascript
{
  id: "ret-uuid",
  returnNumber: "RET-20260420-0024",

  // Original Transaction
  transactionId: "txn-uuid",
  invoiceNo: "INV-20260420-1046",
  originalDate: "2026-04-20T14:30:00Z",

  // Customer
  customerId: "cust-uuid",
  customerName: "Rajesh Sharma",

  // Items Returned
  items: [
    {
      productId: "prod-uuid",
      productName: "Samsung Galaxy S24 Ultra",
      returnQuantity: 1,
      unitPrice: 224999,
      refundAmount: 250086,              // Including tax, minus discount

      reason: "defective",              // "defective" | "wrong_item" | "customer_changed_mind" | "expired" | "other"
      condition: "defective",           // "resellable" | "defective" | "damaged" | "expired"
      restockAction: "damaged",         // "restock" | "damaged" | "dispose" | "return_to_supplier"

      // Batch return
      batchId: "batch-uuid",
      batchNumber: "B-2026-03-15-001",
    },
  ],

  // Refund
  refundAmount: 250086,
  refundMethod: "cash",                  // Same as original or different
  refundReference: null,

  // Loyalty
  loyaltyPointsDeducted: 25,            // Reverse the earned points

  // Approval
  approvedBy: "manager-uid",
  approvedByName: "Sara Manager",

  // Status
  status: "completed",                   // "pending_approval" | "approved" | "completed" | "rejected"

  // Stock Impact
  stockRestored: true,                   // Whether stock was added back
  stockMovementId: "sm-uuid",           // Link to stock movement

  // Metadata
  returnDate: "2026-04-21T10:00:00Z",
  processedBy: "user-uid",
  createdAt: "2026-04-21T10:00:00Z",
}
```

---

### 11. `stores/{storeId}/customers/{customerId}`

```javascript
{
  id: "cust-uuid",

  // Basic Info
  name: "Rajesh Sharma",
  email: "rajesh@example.com",
  phone: "+923456789012",
  whatsapp: "+923456789012",

  // Address
  address: {
    line1: "123 MG Road",
    city: "Multan",
    state: "Punjab",
    country: "PK",
  },

  // Classification
  type: "retail",                        // "retail" | "wholesale" | "vip"
  group: "regular",                      // Custom grouping
  priceList: "default",                  // Which price list applies ("default" | "wholesale" | "vip")

  // Loyalty
  loyaltyPoints: 450,
  loyaltyTier: "silver",                 // "bronze" | "silver" | "gold" | "platinum"

  // Financial Summary (Denormalized)
  totalTransactions: 23,
  totalSpent: 456000,
  totalReturns: 1,
  totalReturnValue: 12000,
  averageOrderValue: 19826,
  lastPurchaseDate: "2026-04-19",
  firstPurchaseDate: "2025-06-15",

  // Credit (if enabled)
  creditLimit: 50000,
  currentCredit: 0,                      // Outstanding balance (udhaar)

  // Status
  isActive: true,

  // Notes
  notes: "Prefers Samsung products. Always pays on time.",
  tags: ["regular", "electronics-buyer"],

  // Metadata
  createdAt: "2025-06-15T10:00:00Z",
  createdBy: "user-uid",
  updatedAt: "2026-04-19T16:30:00Z",
}
```

---

### 12. `stores/{storeId}/categories/{categoryId}`

```javascript
{
  id: "cat-uuid",
  name: "Electronics",
  slug: "electronics",
  parentId: null,                        // null = top-level
  parentName: null,
  level: 0,                             // 0 = root, 1 = sub-category, 2 = sub-sub

  // Display
  icon: "smartphone",                    // Lucide icon name
  color: "#3B82F6",                      // Category color for POS
  image: null,
  sortOrder: 1,

  // Stats (Denormalized)
  productCount: 8,

  // Status
  isActive: true,

  createdAt: "2026-01-15T10:00:00Z",
}
```

---

### 13. `stores/{storeId}/expenses/{expenseId}`

```javascript
{
  id: "exp-uuid",
  expenseNumber: "EXP-20260420-0235",

  date: "2026-04-20",
  category: "rent",
  // "rent" | "utilities" | "salaries" | "transport" | "supplies" | "maintenance" |
  // "marketing" | "insurance" | "taxes" | "misc"

  description: "Monthly shop rent - April 2026",
  amount: 75000,
  paymentMethod: "bank",
  reference: "TRX-BANK-45678",

  // Vendor (if applicable)
  vendorName: "Landlord - Haji Sahib",
  vendorPhone: "+923001111111",

  // Attachments
  receiptUrl: null,                      // Photo of receipt

  // Approval
  approvedBy: "admin-uid",

  // Recurring
  isRecurring: true,
  recurringFrequency: "monthly",         // "daily" | "weekly" | "monthly" | "yearly"

  // Status
  status: "approved",                    // "pending" | "approved" | "rejected"

  createdAt: "2026-04-20T10:00:00Z",
  createdBy: "user-uid",
}
```

---

### 14. `stores/{storeId}/cashRegisterSessions/{sessionId}`

```javascript
{
  id: "session-uuid",

  // Register
  registerName: "Counter 1",

  // Cashier
  cashierId: "user-uid",
  cashierName: "Bilal Cashier",

  // Timing
  openedAt: "2026-04-20T09:00:00Z",
  closedAt: null,                        // null = session active

  // Opening
  openingCash: 5000,                     // Cash in drawer at start

  // Sales Summary (updated in real-time)
  totalSales: 45,
  totalSalesAmount: 234500,
  totalReturns: 2,
  totalReturnsAmount: 12000,

  // Payment Breakdown
  cashSales: 134500,
  cardSales: 80000,
  otherSales: 20000,

  // Cash Drawer
  expectedCash: 139500,                  // openingCash + cashSales - cashReturns
  actualCash: null,                      // Entered at closing
  cashDifference: null,                  // actual - expected
  differenceReason: null,

  // Closing
  closingNotes: null,
  closedBy: null,

  // Status
  status: "open",                        // "open" | "closed"

  createdAt: "2026-04-20T09:00:00Z",
}
```

---

### 15. `stores/{storeId}/auditLog/{logId}` Full Audit Trail

```javascript
{
  id: "log-uuid",

  action: "product.update.price",
  // Format: {entity}.{operation}.{field}
  // Examples:
  // "product.create", "product.update.price", "product.delete"
  // "transaction.create", "transaction.void"
  // "stock.adjustment.add", "stock.adjustment.remove"
  // "user.create", "user.update.permissions", "user.deactivate"
  // "settings.update.posConfig"

  entity: "product",
  entityId: "prod-uuid",
  entityName: "Samsung Galaxy S24 Ultra",

  // What changed
  changes: {
    sellingPrice: { from: 219999, to: 224999 },
  },

  // Who
  userId: "user-uid",
  userName: "Ali Admin",
  userRole: "admin",

  // Context
  ipAddress: "203.0.113.45",
  userAgent: "Mozilla/5.0...",

  timestamp: "2026-04-20T10:00:00Z",
}
```

---

### 16. `stores/{storeId}/alerts/{alertId}` System Alerts

```javascript
{
  id: "alert-uuid",

  type: "low_stock",
  // "low_stock" | "out_of_stock" | "expiry_warning" | "expiry_critical" | "expired" |
  // "reorder_point" | "large_transaction" | "void_transaction" | "failed_login" | "system"

  severity: "warning",                   // "info" | "warning" | "critical"

  title: "Low Stock Alert",
  message: "Samsung Galaxy S24 Ultra has only 5 units remaining",

  // Reference
  entityType: "product",
  entityId: "prod-uuid",

  // Status
  isRead: false,
  isDismissed: false,

  // Action
  actionUrl: "/inventory",
  actionLabel: "View Inventory",

  // Auto-resolve
  autoResolve: true,                     // Resolves when condition clears
  resolvedAt: null,

  timestamp: "2026-04-20T10:00:00Z",
}
```

---

## 🔗 RELATIONSHIP DIAGRAM

```
users
  │
  ├── storeId ──────────────────→ stores
  │
stores
  │
  ├── /categories                 (self-referencing: parentId → categoryId)
  ├── /suppliers
  │     │
  │     └── /purchaseOrders       (supplierId → suppliers)
  │           │
  │           └── /goodsReceivedNotes   (purchaseOrderId → purchaseOrders)
  │                 │
  │                 └── Creates → /productBatches  (per accepted item)
  │                 └── Creates → /stockMovements  (per item, type: stock_in)
  │
  ├── /products
  │     │
  │     ├── categoryId ──────────→ /categories
  │     ├── primarySupplierId ───→ /suppliers
  │     │
  │     └── /productBatches      (productId → products)
  │           │
  │           ├── sourceId ──────→ /goodsReceivedNotes (if source = purchase)
  │           └── Used by ───────→ /transactions (batchAllocations)
  │
  ├── /stockMovements            (productId → products, batchId → productBatches)
  │     │
  │     └── sourceId ────────────→ /transactions | /goodsReceivedNotes | /transactionReturns
  │
  ├── /transactions
  │     │
  │     ├── customerId ──────────→ /customers
  │     ├── cashierId ───────────→ users
  │     ├── registerSessionId ──→ /cashRegisterSessions
  │     │
  │     └── items[].batchAllocations[].batchId → /productBatches
  │
  ├── /transactionReturns        (transactionId → /transactions)
  │     │
  │     └── stockMovementId ────→ /stockMovements
  │
  ├── /customers
  ├── /expenses
  ├── /cashRegisterSessions      (cashierId → users)
  ├── /auditLog
  └── /alerts
```

---

## 📊 STOCK FLOW HOW STOCK ENTERS AND LEAVES

```
                          STOCK IN                                    STOCK OUT
                    ┌─────────────────┐                        ┌─────────────────┐
                    │                 │                        │                 │
    Purchase Order → GRN → Batch     │   Sale (POS)           │ → Stock Movement
    (Supplier)        │    Created    │   ↓                    │   (type: sale)
                      ↓               │   Transaction Created  │
                    Stock Movement    │   ↓                    │
                    (type: stock_in)  │   Batch Deducted       │
                    ↓                 │   (FIFO/FEFO)         │
                    Product Stock     │   ↓                    │
                    Updated (+)       │   Stock Movement       │
                                      │   (type: stock_out)   │
                                      │   ↓                    │
    Sale Return →  Stock Movement     │   Product Stock        │
    (Customer)     (type: return_in)  │   Updated (-)          │
                   Batch Qty += X     │                        │
                   Product Stock += X │                        │
                                      │   Damage / Expiry →    │
    Stock Adjust → Stock Movement     │   Stock Movement       │
    (Manual)       (type: adj_add     │   (type: damaged/      │
                    or adj_remove)    │    expired)             │
                   Needs Approval     │   Batch Qty -= X       │
                   if > threshold     │   Product Stock -= X   │
                                      │                        │
    Opening Stock → Stock Movement    │   Purchase Return →    │
    (First setup)   (type: opening)   │   Stock Movement       │
                    Batch Created     │   (type: return_out)   │
                                      │   Send back to         │
                                      │   supplier             │
                    └─────────────────┘   └─────────────────┘
```

---

## 🔄 WEIGHTED AVERAGE COST CALCULATION

When new stock arrives (GRN completed):

```javascript
function recalculateCostPrice(product, newQuantity, newUnitCost) {
  const existingValue = product.currentStock * product.costPrice;
  const newValue = newQuantity * newUnitCost;
  const totalQuantity = product.currentStock + newQuantity;

  if (totalQuantity === 0) return 0;

  const weightedAvgCost = (existingValue + newValue) / totalQuantity;
  return Math.round(weightedAvgCost * 100) / 100; // Round to 2 decimals
}

// Example:
// Existing: 10 units @ Rs.180,000 = Rs.1,800,000
// New GRN:  20 units @ Rs.185,000 = Rs.3,700,000
// New cost = (1,800,000 + 3,700,000) / 30 = Rs.183,333.33
```

---

## ⏰ EXPIRY MANAGEMENT DAILY CLOUD FUNCTION

A scheduled Cloud Function runs daily to update expiry statuses:

```javascript
// Runs every day at 2:00 AM
exports.updateExpiryStatus = functions.pubsub
  .schedule("0 2 * * *")
  .onRun(async () => {
    const today = new Date();
    const stores = await db
      .collection("stores")
      .where("isActive", "==", true)
      .get();

    for (const store of stores.docs) {
      const config = store.data().inventoryConfig;
      if (!config.enableExpiryTracking) continue;

      const batches = await db
        .collection(`stores/${store.id}/productBatches`)
        .where("isActive", "==", true)
        .where("expiryDate", "!=", null)
        .get();

      for (const batch of batches.docs) {
        const data = batch.data();
        const expiry = new Date(data.expiryDate);
        const daysUntil = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

        let status = "good";
        if (daysUntil <= 0) status = "expired";
        else if (daysUntil <= config.expiryAlertDays) status = "critical";
        else if (daysUntil <= config.expiryAlertDays * 2) status = "warning";

        // Update batch
        await batch.ref.update({
          daysUntilExpiry: daysUntil,
          expiryStatus: status,
          isExpired: daysUntil <= 0,
        });

        // Create alert if needed
        if (status === "critical" || status === "expired") {
          await createAlert(store.id, {
            type: status === "expired" ? "expired" : "expiry_critical",
            severity: status === "expired" ? "critical" : "warning",
            title: status === "expired" ? "Product Expired" : "Expiry Warning",
            message: `${data.productName} (Batch: ${data.batchNumber}) ${
              status === "expired"
                ? "has expired"
                : `expires in ${daysUntil} days`
            }`,
            entityType: "product",
            entityId: data.productId,
          });
        }

        // Block expired batches from sale
        if (status === "expired" && !data.isBlocked) {
          await batch.ref.update({ isBlocked: true, blockReason: "Expired" });
        }
      }
    }
  });
```

---

## 📏 FIRESTORE INDEXES NEEDED

```javascript
// Required composite indexes (create in Firebase Console or firestore.indexes.json)

// Products: filter + sort
stores/{storeId}/products: categoryId ASC, name ASC
stores/{storeId}/products: isActive ASC, currentStock ASC
stores/{storeId}/products: isActive ASC, name ASC

// Batches: FEFO selection
stores/{storeId}/productBatches: productId ASC, isActive ASC, isBlocked ASC, expiryDate ASC
stores/{storeId}/productBatches: productId ASC, isActive ASC, isBlocked ASC, receivedDate ASC

// Transactions: date range + status
stores/{storeId}/transactions: status ASC, date DESC
stores/{storeId}/transactions: customerId ASC, date DESC

// Stock Movements: audit
stores/{storeId}/stockMovements: productId ASC, timestamp DESC
stores/{storeId}/stockMovements: type ASC, timestamp DESC

// Alerts
stores/{storeId}/alerts: isRead ASC, timestamp DESC
```

---

## 🔐 COMPLETE FIRESTORE SECURITY RULES

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }

    function isSuperAdmin() {
      return getUserData().role == 'superadmin';
    }

    function belongsToStore(storeId) {
      let user = getUserData();
      return user.role == 'superadmin' || user.storeId == storeId;
    }

    function isStoreAdmin(storeId) {
      let user = getUserData();
      return user.role == 'superadmin' ||
             (user.role == 'admin' && user.storeId == storeId);
    }

    function hasModuleAccess(storeId, module) {
      let user = getUserData();
      if (user.role == 'superadmin' || user.role == 'admin') return true;
      let store = get(/databases/$(database)/documents/stores/$(storeId)).data;
      return store.menuConfig[module] == true &&
             (user.permissions[module] == null || user.permissions[module] == true);
    }

    // Users
    match /users/{uid} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth.uid == uid || isSuperAdmin() ||
                       isStoreAdmin(resource.data.storeId);
      allow delete: if isSuperAdmin();
    }

    // Stores
    match /stores/{storeId} {
      allow read: if request.auth != null && belongsToStore(storeId);
      allow create: if request.auth != null;
      allow update: if isStoreAdmin(storeId);
      allow delete: if isSuperAdmin();

      // Products
      match /products/{docId} {
        allow read: if belongsToStore(storeId) && hasModuleAccess(storeId, 'products');
        allow write: if belongsToStore(storeId) && hasModuleAccess(storeId, 'products');
      }

      // Product Batches
      match /productBatches/{docId} {
        allow read: if belongsToStore(storeId) &&
                       (hasModuleAccess(storeId, 'inventory') || hasModuleAccess(storeId, 'pos'));
        allow write: if belongsToStore(storeId) && hasModuleAccess(storeId, 'inventory');
      }

      // Suppliers
      match /suppliers/{docId} {
        allow read, write: if belongsToStore(storeId) && hasModuleAccess(storeId, 'suppliers');
      }

      // Purchase Orders
      match /purchaseOrders/{docId} {
        allow read, write: if belongsToStore(storeId) && hasModuleAccess(storeId, 'purchases');
      }

      // GRNs
      match /goodsReceivedNotes/{docId} {
        allow read, write: if belongsToStore(storeId) && hasModuleAccess(storeId, 'purchases');
      }

      // Stock Movements (append-only for non-admins)
      match /stockMovements/{docId} {
        allow read: if belongsToStore(storeId) && hasModuleAccess(storeId, 'inventory');
        allow create: if belongsToStore(storeId) &&
                         (hasModuleAccess(storeId, 'inventory') || hasModuleAccess(storeId, 'pos'));
        allow update, delete: if isStoreAdmin(storeId); // Only admin can modify stock records
      }

      // Transactions
      match /transactions/{docId} {
        allow read: if belongsToStore(storeId) &&
                       (hasModuleAccess(storeId, 'transactions') || hasModuleAccess(storeId, 'pos'));
        allow create: if belongsToStore(storeId) && hasModuleAccess(storeId, 'pos');
        allow update: if belongsToStore(storeId) && hasModuleAccess(storeId, 'transactions');
      }

      // Returns
      match /transactionReturns/{docId} {
        allow read, write: if belongsToStore(storeId) && hasModuleAccess(storeId, 'transactions');
      }

      // Customers
      match /customers/{docId} {
        allow read: if belongsToStore(storeId) &&
                       (hasModuleAccess(storeId, 'customers') || hasModuleAccess(storeId, 'pos'));
        allow write: if belongsToStore(storeId) && hasModuleAccess(storeId, 'customers');
      }

      // Expenses
      match /expenses/{docId} {
        allow read, write: if belongsToStore(storeId) && hasModuleAccess(storeId, 'expenses');
      }

      // Cash Register Sessions
      match /cashRegisterSessions/{docId} {
        allow read, write: if belongsToStore(storeId) && hasModuleAccess(storeId, 'pos');
      }

      // Categories (read for POS, write for products)
      match /categories/{docId} {
        allow read: if belongsToStore(storeId);
        allow write: if belongsToStore(storeId) && hasModuleAccess(storeId, 'products');
      }

      // Audit Log (read-only, system writes)
      match /auditLog/{docId} {
        allow read: if isStoreAdmin(storeId);
        allow create: if belongsToStore(storeId);
        allow update, delete: if false; // Immutable
      }

      // Alerts
      match /alerts/{docId} {
        allow read, update: if belongsToStore(storeId);
        allow create: if belongsToStore(storeId);
        allow delete: if isStoreAdmin(storeId);
      }
    }

    // Leads (public create, admin read)
    match /leads/{docId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null && isSuperAdmin();
    }

    // Platform Config
    match /platformConfig/{docId} {
      allow read, write: if request.auth != null && isSuperAdmin();
    }
  }
}
```

---

## 📋 WHAT THIS SCHEMA COVERS THAT YOUR PREVIOUS ONE DIDN'T

| Feature                        | Previous Schema     | This Schema                                      |
| ------------------------------ | ------------------- | ------------------------------------------------ |
| Batch/Lot tracking             | ❌ None             | ✅ Full `productBatches` collection              |
| Expiry date management         | ❌ None             | ✅ Per-batch expiry + daily Cloud Function       |
| FIFO/FEFO stock selection      | ❌ None             | ✅ Automatic batch selection on sale             |
| Suppliers                      | ❌ None             | ✅ Full supplier CRUD + performance tracking     |
| Purchase Orders                | ❌ None             | ✅ Full PO workflow (draft→sent→received→closed) |
| Goods Received Notes           | ❌ None             | ✅ GRN with inspection, damage tracking          |
| Stock Movement Ledger          | ❌ Basic log        | ✅ Immutable ledger for every stock change       |
| Sale Returns                   | ❌ Void only        | ✅ Full return workflow with restock options     |
| Cash Register Sessions         | ❌ None             | ✅ Open/close, cash reconciliation               |
| Expense Tracking               | ❌ None             | ✅ Categories, approval, recurring               |
| Weighted Average Cost          | ❌ Static cost      | ✅ Auto-recalculate on each GRN                  |
| Product Variants               | ❌ None             | ✅ Parent/child variant architecture             |
| Multi-currency                 | ❌ Hardcoded        | ✅ Per-store currency config                     |
| Audit Trail                    | ❌ None             | ✅ Immutable audit log (who changed what)        |
| System Alerts                  | ❌ None             | ✅ Low stock, expiry, reorder alerts             |
| Credit Sales (Udhaar)          | ❌ None             | ✅ Customer credit limit + balance               |
| HSN Codes                      | ❌ None             | ✅ For GST filing compliance                     |
| Round-off                      | ❌ None             | ✅ Pakistan-style rounding                       |
| Tax Inclusive/Exclusive        | ❌ Always exclusive | ✅ Per-product config                            |
| Negative Stock Prevention      | ❌ None             | ✅ Configurable per store                        |
| Manager Approval for Discounts | ❌ None             | ✅ Threshold-based approval                      |
| Stock Valuation                | ❌ None             | ✅ At product + batch level                      |
| Reorder Points                 | ❌ None             | ✅ Auto-suggest when stock hits threshold        |
| Multiple Barcodes              | ❌ Single           | ✅ Array for pack sizes                          |

---

## 🎯 USE THIS PROMPT SECTION

When using the POS prompt, add this instruction:

> **"Follow the schema defined in the Deep Research Schema Document. Implement ALL collections including productBatches, suppliers, purchaseOrders, goodsReceivedNotes, stockMovements, transactionReturns, cashRegisterSessions, expenses, auditLog, and alerts. Stock must ONLY enter through GRNs (or opening stock/returns). Stock must ONLY leave through sales, damage, or adjustments. Every stock change creates a stockMovement record. Implement FEFO/FIFO batch selection. Run expiry checks. Calculate weighted average cost on GRN completion. This is production-grade no shortcuts."**
