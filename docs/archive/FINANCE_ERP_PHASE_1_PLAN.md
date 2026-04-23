# Edify Finance ERP - Phase 1 Implementation Plan
**MVP: Core Financial Management (Month 1-2)**

---

## PHASE 1 OVERVIEW

**Duration:** 2 months  
**Team Size:** 1-2 Full Stack Developers + 1 QA  
**Tech Stack:** Django 4.2, DRF, React, PostgreSQL, Celery  

**Objective:** Deliver a working financial system that can:
- Auto-generate invoices at term opening
- Record payments and update balances in real-time
- Generate basic financial reports
- Provide parent self-service portal
- Implement core audit trail

**Success Metrics:**
- ✓ 100 invoices auto-generated per day
- ✓ Payment recorded and balanced in < 5 min
- ✓ Student balance calculated in < 1 sec
- ✓ Reports generated in < 30 sec
- ✓ 99% data accuracy (GL balances AR)

---

## PHASE 1 DELIVERABLES

### BACKEND (Django/DRF)

#### 1. Models (Django ORM)
```
edify_backend/apps/finance/
├── models/
│   ├── __init__.py
│   ├── student_profile.py      # StudentFinancialProfile
│   ├── invoicing.py             # Invoice, InvoiceLineItem, CreditNote
│   ├── payments.py              # Payment, PaymentAllocation, Receipt
│   ├── fees.py                  # FeeCategory, FeeTemplate, TemplateLineItem
│   ├── accounting.py            # Account, GeneralLedger, JournalEntry
│   ├── audit.py                 # AuditLog, FinancialStatusHistory
│   └── support.py               # CostCenter, FiscalYear
```

#### 2. Serializers (DRF)
```
├── serializers/
│   ├── __init__.py
│   ├── student_profile.py
│   ├── invoicing.py
│   ├── payments.py
│   ├── fees.py
│   ├── accounting.py
│   └── reports.py
```

#### 3. Views & ViewSets
```
├── views/
│   ├── __init__.py
│   ├── student_profile.py       # StudentFinancialProfileViewSet
│   ├── invoicing.py             # InvoiceViewSet, actions for bulk generation
│   ├── payments.py              # PaymentViewSet, allocation
│   ├── fees.py                  # FeeTemplateViewSet
│   ├── accounting.py            # GeneralLedgerViewSet
│   ├── dashboard.py             # Dashboard API endpoints
│   └── reports.py               # Report generation endpoints
```

#### 4. APIs
```
├── urls.py                       # REST routes
└── Services/Business Logic
    ├── invoice_service.py        # Auto-generate invoices
    ├── payment_service.py        # Record & allocate payments
    ├── balance_service.py        # Calculate balances
    ├── report_service.py         # Generate reports
    └── audit_service.py          # Log all actions
```

#### 5. Management Commands (for batch processing)
```
├── management/commands/
│   ├── generate_term_invoices.py
│   ├── update_balances.py
│   ├── reconcile_accounts.py
│   └── generate_reports.py
```

#### 6. Signals (Auto-posting to GL)
```
├── signals.py
    # Auto-post invoices to AR
    # Auto-post payments to Bank/Income
    # Auto-post credit notes
```

---

## BACKEND IMPLEMENTATION CHECKLIST

### Week 1-2: Models & Database

- [ ] Create `finance` app in Django
- [ ] Model: `StudentFinancialProfile`
  - [ ] Link to Student, Class, Guardian
  - [ ] Balance tracking fields
  - [ ] Status tracking
  
- [ ] Model: `Invoice` + `InvoiceLineItem`
  - [ ] Invoice number generation (sequential, unique)
  - [ ] Status workflow
  - [ ] Amount calculations (gross, discount, net)
  
- [ ] Model: `FeeCategory` + `FeeTemplate` + `FeeTemplateLineItem`
  - [ ] Class-based templates
  - [ ] Optional vs mandatory fees
  - [ ] Recurring charge support
  
- [ ] Model: `Payment` + `PaymentAllocation` + `Receipt`
  - [ ] Multi-method payment support
  - [ ] Allocation logic
  - [ ] Receipt tracking
  
- [ ] Model: `Account` (Chart of Accounts)
  - [ ] Account hierarchy (parent-child)
  - [ ] Account types (asset, liability, equity, income, expense)
  - [ ] GL account linking
  
- [ ] Model: `GeneralLedger`
  - [ ] Posting records
  - [ ] Account balances
  
- [ ] Model: `AuditLog`
  - [ ] User tracking
  - [ ] Action tracking
  - [ ] Value change tracking
  
