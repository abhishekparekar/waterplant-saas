# Water Plant Management SaaS 🚰

> **Every Bottle. Every Delivery. Every Rupee. Under Control.**

A comprehensive, production-ready B2B SaaS and Mobile Application designed for packaged drinking-water plants, 20L jar suppliers, and local water delivery operations.

---

## 🌟 Core Modules & PRD Features

- **👑 Multi-Tenant Architecture & Roles**: Strict `tenantId` isolation across all collections with role-based permission control (Owner, Manager, Delivery Boy, Office Staff).
- **📊 Real-Time Operations Console**: Today's Sales, Collections, Customer Outstanding, Delivery Progress, 20L Production, and Ready Stock.
- **🚚 Mobile Field Delivery Execution**: Mobile driver route workflow: Start delivery, record delivered quantity, collect empty jars, accept UPI / Cash with QR scanner, log delivery failures.
- **🔄 360° Bottle Intelligence Ledger**: Track asset jars across 6 states: Plant Filled, Plant Empty, In-Transit Truck, Customer-Held, Returned, Damaged/Scrap.
- **🏭 Production & RO Quality Monitor**: Shift bottling runs (Morning/Afternoon/Night), net produced count, rejection tracking, and raw vs purified water TDS monitoring (BIS 14543 compliant).
- **📦 Transactional Stock Inventory**: Multi-category ledger (Finished goods, Empty jars, Tamper-proof caps, Branded labels) with immutable transaction logs.
- **👥 Customer CRM & Account Statements**: Customer types (Home, Office, Hotel, School, Hospital, Restaurant, etc.), credit limits, bottle deposits, and printable ledger statements.
- **🔁 Recurring Order Auto-Scheduler**: Daily, Alternate Days, Weekdays, and Weekly automated delivery generation.
- **🧾 GST Tax Invoices & Billing**: Instant printable tax invoices with 18% GST breakdown, receipt generation, and WhatsApp invoice sharing.
- **💰 Payments & Receivables Aging**: UPI, Cash, and Bank Transfer recording with automatic customer balance reconciliation.
- **💸 Business Expense Tracking**: Categorized logging for diesel fuel, electricity, vehicle repairs, filter replacements, and salaries.
- **🔒 Daily Closing & Day-Lock**: End-of-day cash drawer reconciliation and day-lock mechanism with audit trails.
- **📈 Business Analytics Reports**: Visual BI reports for Sales, Fleet efficiency, Bottle turnover, and Outstanding aging.
- **⚡ Offline Sync Queue**: Resilient offline mobile operation queue when delivery drivers are in low-connectivity areas.
- **💎 SaaS Subscription & 14-Day Free Trial Engine**: Starter, Growth, Business, and Enterprise tiers with live trial countdown.

---

## 🛠️ Technology Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Icons**: Lucide React
- **Backend / Database**: Firebase Authentication + Cloud Firestore + Firebase Storage + FCM (with offline-ready fallback layer)
- **Deployment**: Web & Responsive Mobile PWA + React Native Architecture

---

## 🚀 Getting Started

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/abhishekparekar/waterplant-saas.git

# Navigate into the project folder
cd waterplant-saas

# Install dependencies
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open your browser at [http://localhost:5173](http://localhost:5173) to test all features.

### 3. Build for Production

```bash
npm run build
```

---

## 📁 Firebase & Firestore Structure

```text
tenants/{tenantId}/
├── customers/{customerId}
├── products/{productId}
├── orders/{orderId}
├── recurringOrders/{recurringOrderId}
├── deliveries/{deliveryId}
├── bottleLedger/{ledgerId}
├── stockLedger/{ledgerId}
├── production/{productionId}
├── payments/{paymentId}
├── invoices/{invoiceId}
├── expenses/{expenseId}
├── employees/{employeeId}
├── dailyClosings/{closingId}
├── notifications/{notificationId}
└── auditLogs/{auditId}
```

---

## 📜 License

MIT License. Designed and developed for modern water plant operations.
