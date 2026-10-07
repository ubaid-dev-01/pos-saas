# QuickPOS 90-Day Execution Plan

## Objective

Deliver the minimum unbeatable feature set for Pakistan retail while keeping architecture scalable for multi-store SaaS.

## Current Baseline

Already in progress:

- Stock movement ledger collection introduced.
- Product batch model introduced.
- Sales allocation linked with FEFO/FIFO logic paths.
- Inventory history wired to movement stream.
- Firestore rules expanded for core collections.

## Phase Plan

### Phase 1 (Days 1-30): Inventory Integrity Foundation

Goal: no silent stock changes, no untracked batch risk.

Deliverables:

- Product batch management UI in inventory module.
- FEFO allocation hardening and index validation.
- Stock movement audit screen with filters.
- Damage and waste recording flow.
- Expiry status updater (scheduled function).

Acceptance criteria:

- Every stock delta writes a stock movement document.
- Expired batches cannot be sold.
- Reconciliation report equals movement sums versus product stock.

### Phase 2 (Days 31-60): Supply Chain and Cash Control

Goal: digitize ordering, receiving, and shift accountability.

Deliverables:

- Supplier performance metrics model.
- Purchase Order module with statuses.
- GRN module with shortage and damage capture.
- Weighted average cost update on GRN completion.
- Cash register session open/close workflow.

Acceptance criteria:

- PO -> GRN chain updates stock and costs correctly.
- Shift close always reports expected vs actual cash.
- Supplier fill rate and on-time indicators are available.

### Phase 3 (Days 61-90): Pakistan Localization and Growth Loops

Goal: local workflow advantage and retention loops.

Deliverables:

- Udhaar credit sale and repayment flow.
- WhatsApp receipt and payment reminder actions.
- FBR-ready export format package.
- Urdu toggle for cashier-critical screens.
- Multi-store summary dashboard v1.

Acceptance criteria:

- Credit aging report by 30/60/90+ days.
- WhatsApp receipt action from completed transactions.
- Multi-store owner can compare branch KPIs in one view.

## Engineering Backlog by Epic

### Epic A: Offline Reliability

- Add IndexedDB layer for critical operations.
- Build operation queue and sync worker.
- Add online/sync/offline status indicator.
- Add conflict handling strategy and logs.

### Epic B: Batch and Expiry Control

- Batch CRUD and batch-level history.
- Daily expiry lifecycle job.
- Expiry value-at-risk analytics card.
- Supplier return path for near-expiry stock.

### Epic C: Procurement Chain

- PO create/send lifecycle.
- GRN inspect/accept/reject process.
- Three-way match report.
- Landed-cost and weighted average update logic.

### Epic D: Credit and Customer Comms

- Credit limit enforcement at checkout.
- Partial repayment and ledger updates.
- WhatsApp templates for receipts and reminders.
- Collections dashboard.

### Epic E: Security and Audit

- Append-only policy checks on stock movements.
- Manager approvals for high-value adjustments.
- Full action audit trail for sensitive actions.
- Alerting on suspicious voids/adjustments.

## Commercial Readiness Checklist

- Pricing tiers match feature gates in product.
- Free plan has clear upgrade triggers.
- Demo data and scripts for grocery and pharmacy scenarios.
- Sales deck maps each feature to money/risk outcomes.

## Weekly Cadence

- Week 1-2: Data models, rules, indexes.
- Week 3-4: Inventory UI and movement audit.
- Week 5-6: PO and GRN workflows.
- Week 7-8: Cash sessions and valuation checks.
- Week 9-10: Udhaar and WhatsApp flows.
- Week 11-12: Localization, dashboards, launch hardening.

## Release Gates

- Gate 1: Inventory integrity verified in staging.
- Gate 2: Procurement and cash workflows stable.
- Gate 3: Localization and retention loops enabled.

## KPI Targets at Day 90

- Checkout completion under 15 seconds for 5-item basket.
- 99.9% stock movement traceability.
- 30% reduction in expiry loss for pilot stores.
- 20% faster end-of-day cash reconciliation.
- 15% improvement in udhaar collection cycle.