- [ ] Migrations & Database Setup
  - [ ] Run migrations
  - [ ] Create sample GL chart of accounts
  - [ ] Test data setup

---

### Week 2-3: Business Logic & Services

- [ ] InvoiceService
  - [ ] `generate_invoices_for_term()` - Bulk invoice generation
  - [ ] `auto_generate_on_term_opening()` - Scheduled task
  - [ ] `calculate_amount()` - Apply fee template
  - [ ] `apply_discounts()` - Auto-apply scholarships
  - [ ] `mark_overdue()` - Flag old invoices
  - [ ] `send_notifications()` - Parent SMS/Email
  
- [ ] PaymentService
  - [ ] `record_payment()` - Store payment
  - [ ] `allocate_payment()` - Assign to invoices
  - [ ] `calculate_balance()` - Update AR
  - [ ] `reverse_payment()` - Handle refunds
  - [ ] `generate_receipt()` - Issue receipt
  - [ ] `auto_post_to_gl()` - Post to bank account and income account
  
- [ ] BalanceService
  - [ ] `calculate_current_balance()` - Real-time balance
  - [ ] `calculate_arrears()` - Age of debt
  - [ ] `update_status()` - Active/Cleared/Arrears
  - [ ] `cache_balance()` - Redis caching for performance
  
- [ ] ReportService
  - [ ] `student_statement()` - Single student report
  - [ ] `family_statement()` - Multi-child statement
  - [ ] `debtors_list()` - Arrears report
  - [ ] `collection_summary()` - Daily/weekly/monthly
  - [ ] `invoice_register()` - All invoices issued
  - [ ] `receipt_register()` - All payments received
  - [ ] PDF export (reportlab or weasyprint)
  - [ ] Excel export (openpyxl)
  
- [ ] AuditService
  - [ ] `log_action()` - Record all changes
  - [ ] `track_invoice_changes()` - Who changed what
  - [ ] `track_payment_changes()` - Full history

---

### Week 3-4: API Endpoints

- [ ] StudentFinancialProfile API
  ```
  GET    /api/v1/finance/students/{id}/profile/
  PUT    /api/v1/finance/students/{id}/profile/
  GET    /api/v1/finance/students/{id}/balance/
  GET    /api/v1/finance/students/{id}/financial-status/
  ```
  
- [ ] Invoice API
  ```
  GET    /api/v1/finance/invoices/  # List with filters
  POST   /api/v1/finance/invoices/  # Create manual
  GET    /api/v1/finance/invoices/{id}/
  PUT    /api/v1/finance/invoices/{id}/
  DELETE /api/v1/finance/invoices/{id}/  # Soft delete
  POST   /api/v1/finance/invoices/{id}/mark-paid/
  POST   /api/v1/finance/invoices/generate-batch/  # Bulk generation
  GET    /api/v1/finance/students/{id}/invoices/
  ```
  
- [ ] Payment API
  ```
  GET    /api/v1/finance/payments/  # List with filters
  POST   /api/v1/finance/payments/  # Record payment
  GET    /api/v1/finance/payments/{id}/
  PUT    /api/v1/finance/payments/{id}/  # Edit pending payment
  POST   /api/v1/finance/payments/{id}/confirm/
  POST   /api/v1/finance/payments/{id}/reverse/
  GET    /api/v1/finance/students/{id}/payments/
  POST   /api/v1/finance/payments/{id}/allocate/  # Auto-allocate
  ```
  
- [ ] General Ledger API
  ```
  GET    /api/v1/finance/accounts/
  GET    /api/v1/finance/accounts/{id}/ledger/
  GET    /api/v1/finance/ledger/  # Full GL
  ```
  
- [ ] Reports API
  ```
  GET    /api/v1/finance/reports/
  GET    /api/v1/finance/reports/debtors-list/
  GET    /api/v1/finance/reports/collection-summary/
  GET    /api/v1/finance/reports/student-statement/{id}/
  GET    /api/v1/finance/reports/family-statement/{guardian_id}/
  GET    /api/v1/finance/reports/invoice-register/
  GET    /api/v1/finance/reports/receipt-register/
  POST   /api/v1/finance/reports/{id}/export/pdf/
  POST   /api/v1/finance/reports/{id}/export/excel/
  ```
  
- [ ] Dashboard API
  ```
  GET    /api/v1/finance/dashboard/summary/
  GET    /api/v1/finance/dashboard/daily-collection/
  GET    /api/v1/finance/dashboard/outstanding-balances/
  ```

---

### Week 4: Authentication & Permissions

