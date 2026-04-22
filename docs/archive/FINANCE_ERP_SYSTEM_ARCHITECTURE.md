# Edify Finance ERP - Complete System Architecture
**A Production-Ready Financial Management System for Private Schools in Uganda**

---

## 1. EXECUTIVE SUMMARY

This document outlines a comprehensive, modular Financial Management System (ERP) for private schools in Uganda, built on the existing Edify platform. The system automates student billing, expense tracking, accounting, budgeting, and provides complete financial visibility to school management.

**Key Characteristics:**
- Highly modular and scalable
- Fully automated billing and reconciliation
- Complete audit trails for all transactions
- Strong accounting principles
- Real-time dashboards
- Multi-role access control
- Parent/student financial portal
- API-first architecture
- Production-ready security

---

## 2. SYSTEM ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                    EDIFY FINANCE ERP SYSTEM                      │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐     ┌──────────────────────┐
│   FRONTEND (React)   │     │  EXTERNAL SYSTEMS    │
│  - Dashboards        │     │  - SMS Gateway       │
│  - Reports           │     │  - Email Service     │
│  - Parent Portal     │     │  - WhatsApp API      │
│  - Finance UI        │     │  - Mobile Money      │
└──────────────────────┘     │  - Bank Integration  │
         │                   └──────────────────────┘
         │                            │
    ┌────┴────────────────────────────┴─────┐
    │      API Gateway & Auth (JWT)         │
    │     /api/v1/finance/*                 │
    └────┬────────────────────────────────┬─────┐
         │                                │     │
    ┌────▼──────────┐    ┌───────────┐    │     │
    │  DJANGO       │    │ CELERY    │    │     │
    │  BACKEND      │    │ TASKS     │    │     │
    │  - APIs       │    │ - Async   │    │     │
    │  - Logic      │    │ - Queue   │    │     │
    │  - Auth       │    │ - Schedule│    │     │
    └────┬──────────┘    └───────────┘    │     │
         │                                 │     │
    ┌────▼──────────────────────────────┐ │     │
    │   CORE FINANCE MODULES            │ │     │
    │ ┌──────────────────────────────┐  │ │     │
    │ │ 1. Student Billing Module     │  │ │     │
    │ │ 2. Invoice Management         │  │ │     │
    │ │ 3. Payment Processing         │  │ │     │
    │ │ 4. Account Ledger             │  │ │     │
    │ │ 5. Expense Management         │  │ │     │
    │ │ 6. Inventory Billing          │  │ │     │
    │ │ 7. Transport Billing          │  │ │     │
    │ │ 8. Budgeting & Control        │  │ │     │
    │ │ 9. Reporting Engine           │  │ │     │
    │ │10. Audit & Compliance         │  │ │     │
    │ └──────────────────────────────┘  │ │     │
    └────┬───────────────────────────────┘ │     │
         │                                 │     │
    ┌────▼──────────────────────────────┐ │     │
    │   SHARED SERVICES                 │ │     │
    │ ┌──────────────────────────────┐  │ │     │
    │ │ Authentication & RBAC         │  │ │     │
    │ │ Audit Logging                 │  │ │     │
    │ │ Notifications (Email/SMS)     │  │ │     │
    │ │ Report Generation             │  │ │     │
    │ │ Validation & Business Logic   │  │ │     │
    │ └──────────────────────────────┘  │ │     │
    └────┬───────────────────────────────┘ │     │
         │                                 │     │
    ┌────▼──────────────────────────────┐ │     │
    │     DATABASE LAYER                │ │     │
    │  SQLite (Dev) → PostgreSQL (Prod) │ │     │
    │  ┌────────────────────────────┐   │ │     │
    │  │ Finance Data Tables        │   │ │     │
    │  │ Audit Log Tables           │   │ │     │
    │  │ Reporting Tables           │   │ │     │
    │  └────────────────────────────┘   │ │     │
    └────────────────────────────────────┘ │     │
         │                                 │     │
    ┌────▼──────────────────────────────┐ │     │
    │  CACHING LAYER                    │ │     │
    │  Redis - Reporting Cache          │ │     │
    │         - Balance Cache            │ │     │
    │         - Dashboard Cache          │ │     │
    │         - Session Cache            │ │     │
    └───────────────────────────────────┘ │     │
                                          │     │
    ┌─────────────────────────────────────┴─────┘
    │
    └──► External Integrations Layer
         - Payment Gateways
         - SMS/Email
         - Accounting Software
         - Government Reporting
```

---

## 3. CORE MODULES ARCHITECTURE

### Module 1: Student Financial Profile Management
**Purpose:** Maintain comprehensive financial records for each student

**Sub-components:**
- Student bio-data integration
- Financial status tracker
- Balance tracking (current, overdue, paid)
- Payment history
- Invoice history
- Allocation tracking

**Key Entities:**
```
StudentFinancialProfile
  ├── student_id (FK)
  ├── class_id (FK)
  ├── stream (e.g., Science, Arts)
  ├── section (e.g., Primary, Secondary)
  ├── academic_year_id (FK)
  ├── day_or_boarding (CHOICE)
  ├── transport_route_id (FK, nullable)
  ├── hostel_id (FK, nullable)
  ├── current_balance (DECIMAL)
  ├── arrears_balance (DECIMAL)
  ├── advance_payment (DECIMAL)
  ├── financial_status (CHOICE: active, cleared, in_arrears, suspended)
  ├── scholarship_id (FK, nullable)
  ├── sponsor_id (FK, nullable)
  ├── created_at
  ├── updated_at
```

---

### Module 2: Class-Based Fee Engine
**Purpose:** Dynamically determine payable amounts based on class, section, day/boarding status

**Sub-components:**
- Fee template management
- Fee category definition
- Dynamic fee calculation
- Automatic invoice generation
- Discount and waiver rules

**Key Entities:**
```
FeeTemplate
  ├── academic_year_id (FK)
  ├── term_id (FK)
  ├── class_id (FK, nullable) - if class-specific
  ├── stream (nullable)
  ├── section (nullable)
  ├── day_or_boarding (CHOICE)
  ├── student_category (e.g., new, continuing)
  ├── name (e.g., "Senior 4 2024 T1")
  ├── status (CHOICE: draft, approved, active)
  ├── created_at
  └── updated_at

FeeTemplateLineItem
  ├── fee_template_id (FK)
  ├── fee_category_id (FK)
  ├── amount (DECIMAL)
  ├── is_optional (BOOLEAN)
  ├── is_recurring (BOOLEAN)
  ├── charge_type (CHOICE: mandatory, optional, one_time, recurring)
  ├── frequency (CHOICE: annual, termly, monthly, per_date_range)
  └── created_at
```

---

### Module 3: Invoicing System
**Purpose:** Auto-generate, track, and manage student invoices

**Sub-components:**
- Invoice generation engine
- Invoice numbering (with sequence control)
- Invoice payment tracking
- Invoice adjustments (credit notes, debit notes)
- Invoice aging
- Due date management

**Key Entities:**
```
Invoice
  ├── invoice_number (UNIQUE)
  ├── student_id (FK)
  ├── academic_year_id (FK)
  ├── term_id (FK)
  ├── issue_date
  ├── due_date
  ├── gross_amount (DECIMAL)
  ├── discount_amount (DECIMAL)
  ├── net_amount (DECIMAL)
  ├── balance_amount (DECIMAL)
  ├── status (CHOICE: draft, issued, partially_paid, paid, cancelled)
  ├── created_by (FK to User)
  ├── created_at
  └── updated_at

InvoiceLineItem
  ├── invoice_id (FK)
  ├── fee_category_id (FK)
  ├── description
  ├── quantity
  ├── unit_amount (DECIMAL)
  ├── total_amount (DECIMAL)
  └── created_at
```

---

### Module 4: Payment Management
**Purpose:** Record, allocate, and reconcile payments

**Sub-components:**
- Payment recording (multi-method)
- Payment allocation engine
- Partial and split payment support
- Automatic balance calculation
- Receipt generation
- Refund processing

**Key Entities:**
```
Payment
  ├── payment_number (UNIQUE)
  ├── student_id (FK)
  ├── amount (DECIMAL)
  ├── payment_method (CHOICE: cash, bank, mobile_money, card)
  ├── payment_date
  ├── bank_account_id (FK, nullable) - for bank payments
  ├── mobile_money_ref (nullable)
  ├── receipt_number (UNIQUE)
  ├── status (CHOICE: pending, confirmed, receipted, reconciled, cancelled)
  ├── notes
  ├── entered_by (FK to User)
  ├── confirmed_by (FK to User, nullable)
  ├── confirmed_at
  ├── created_at
  └── updated_at

PaymentAllocation
  ├── payment_id (FK)
  ├── invoice_id (FK)
  ├── amount_allocated (DECIMAL)
  ├── allocation_type (CHOICE: oldest_first, specific_charge, manual)
  ├── created_at
```

---

### Module 5: Transport Billing
**Purpose:** Manage routes, assign students, and auto-bill transport fees

**Sub-components:**
- Route definition
- Route stage/pickup points
- Route charging
- Student assignment to routes
- Automatic transport billing
- Route profitability analysis

**Key Entities:**
```
TransportRoute
  ├── code (UNIQUE)
  ├── name
  ├── description
  ├── starting_point
  ├── ending_point
  ├── daily_fee (DECIMAL)
  ├── weekly_fee (DECIMAL)
  ├── monthly_fee (DECIMAL)
  ├── termly_fee (DECIMAL)
  ├── one_way_fee (DECIMAL)
  ├── two_way_fee (DECIMAL)
  ├── active (BOOLEAN)
  └── created_at

TransportAssignment
  ├── student_id (FK)
  ├── route_id (FK)
  ├── academic_year_id (FK)
  ├── term_id (FK)
  ├── billing_frequency (CHOICE: monthly, termly, annual)
  ├── one_way_or_two_way (CHOICE)
  ├── active
  └── created_at
```

---

### Module 6: School Accounting Module
**Purpose:** Complete double-entry accounting system

**Sub-components:**
- Chart of accounts
- General ledger
- Journal entry posting
- Multi-period accounting
- Year-end closing
- Balance reconciliation

**Key Entities:**
```
Account (Chart of Accounts)
  ├── account_code (UNIQUE)
  ├── account_name
  ├── account_type (CHOICE: asset, liability, equity, income, expense)
  ├── account_subtype
  ├── parent_account_id (FK, nullable)
  ├── is_control_account (BOOLEAN)
  ├── opening_balance (DECIMAL)
  ├── active
  └── created_at

GeneralLedger (Posting)
  ├── account_id (FK)
  ├── journal_entry_id (FK)
  ├── transaction_date
  ├── debit_amount (DECIMAL)
  ├── credit_amount (DECIMAL)
  ├── description
  ├── reference_number (FK - could link to invoice, payment, etc.)
  ├── cost_center_id (FK, nullable)
  ├── posted_by (FK to User)
  ├── posted_at
  └── created_at

JournalEntry
  ├── journal_number (UNIQUE)
  ├── entry_date
  ├── description
  ├── total_debit (DECIMAL)
  ├── total_credit (DECIMAL)
  ├── status (CHOICE: draft, submitted, approved, posted, rejected, reversed)
  ├── requires_approval (BOOLEAN)
  ├── created_by (FK to User)
  ├── approved_by (FK to User, nullable)
  ├── approved_at
  ├── posted_by (FK to User, nullable)
  ├── posted_at
  └── created_at
```

---

### Module 7: Expense Management
**Purpose:** Track, approve, and account for all school expenses

**Sub-components:**
- Expense categorization
- Supplier management
- Purchase request workflow
- Purchase order management
- Expense approval routing
- Departmental budgeting
- Cost center allocation

**Key Entities:**
```
Expense
  ├── expense_number (UNIQUE)
  ├── expense_date
  ├── expense_category_id (FK)
  ├── supplier_id (FK, nullable)
  ├── description
  ├── amount (DECIMAL)
  ├── department_id (FK, nullable)
  ├── cost_center_id (FK, nullable)
  ├── budget_id (FK, nullable)
  ├── status (CHOICE: submitted, approved, paid, cancelled)
  ├── requires_approval (BOOLEAN)
  ├── approved_by (FK to User, nullable)
  ├── approved_at
  ├── submitted_by (FK to User)
  ├── submitted_at
  └── created_at

PurchaseOrder
  ├── po_number (UNIQUE)
  ├── supplier_id (FK)
  ├── order_date
  ├── expected_delivery_date
  ├── total_amount (DECIMAL)
  ├── status (CHOICE: draft, submitted, approved, received, invoiced, paid, cancelled)
  ├── created_by (FK)
  ├── approved_by (FK, nullable)
  └── created_at
```

---

### Module 8: Inventory Management
**Purpose:** Track school inventory and link to student billing

**Sub-components:**
- Inventory categorization
- Stock tracking
- Student issue tracking
- Auto-charge for issued items
- Low-stock alerts
- Reorder management

**Key Entities:**
```
InventoryItem
  ├── item_code (UNIQUE)
  ├── item_name
  ├── description
  ├── category (CHOICE: uniforms, books, materials, equipment, tools, food, consumables)
  ├── unit_cost (DECIMAL)
  ├── unit_of_measure (e.g., piece, pair, ream)
  ├── reorder_level
  ├── reorder_quantity
  ├── opening_stock
  ├── active
  └── created_at

StockTransaction
  ├── transaction_date
  ├── inventory_item_id (FK)
  ├── transaction_type (CHOICE: purchase, issue, return, adjustment, write_off)
  ├── quantity
  ├── unit_cost (DECIMAL)
  ├── total_cost (DECIMAL)
  ├── reference_number (FK - could link to PO, Student, etc.)
  ├── notes
  ├── created_by (FK)
  └── created_at

StudentIssue
  ├── student_id (FK)
  ├── inventory_item_id (FK)
  ├── issue_date
  ├── quantity
  ├── unit_cost (DECIMAL)
  ├── total_cost (DECIMAL)
  ├── auto_charged (BOOLEAN)
  ├── invoice_id (FK, nullable)
  ├── issued_by (FK)
  └── created_at
```

---

### Module 9: Budgeting & Budget Control
**Purpose:** Plan, approve, monitor, and control spending across the school

**Sub-components:**
- Budget creation and approval
- Budget vs actual tracking
- Budget control enforcement
- Reallocation (virement) management
- Committed cost tracking
- Multi-level budget approval

**Key Entities:**
```
Budget
  ├── budget_code (UNIQUE)
  ├── budget_name
  ├── budget_type (CHOICE: annual, term, monthly, departmental, project)
  ├── fiscal_year_id (FK)
  ├── term_id (FK, nullable)
  ├── month (nullable)
  ├── department_id (FK, nullable)
  ├── cost_center_id (FK, nullable)
  ├── status (CHOICE: draft, submitted, approved, active, closed)
  ├── approved_by (FK, nullable)
  ├── approved_at
  ├── submitted_by (FK)
  ├── submitted_at
  └── created_at

BudgetLineItem
  ├── budget_id (FK)
  ├── account_id (FK)
  ├── category_id (FK, nullable)
  ├── budgeted_amount (DECIMAL)
  ├── actual_amount (DECIMAL)
  ├── committed_amount (DECIMAL) - for POs
  ├── available_balance (DECIMAL)
  ├── variance_amount (DECIMAL)
  ├── variance_percentage (DECIMAL)
  ├── revised_amount (DECIMAL, nullable) - for virements
  ├── created_at
  └── updated_at

BudgetRevision
  ├── budget_id (FK)
  ├── revision_date
  ├── reason (CHOICE: virement, supplementary, correction)
  ├── submitted_by (FK)
  ├── approved_by (FK, nullable)
  ├── approved_at
  └── created_at
```

---

### Module 10: Bursary & Scholarship Management
**Purpose:** Track sponsor funding, scholarships, and automatic discount application

**Sub-components:**
- Sponsor management
- Bursary application workflow
- Scholarship rule engine
- Automatic discount application
- Sponsor statement generation
- Renewal/expiry management

**Key Entities:**
```
Sponsor
  ├── sponsor_code (UNIQUE)
  ├── sponsor_name
  ├── contact_person
  ├── email
  ├── phone
  ├── address
  ├── funding_type (CHOICE: individual, organization, charity, government)
  ├── active
  └── created_at

Scholarship
  ├── scholarship_code (UNIQUE)
  ├── student_id (FK)
  ├── sponsor_id (FK)
  ├── academic_year_id (FK)
  ├── scholarship_type (CHOICE: full, partial, merit, need_based, staff_child)
  ├── discount_type (CHOICE: percentage, fixed_amount)
  ├── discount_value (DECIMAL)
  ├── approved_by (FK)
  ├── start_date
  ├── end_date
  ├── active
  └── created_at
```

---

### Module 11: Audit & Compliance
**Purpose:** Maintain complete audit trail and generate compliance reports

**Sub-components:**
- User activity logging
- Record change tracking
- Permission audit
- Transaction audit
- Exception detection
- Suspicious activity alerts

**Key Entities:**
```
AuditLog
  ├── timestamp
  ├── user_id (FK)
  ├── action (e.g., 'created_invoice', 'recorded_payment', 'approved_expense')
  ├── module (CHOICE: billing, payment, expense, accounting, budget, inventory)
  ├── affected_table
  ├── affected_record_id
  ├── old_values (JSON)
  ├── new_values (JSON)
  ├── ip_address
  ├── user_agent
  ├── reason (nullable)
  ├── status (CHOICE: success, failure)
  └── error_details (nullable)
```

---

## 4. DATABASE SCHEMA SUMMARY

### Core Finance Tables
```
STUDENT FINANCIAL PROFILE
├── StudentFinancialProfile
├── FinancialStatus (status history)

INVOICING
├── Invoice
├── InvoiceLineItem
├── CreditNote
├── DebitNote

PAYMENTS
├── Payment
├── PaymentAllocation
├── Receipt

FEES & TEMPLATES
├── FeeCategory
├── FeeTemplate
├── FeeTemplateLineItem
├── StudentFeeAssignment

TRANSPORT
├── TransportRoute
├── TransportRouteStage
├── TransportAssignment
├── TransportCollection (tracking)

ACCOUNTING
├── Account (Chart of Accounts)
├── GeneralLedger
├── JournalEntry
├── JournalLineItem
├── BankAccount
├── Reconciliation

EXPENSES
├── ExpenseCategory
├── Expense
├── PurchaseRequest
├── PurchaseOrder
├── Supplier

INVENTORY
├── InventoryItem
├── StockTransaction
├── StudentIssue
├── Reorder

BUDGETING
├── Budget
├── BudgetLineItem
├── BudgetRevision
├── BudgetApproval

SCHOLARSHIPS & SPONSORSHIPS
├── Sponsor
├── Scholarship
├── BursaryApplication
├── DiscountRule

AUDIT & CONTROL
├── AuditLog
├── RolePermission
├── UserActivity
├── BackdatedTransaction (audit trail)
├── Exception (unusual transactions)
```

---

## 5. ROLE-BASED ACCESS CONTROL (RBAC) MATRIX

| Role | Module | Permissions |
|------|--------|-------------|
| **Super Admin** | All | Full access, user management, system config |
| **Director** | All | View all, approve budgets, approve expenses >threshold |
| **Headteacher** | Billing, Reports, Dashboard | View, limited approval, strategic decisions |
| **Bursar** | All except user mgmt | Full access except system config |
| **Accountant** | Accounting, Reports, Audit | Create journals, post entries, reconcile |
| **Cashier** | Payment, Receipt, Cash | Record payments, issue receipts, cash management |
| **Admissions Officer** | Billing, Student Profiles | Create profiles, generate initial invoices |
| **Storekeeper** | Inventory, Stock | Record stock, issue items, manage reorders |
| **Transport Manager** | Transport, Reports | Manage routes, collections, reports |
| **Auditor** | Audit, Reports, View All | Audit logs, exception reports, compliance |
| **Class Teacher** | Class Reports, Student Balances | View class financial status, student balances |
| **Parent/Guardian** | Student Portal | View own invoices, payments, statements |

---

## 6. KEY WORKFLOWS

### Workflow 1: New Student Admission to Invoice
```
1. Student Created in System
   ↓
2. Financial Profile Created
   ↓
3. Class/Section/Day-Boarding Assigned
   ↓
4. Fee Template Matched → Student Fee Assignment Created
   ↓
5. Transport Route Assigned (if applicable)
   ↓
6. Inventory Items Issued (uniforms, books, etc.)
   ↓
7. All Charges Aggregated
   ↓
8. Invoice Generated Automatically
   ↓
9. Parent Notified (SMS/Email)
   ↓
10. Payment Awaited
```

### Workflow 2: Parent Payment to Receipt to Ledger
```
1. Parent Makes Payment
   ↓
2. Cashier Records Payment (amount, method, date)
   ↓
3. Payment Linked to Student
   ↓
4. Auto-Allocation Engine Assigns to Inv oices (oldest first or manual)
   ↓
5. StudentBalance Updated in Real-Time
   ↓
6. Receipt Generated & Printed/Emailed
   ↓
7. Journal Entry Auto-Posted:
   DR: Bank/Cash Account
   CR: Student Receivables / Income Account
   ↓
8. Ledger Entries Created (auto-posting)
   ↓
9. Reconciliation Flag Set for Bank Rec
   ↓
10. Transaction Audited
```

### Workflow 3: Expense Request to Payment
```
1. Department Head Submits Expense Request
   ↓
2. Amount Checked Against Budget
   ↓
3. If Over Budget: Requires Director Approval
   If Within Budget: Submitted
   ↓
4. Finance (Bursar/Accountant) Reviews
   ↓
5. If >Threshold: Escalates to Headteacher/Director for Approval
   ↓
6. If Approved: Purchase Order Generated
   ↓
7. PO Reserves Budget
   ↓
8. Supplier Invoice Received
   ↓
9. Three-Way Match: PO ↔ Invoice ↔ Receipt
   ↓
10. Payment Approved
    ↓
11. Journal Entry Posted:
    DR: Expense Account / Asset Account
    CR: Payables / Bank Account
    ↓
12. Payment Made
    ↓
13. Ledger Updated
```

### Workflow 4: Budget Approval Workflow
```
1. Department Prepares Budget
   ↓
2. Submitted to Finance (Bursar)
   ↓
3. Finance Reviews for feasibility
   ↓
4. If OK: Forward to Headteacher
   If Issues: Reject with feedback
   ↓
5. Headteacher Reviews
   ↓
6. If OK: Forward to Director/Board
   If Issues: Reject
   ↓
7. Director/Board Approves
   ↓
8. Budget Locked & Active
   ↓
9. All Expense Requests Checked Against Budget
   ↓
10. Monthly: Budget vs Actual Report Generated
    ↓
11. Variance Analysis Conducted
    ↓
12. If Variance >10%: Alert Generated
```

---

## 7. IMPLEMENTATION PHASES

### PHASE 1: MVP - Core Financial Management (Month 1-2)
**Scope:** Student Financial Profile, Basic Invoicing, Payment Recording, Simple Ledger

**Deliverables:**
1. StudentFinancialProfile model
2. Basic FeeTemplate engine
3. Invoice generation and tracking
4. Simple payment recording
5. Student balance calculation
6. Basic general ledger
7. Dashboard: Outstanding balances, collection rate
8. Reports: Invoice register, receipt register, debtors list
9. Parent portal (view invoices, balances)

**Success Criteria:**
- ✓ Auto-generate invoices on term opening
- ✓ Record payments and auto-update balances
- ✓ Generate basic financial reports
- ✓ Parent self-service portal operational

---

### PHASE 2: Transport & Advanced Billing (Month 2-3)
**Scope:** Transport module, Inventory-linked billing, Advanced fee rules

**Deliverables:**
1. Transport route management
2. Student transport assignment
3. Automatic transport billing
4. Inventory module with student issue tracking
5. Auto-charge for issued items (uniforms, books)
6. Discount and waiver engine
7. Scholarship/Sponsorship integration
8. Reports: Transport income, inventory usage, discount report

**Success Criteria:**
- ✓ Transport fees auto-bill on assignment
- ✓ Issued items auto-charged to student
- ✓ Discounts apply automatically
- ✓ Transport profitability analysis available

---

### PHASE 3: Comprehensive Accounting (Month 3-4)
**Scope:** Full double-entry accounting, multi-period support, reconciliation

**Deliverables:**
1. Complete chart of accounts
2. Full general ledger with auto-posting
3. Sub-ledgers (AR, AP, Bank, Petty Cash)
4. Journal entry management with approval workflow
5. Bank reconciliation module
6. Multi-period accounting
7. Year-end closing procedures
8. Reports: Trial balance, GL, bank reconciliation, AR aging

**Success Criteria:**
- ✓ All invoices and payments auto-posted
- ✓ GL balances match sub-ledgers
- ✓ Bank reconciliation achieved monthly
- ✓ Year-end closing automated

---

### PHASE 4: Budgeting & Control (Month 4-5)
**Scope:** Budget planning, approval workflow, control enforcement

**Deliverables:**
1. Budget creation module with templates
2. Multi-level approval workflow
3. Budget vs actual tracking
4. Committed cost tracking (POs)
5. Budget control enforcement
6. Virement (reallocation) management
7. Reports: Budget vs actual, variance analysis, utilization
8. Dashboards: Budget status, over-budget alerts

**Success Criteria:**
- ✓ Budgets created and approved multi-level
- ✓ Spending controlled against budget
- ✓ Monthly variance analysis automated
- ✓ Over-budget alerts generated

---

### PHASE 5: Expense Management & Workflow (Month 5-6)
**Scope:** Full expense lifecycle, approval routing, supplier management

**Deliverables:**
1. Expense categorization
2. Supplier management
3. Purchase request workflow
4. Purchase order management
5. Three-way match (PO, Invoice, Receipt)
6. Tiered approval routing
7. Departmental budgeting
8. Reports: Expense analysis, supplier analysis, cost center reports

**Success Criteria:**
- ✓ All expenses routed through approval workflow
- ✓ Budget reserved on PO
- ✓ Three-way match enforced
- ✓ Departmental spend visibility

---

### PHASE 6: Advanced Reporting & Audit (Month 6-7)
**Scope:** 50+ financial reports, audit trails, compliance

**Deliverables:**
1. Comprehensive report templates (50+ reports)
2. Scheduled report generation
3. Complete audit trail for all transactions
4. User activity logging
5. Exception detection and alerting
6. Compliance reports
7. Variance investigation tools
8. Export to PDF, Excel, Charts

**Success Criteria:**
- ✓ All reports available on-demand
- ✓ Scheduled reports emailed to management
- ✓ Complete audit trail of all changes
- ✓ Exception reports for fraud detection

---

### PHASE 7: Advanced Features & Optimization (Month 7-8)
**Scope:** Mobile integration, automations, performance tuning

**Deliverables:**
1. Mobile money integration APIs
2. SMS/WhatsApp notifications
3. Automation rules engine
4. Batch processing optimizations
5. Caching strategies
6. API rate limiting and security hardening
7. Advanced dashboards with drill-downs
8. Data migration tools

**Success Criteria:**
- ✓ Mobile money payments integrate
- ✓ Notifications sent automatically
- ✓ Batch reports generated efficiently
- ✓ System handles 1000+ concurrent users

---

## 8. API ENDPOINTS (RESTful Design)

### Student Financial Profile
```
GET    /api/v1/finance/students/profile/
POST   /api/v1/finance/students/profile/
GET    /api/v1/finance/students/{id}/profile/
PUT    /api/v1/finance/students/{id}/profile/
GET    /api/v1/finance/students/{id}/balance/
GET    /api/v1/finance/students/{id}/financial-status/
```

### Invoices
```
GET    /api/v1/finance/invoices/
POST   /api/v1/finance/invoices/
GET    /api/v1/finance/invoices/{id}/
PUT    /api/v1/finance/invoices/{id}/
DELETE /api/v1/finance/invoices/{id}/
POST   /api/v1/finance/invoices/{id}/mark-paid/
POST   /api/v1/finance/invoices/generate-batch/  # Bulk generation
GET    /api/v1/finance/students/{id}/invoices/
```

### Payments
```
GET    /api/v1/finance/payments/
POST   /api/v1/finance/payments/
GET    /api/v1/finance/payments/{id}/
PUT    /api/v1/finance/payments/{id}/
POST   /api/v1/finance/payments/{id}/confirm/
POST   /api/v1/finance/payments/{id}/reverse/
GET    /api/v1/finance/students/{id}/payments/
```

### Ledger & Accounting
```
GET    /api/v1/finance/accounts/
POST   /api/v1/finance/accounts/
GET    /api/v1/finance/accounts/{id}/ledger/
GET    /api/v1/finance/ledger/
POST   /api/v1/finance/journal-entries/
GET    /api/v1/finance/journal-entries/{id}/
GET    /api/v1/finance/trial-balance/
GET    /api/v1/finance/balance-sheet/
GET    /api/v1/finance/income-statement/
```

### Transport
```
GET    /api/v1/finance/transport/routes/
POST   /api/v1/finance/transport/routes/
GET    /api/v1/finance/transport/routes/{id}/
PUT    /api/v1/finance/transport/routes/{id}/
POST   /api/v1/finance/transport/assign-student/
GET    /api/v1/finance/transport/assignments/{student_id}/
```

### Budgets
```
GET    /api/v1/finance/budgets/
POST   /api/v1/finance/budgets/
GET    /api/v1/finance/budgets/{id}/
PUT    /api/v1/finance/budgets/{id}/
POST   /api/v1/finance/budgets/{id}/submit/
POST   /api/v1/finance/budgets/{id}/approve/
GET    /api/v1/finance/budgets/{id}/vs-actual/
```

### Reports
```
GET    /api/v1/finance/reports/
GET    /api/v1/finance/reports/{type}/
GET    /api/v1/finance/reports/debtors-list/
GET    /api/v1/finance/reports/collection-summary/
GET    /api/v1/finance/reports/balance-sheet/
GET    /api/v1/finance/reports/income-statement/
GET    /api/v1/finance/reports/cash-flow/
POST   /api/v1/finance/reports/{id}/export/pdf/
POST   /api/v1/finance/reports/{id}/export/excel/
```

### Audit & Compliance
```
GET    /api/v1/finance/audit-log/
GET    /api/v1/finance/audit-log/{id}/
GET    /api/v1/finance/audit-exceptions/
GET    /api/v1/finance/user-activity/
```

---

## 9. FINANCIAL INTEGRITY & SECURITY

### Double-Entry Accounting Controls
- ✓ All financial transactions auto-post in pairs (DR/CR)
- ✓ GL balances verified before reporting
- ✓ Sub-ledger reconciliation mandatory
- ✓ Period locking prevents backdated entries
- ✓ GL lockdown after financial statement issuance

### Fraud Prevention Controls
- ✓ Duplicate receipt detection
- ✓ Missing receipt sequence detection
- ✓ Unposted transaction alerts
- ✓ Unusual transaction flags (large payments, unusual times)
- ✓ User segregation of duties (Admissions ≠ Cashier ≠ Accountant)
- ✓ Approval workflows for high-value transactions
- ✓ Complete audit trail for all changes

### Data Security
- ✓ Row-level security (users see only their institution's data)
- ✓ Encryption at rest (passwords, PII)
- ✓ Encryption in transit (HTTPS, API tokens)
- ✓ API authentication via JWT
- ✓ Rate limiting on payment endpoints
- ✓ IP whitelisting for sensitive operations
- ✓ Session management with timeouts

---

## 10. RECOMMENDED TECH STACK

**Backend:**
- Django 4.2 with Django REST Framework (existing)
- PostgreSQL for production (SQLite for dev with migration path)
- Celery + Redis for async tasks
- django-filter for advanced filtering
- djangorestframework-simplejwt for auth
- django-audit-log or django-simple-history
- django-celery-beat for scheduling

**Frontend:**
- React + TypeScript (existing)
- Recharts for financial charts
- React Table for complex data grids
- React Hook Form for dynamic forms
- Date-fns for date manipulation
- Papaparse for CSV export
- pdfkit for PDF generation

**DevOps:**
- Docker for containerization
- GitHub Actions for CI/CD
- AWS RDS for managed database
- AWS S3 for report storage
- AWS SQS/SNS for notifications
- New Relic or Datadog for monitoring

---

## 11. SUCCESS METRICS (MVP - Phase 1)

- ✓ 100 invoices generated automatically per day
- ✓ Payment recorded within 5 minutes of receipt
- ✓ Student balance calculated in <1 second
- ✓ 99.9% data consistency (GL balances AR)
- ✓ Zero manual balance adjustments needed
- ✓ 95% parent adoption of self-service portal
- ✓ Reports generated in <30 seconds
- ✓ Zero failed transactions in audit log
- ✓ Zero data loss incidents
- ✓ 100% compliance with financial controls

---

## 12. RISKS & MITIGATION

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Data loss | Critical | Automated backups every 4 hours, PIT recovery to any timestamp |
| Duplicate receipts | High | Receipt sequence validation, UI lock-outs, audit alerts |
| Unbalanced GL | Critical | Nightly GL health check, immediate alerts if unbalanced |
| Fraudulent payments | High | Approval workflows, user segregation, exceptional transaction alerts |
| Performance degradation | Medium | Caching, async processing, database indexing, load testing |
| Scope creep | High | Strict phase gate process, change management review |
| Staff resistance | Medium | Training, champion users, gradual rollout per department |

---

This architecture provides a foundation for a world-class Financial Management System for schools in Uganda. Each phase builds on the previous, delivering immediate value while building towards a comprehensive ERP over 8 months.

