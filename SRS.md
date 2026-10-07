# Software Requirements Specification (SRS)

## QuickPOS SaaS Pakistan-Optimized All-in-One Multi-Tenant Retail POS Platform

**Document Version:** 2.1 (Deep Market-Enhanced)
**Date:** May 20, 2026
**Product:** QuickPOS (`pos-saas`)

---

## 1. Introduction

### 1.1 Purpose

Upgrade QuickPOS into a market-leading, FBR-compliant, hybrid cloud/offline POS platform for Pakistani SMEs and Tier-1 retailers.

### 1.2 Scope

- **In scope:** FBR real-time/QR invoicing with offline queuing, offline-first mode, udhaar/credit ledger, digital payments (Raast/JazzCash/EasyPaisa), purchase-to-stock workflow, expenses/P&L, cash drawer reconciliation, multi-branch, loyalty, SMS/WhatsApp alerts.
- **Phased delivery:** Phase 1 (Core + FBR + Offline + Udhaar); Phase 2 (Advanced analytics, loyalty polish, multi-branch UI).

### 1.3 Pakistan Market Gaps Addressed

- FBR compliance pain (real-time integration, profile expiry, sync failures)
- Unreliable internet/power → offline mode with sync queue
- Cash + udhaar dominance; fragmented digital payments
- Incomplete inventory, no expenses, poor cash reconciliation

---

## 2. Overall Description

### 2.1 Product Perspective

All-in-one hub: simple for cashiers, enterprise-grade for owners. Combines FBR compliance, offline resilience, and local features (udhaar, Raast).

### 2.2 User Classes

| Role               | Focus                                  |
| ------------------ | -------------------------------------- |
| Cashier            | Fast POS + offline                     |
| Manager/Owner      | Reports, inventory, udhaar, compliance |
| Super Admin        | Platform + cross-tenant insights       |
| Multi-Branch Owner | Centralized view                       |

### 2.3 Operating Environment

- Hybrid offline-first (IndexedDB + Firestore persistence)
- Responsive React (Urdu/English planned)
- Browser print, camera barcode, thermal printer support
- FBR API, PCI-DSS for payments

---

## 3. Functional Requirements (Prioritized)

### 3.1 POS Enhancements ✅ Phase 1 (Implemented)

| ID      | Requirement                                             | Status |
| ------- | ------------------------------------------------------- | ------ |
| POS-F01 | Udhaar/credit sales with customer credit limits         | ✅     |
| POS-F02 | Digital payments: JazzCash, EasyPaisa, Raast QR display | ✅     |
| POS-F03 | Enhanced split: cash + card + digital + udhaar          | ✅     |
| POS-F04 | Offline sale queue (IndexedDB) with sync on reconnect   | ✅     |
| POS-F05 | Cash drawer open/close + end-of-day reconciliation      | ✅     |
| POS-F06 | FBR payload + QR on receipts; sync log foundation       | ✅     |
| POS-F07 | Firestore offline persistence                           | ✅     |

### 3.2 POS Enhancements Planned

| ID      | Requirement                                  | Phase |
| ------- | -------------------------------------------- | ----- |
| POS-P01 | Full FBR PRAL API integration + retry engine | 1     |
| POS-P02 | PO → GRN → batch FIFO/FEFO UI                | 1     |
| POS-P03 | Expenses module + P&L reports                | 1     |
| POS-P04 | SMS/WhatsApp receipt + udhaar reminders      | 2     |
| POS-P05 | Multi-branch merchant dashboard              | 2     |
| POS-P06 | Urdu UI labels                               | 2     |

### 3.3 Existing Core (SRS 1.0)

- Marketing site, auth/OTP, RBAC, products, inventory basics, customers, transactions, reports, super-admin console

---

## 4. Non-Functional Requirements

| Category    | Requirement                                     |
| ----------- | ----------------------------------------------- |
| Reliability | 99.9%+ with offline queue; sync on reconnect    |
| Performance | Sub-300ms product search                        |
| Usability   | Keyboard shortcuts, mobile-responsive POS       |
| Security    | Firestore rules, tenant isolation, audit trails |
| Scalability | Multi-tenant sub-collections                    |

---

## 5. Data Model Additions (Phase 1)

```
stores/{storeId}/
  ├── udhaarLedgers/{ledgerId}     ← credit sale / void reversal
  ├── fbrSyncLogs/{logId}          ← FBR sync status + payload
  ├── cashRegisterSessions/{id}    ← open/close reconciliation
  └── (existing collections)

Local (browser):
  IndexedDB quickpos-offline.pendingSales
```

---

## 6. Acceptance Criteria (Phase 1)

1. ✅ Complete sale with udhaar; customer `currentCredit` updates; ledger entry created
2. ✅ Complete sale offline; receipt prints; sync when online restores stock + Firestore record
3. ✅ Open cash session; sales update expected cash; close with reconciliation
4. ✅ FBR-enabled store shows QR + status on receipt
5. ✅ Digital payment records provider reference (JazzCash/EasyPaisa/Raast)

---

## 7. Roadmap

**Phase 1 (current sprint):** FBR engine hookup, offline, udhaar, cash reconciliation ✅ foundations
**Phase 2:** Full inventory workflow UI, expenses, P&L, multi-branch, native apps

---

_See implementation in `src/components/pos/`, `src/stores/transactionStore.js`, `src/utils/fbr.js`, `src/utils/offlineQueue.js`_