- [ ] Role-Based Access Control
  - [ ] Bursar: Full access
  - [ ] Cashier: Can record payments, view balances
  - [ ] Accountant: Can view GL, post journals (Phase 3)
  - [ ] Class Teacher: Can view class balances
  - [ ] Parent/Guardian: Can view own student invoices/balances
  - [ ] Admin: System config
  
- [ ] Permission Decorators
  - [ ] @permission_required('finance.view_invoice')
  - [ ] @permission_required('finance.record_payment')
  - [ ] @permission_required('finance.approve_discount')
  
- [ ] Row-Level Security
  - [ ] Parents see only their children
  - [ ] Teachers see only their class
  - [ ] School staff see school-scoped data

---

### Week 4: Testing & QA

- [ ] Unit Tests
  - [ ] Balance calculation
  - [ ] Invoice generation
  - [ ] Payment allocation
  - [ ] GL posting
  
- [ ] Integration Tests
  - [ ] Invoice → Payment → GL posting full flow
  - [ ] Balance updates
  - [ ] Report accuracy
  
- [ ] API Tests
  - [ ] All endpoints
  - [ ] Authentication
  - [ ] Permissions
  - [ ] Data validation
  
- [ ] Database Tests
  - [ ] Data integrity
  - [ ] Referential integrity
  - [ ] Triggers/Constraints

---

## FRONTEND (React/TypeScript)

### Components Structure
```
src/components/
├── Finance/
│   ├── Dashboard/
│   │   ├── DashboardFinance.tsx       # Main finance dashboard
│   │   ├── OutstandingBalances.tsx    # Balance widget
│   │   ├── DailyCollection.tsx        # Collection widget
│   │   └── CollectionChart.tsx        # Charts
│   │
│   ├── Invoicing/
│   │   ├── InvoiceList.tsx            # Invoice list with filters
│   │   ├── InvoiceDetail.tsx          # Single invoice view
│   │   ├── InvoiceForm.tsx            # Create/edit invoice
│   │   ├── BulkInvoiceGeneration.tsx  # Term opening invoices
│   │   └── InvoicePrinter.tsx         # Print-friendly view
│   │
│   ├── Payments/
│   │   ├── PaymentRecording.tsx       # Record payment form
│   │   ├── PaymentAllocation.tsx      # Allocate to invoices
│   │   ├── PaymentList.tsx            # List payments
│   │   └── Receipt.tsx                # Print receipt
│   │
│   ├── Reports/
│   │   ├── ReportList.tsx             # Available reports
│   │   ├── StudentStatement.tsx       # Single student report
│   │   ├── FamilyStatement.tsx        # Multi-child report
│   │   ├── DebtorsList.tsx            # Arrears report
│   │   ├── CollectionSummary.tsx      # Daily/weekly/monthly
│   │   ├── InvoiceRegister.tsx        # All invoices
│   │   ├── ReceiptRegister.tsx        # All payments
│   │   └── ReportExporter.tsx         # PDF/Excel export
│   │
│   ├── FeeSettings/
│   │   ├── FeeTemplateList.tsx        # List templates
│   │   ├── FeeTemplateForm.tsx        # Create/edit template
│   │   └── FeeLineItemEditor.tsx      # Add line items
│   │
│   └── Common/
│       ├── BalanceDisplay.tsx         # Reusable balance widget
│       ├── FinancialStatusBadge.tsx   # Status indicator
│       └── FinanceFilters.tsx         # Common filters
```

### Phase 1 Pages
```
pages/
├── FinanceDashboard.tsx               # Main landing page
├── InvoicesPage.tsx                   # Invoicing module
├── PaymentsPage.tsx                   # Payment recording
├── ReportsPage.tsx                    # Report generation
├── FeeSettingsPage.tsx                # Fee configuration
└── ParentPortal.tsx                   # Parent self-service
```

### Key Features
- [ ] Material-UI or Tailwind components
- [ ] Real-time balance updates
- [ ] Invoice PDF generation (client-side with jsPDF)
- [ ] Payment form with validation
- [ ] Data tables with sorting/filtering
- [ ] Charts (Recharts for visualizations)
- [ ] Responsive mobile-friendly design
- [ ] Dark mode support

---

## PARENT/STUDENT PORTAL

### Pages
- [ ] Login page
- [ ] Dashboard (balance summary, payment due)
- [ ] View Invoices (list, detail, download)
- [ ] Payment Proof Upload (manual reconciliation)
- [ ] Transaction History
- [ ] Download Statement (PDF)
- [ ] Payment Reminders

### Features
- [ ] Student selection (multi-child support)
- [ ] Invoice filters (by term, status, date)
- [ ] Balance tracking
- [ ] Payment due date alerts
- [ ] Invoice download/print
- [ ] Mobile-responsive

---

## AUTOMATION & SCHEDULED TASKS

### Celery Tasks

- [ ] `tasks/invoicing.py`
  ```python
  @periodic_task(run_every=crontab(hour=0, minute=0, day_of_week=0))
  def generate_sunday_invoices():
      # Generate invoices at term opening
      InvoiceService.generate_invoices_for_term()
  
  @periodic_task(run_every=crontab(hour=18, minute=0))  # 6 PM daily
  def send_payment_reminders():
      # Send SMS/email reminders for overdue invoices
      InvoiceService.send_overdue_reminders()
  
  @periodic_task(run_every=crontab(hour=22, minute=0))  # 10 PM daily
  def update_financial_status():
      # Mark accounts as clearedif all invoices paid
      BalanceService.update_all_student_status()
  ```

- [ ] `tasks/reporting.py`
  ```python
  @periodic_task(run_every=crontab(hour=7, minute=0))  # 7 AM weekdays
  def daily_collection_report():
      # Email collection summary to finance team
      pass
  
  @periodic_task(run_every=crontab(hour=9, minute=0, day_of_week=0))  # Sunday morning
  def weekly_summary_report():
      # Email weekly summary to director
      pass
  ```

---

## TESTING SCENARIOS

### Business Logic Tests

1. **Invoice Generation**
   - Create student profile
   - Assign fee template
   - Generate invoice
   - Verify amounts, GL posting
   - ✓ Invoice created with correct amount
   - ✓ GL posting created
   - ✓ Parent notified

2. **Payment Recording**
   - Record cash payment
   - Allocate to invoice
   - Verify balance update
   - ✓ Payment recorded
   - ✓ Invoice marked partially paid
   - ✓ Receipt generated
   - ✓ GL posting created
   - ✓ Balance updated in real-time

3. **Balance Calculation**
   - Create invoice for 1,000,000 UGX
   - Record payment of 600,000 UGX
   - Calculate balance
   - ✓ Outstanding = 400,000 UGX
   - ✓ Status = partially_paid

4. **Report Generation**
   - Query invoices, payments, balances
   - Generate debtors list
   - ✓ Report shows correct data
   - ✓ Filters work
   - ✓ Export to PDF/Excel works

---

## DEPLOYMENT & MIGRATION

### Database Setup
```bash
# Create finance app
python manage.py startapp finance

# Create models
# Create migrations
python manage.py makemigrations finance

# Run migrations
python manage.py migrate finance

# Load initial data (GL chart)
python manage.py loaddata finance/fixtures/chart_of_accounts.json
python manage.py loaddata finance/fixtures/fee_categories.json
```

### Environment Variables
```
FINANCE_INVOICE_PREFIX=INV-2024-
FINANCE_RECEIPT_PREFIX=RCP-2024-
FINANCE_PAYMENT_METHODS=cash,bank,mobile_money
FINANCE_AUTO_POST_TO_GL=True
FINANCE_SEND_NOTIFICATIONS=True
FINANCE_NOTIFICATION_METHODS=sms,email
```

---

## SUCCESS CRITERIA & KPIs

**Week 1-2:**
- ✓ All models created and migrated
- ✓ Basic CRUD operations work
- ✓ User can view student profile

**Week 2-3:**
- ✓ Invoice generation working (bulk)
- ✓ Payment recording working
- ✓ Balance calculations accurate
- ✓ GL posting automated

**Week 3-4:**
- ✓ All APIs tested and working
- ✓ Frontend forms collecting data
- ✓ Reports generating correctly
- ✓ Parent portal functional

**End of Phase 1:**
- ✓ 100 invoices generated and tracked
- ✓ Payment recorded in <5 minutes
- ✓ Balance accurate to the cent
- ✓ Reports accurate and timely
- ✓ 99% data consistency

---

## RISKS & MITIGATIONS

| Risk | Impact | Mitigation |
|------|--------|-----------|
| GL balance doesn't match AR | Critical | Nightly reconciliation script, alerts |
| Duplicate invoices generated | High | Unique constraints, idempotent logic |
| Payment not allocated correctly | High | Multi-level allocation validation |
| Notification system failure | Medium | Queue retry logic, fallback SMS gateway |
| Performance degradation | Medium | Database indexing, caching, async tasks |
| Data loss | Critical | Automated backups, point-in-time recovery |

---

## NEXT STEPS

After Phase 1 completes:
1. User acceptance testing with finance team
2. Live data migration from legacy system
3. Staff training
4. Go-live with monitoring
5. Begin Phase 2 (Transport & Advanced Billing)

---

This Phase 1 plan is intentionally focused on delivering working software quickly while maintaining quality and financial integrity.

