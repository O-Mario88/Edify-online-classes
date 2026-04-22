# 📡 FINANCE ERP - API ENDPOINT REFERENCE

**Complete guide to all 50+ REST API endpoints in the Finance ERP system**

---

## 🚀 Quick API Test Command

```bash
# Get auth token
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'

# Save token as environment variable
TOKEN="your_token_here"

# Test an endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/finance/students/
```

---

## 📚 API ENDPOINTS BY MODULE

### 1️⃣ STUDENTS & FINANCIAL PROFILES

| Method | Endpoint | Purpose | Notes |
|--------|----------|---------|-------|
| GET | `/api/v1/finance/students/` | List all students | Paginated, filterable |
| POST | `/api/v1/finance/students/` | Create new student profile | Admin only |
| GET | `/api/v1/finance/students/{id}/` | Get student details | Full profile + balance |
| PUT | `/api/v1/finance/students/{id}/` | Update student | Name, contact, etc |
| DELETE | `/api/v1/finance/students/{id}/` | Soft delete student | Audit logged |
| GET | `/api/v1/finance/students/{id}/balance/` | Get current balance | Real-time calculation |
| GET | `/api/v1/finance/students/{id}/invoices/` | Get student invoices | All invoices for student |
| GET | `/api/v1/finance/students/{id}/payments/` | Get student payments | Complete payment history |
| POST | `/api/v1/finance/students/{id}/update_balance/` | Recalculate balance | Force refresh (admin) |

**Sample Response - Student List:**
```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "user": {"id": 2, "username": "student01"},
      "student_number": "STD-2024-001",
      "current_balance": -445000,
      "arrears_balance": 445000,
      "financial_status": "in_arrears",
      "day_scholar": true
    }
  ]
}
```

---

### 2️⃣ INVOICES & BILLING

| Method | Endpoint | Purpose | Notes |
|--------|----------|---------|-------|
| GET | `/api/v1/finance/invoices/` | List all invoices | Searchable, filterable |
| POST | `/api/v1/finance/invoices/` | Create invoice | Issue new bill |
| GET | `/api/v1/finance/invoices/{id}/` | Get invoice details | Full with line items |
| PUT | `/api/v1/finance/invoices/{id}/` | Update invoice | Before issued |
| DELETE | `/api/v1/finance/invoices/{id}/` | Delete invoice | Before issued only |
| GET | `/api/v1/finance/invoices/outstanding/` | Get outstanding invoices | Not yet paid |
| GET | `/api/v1/finance/invoices/overdue/` | Get overdue invoices | Past due date |
| POST | `/api/v1/finance/invoices/{id}/issue/` | Issue invoice | Change status to issued |
| POST | `/api/v1/finance/invoices/{id}/mark_overdue/` | Mark as overdue | Update status |
| POST | `/api/v1/finance/invoices/generate_batch/` | Generate batch invoices | Create multiple |

**Sample Response - Invoice:**
```json
{
  "id": 1,
  "invoice_number": "INV-2024-1001",
  "student": 1,
  "amount": "645000.00",
  "amount_paid": "200000.00",
  "amount_outstanding": "445000.00",
  "invoice_date": "2024-01-15",
  "due_date": "2024-02-01",
  "status": "partially_paid",
  "is_overdue": true,
  "days_overdue": 65,
  "line_items": [
    {
      "id": 1,
      "description": "Tuition Fee",
      "amount": "500000.00",
      "quantity": 1
    }
  ]
}
```

---

### 3️⃣ INVOICE LINE ITEMS

| Method | Endpoint | Purpose | Notes |
|--------|----------|---------|-------|
| GET | `/api/v1/finance/invoice-line-items/` | List all line items | Detail items on invoices |
| POST | `/api/v1/finance/invoice-line-items/` | Add line item | Add to invoice |
| GET | `/api/v1/finance/invoice-line-items/{id}/` | Get line item | Details |
| PUT | `/api/v1/finance/invoice-line-items/{id}/` | Update line item | Before invoice issued |
| DELETE | `/api/v1/finance/invoice-line-items/{id}/` | Remove line item | Before invoice issued |

---

### 4️⃣ PAYMENTS & RECEIPTS

| Method | Endpoint | Purpose | Notes |
|--------|----------|---------|-------|
| GET | `/api/v1/finance/payments/` | List all payments | All payment records |
| POST | `/api/v1/finance/payments/` | Record payment | Create new payment |
| GET | `/api/v1/finance/payments/{id}/` | Get payment details | Full detail with allocations |
| PUT | `/api/v1/finance/payments/{id}/` | Update payment | Before confirmed |
| DELETE | `/api/v1/finance/payments/{id}/` | Delete payment | Before confirmed |
| GET | `/api/v1/finance/payments/unallocated/` | Get unallocated payments | Need allocation |
| GET | `/api/v1/finance/payments/pending/` | Get pending payments | Waiting confirmation |
| POST | `/api/v1/finance/payments/{id}/confirm/` | Confirm payment | Change to confirmed |
| POST | `/api/v1/finance/payments/{id}/allocate/` | Allocate to invoices | Assign to bills |
| POST | `/api/v1/finance/payments/{id}/reverse/` | Reverse payment | Undo payment |

**Sample Response - Payment:**
```json
{
  "id": 1,
  "payment_number": "PAY-2024-001",
  "student": 1,
  "amount": "200000.00",
  "payment_method": "bank_transfer",
  "payment_date": "2024-02-15",
  "status": "confirmed",
  "allocations": [
    {
      "id": 1,
      "invoice": 1,
      "amount": "200000.00"
    }
  ]
}
```

---

### 5️⃣ PAYMENT ALLOCATIONS

| Method | Endpoint | Purpose | Notes |
|--------|----------|---------|-------|
| GET | `/api/v1/finance/payment-allocations/` | List allocations | Payment to invoice mapping |
| POST | `/api/v1/finance/payment-allocations/` | Create allocation | Link payment to invoice |
| GET | `/api/v1/finance/payment-allocations/{id}/` | Get allocation | Details |
| PUT | `/api/v1/finance/payment-allocations/{id}/` | Update allocation | Adjust amount |
| DELETE | `/api/v1/finance/payment-allocations/{id}/` | Remove allocation | Unlink from invoice |

---

### 6️⃣ RECEIPTS

| Method | Endpoint | Purpose | Notes |
|--------|----------|---------|-------|
| GET | `/api/v1/finance/receipts/` | List all receipts | All payment receipts |
| POST | `/api/v1/finance/receipts/` | Create receipt | Print receipt |
| GET | `/api/v1/finance/receipts/{id}/` | Get receipt | View receipt detail |
| POST | `/api/v1/finance/receipts/{id}/reprint/` | Reprint receipt | Print again (audit logged) |

---

### 7️⃣ FEE SETUP

| Method | Endpoint | Purpose | Notes |
|--------|----------|---------|-------|
| GET | `/api/v1/finance/fee-categories/` | List fee types | What you charge for |
| POST | `/api/v1/finance/fee-categories/` | Create fee category | New fee type |
| GET | `/api/v1/finance/fee-categories/{id}/` | Get category details | Details |
| PUT | `/api/v1/finance/fee-categories/{id}/` | Update category | Name, description |

**Sample - Fee Category:**
```json
{
  "id": 1,
  "name": "Tuition",
  "code": "TUITION",
  "description": "Tuition fees per term",
  "amount": "500000.00",
  "is_mandatory": true,
  "is_recurring": true
}
```

---

### 8️⃣ FEE TEMPLATES

| Method | Endpoint | Purpose | Notes |
|--------|----------|---------|-------|
| GET | `/api/v1/finance/fee-templates/` | List fee templates | Bill templates |
| POST | `/api/v1/finance/fee-templates/` | Create template | New billing template |
| GET | `/api/v1/finance/fee-templates/{id}/` | Get template detail | Full details with items |
| PUT | `/api/v1/finance/fee-templates/{id}/` | Update template | Modify before use |
| POST | `/api/v1/finance/fee-templates/{id}/approve/` | Approve template | For use in billing |
| POST | `/api/v1/finance/fee-templates/{id}/activate/` | Activate template | Mark as current |

---

### 9️⃣ FEE TEMPLATE LINE ITEMS

| Method | Endpoint | Purpose | Notes |
|--------|----------|---------|-------|
| GET | `/api/v1/finance/fee-template-line-items/` | List all fee items | What's included in templates |
| POST | `/api/v1/finance/fee-template-line-items/` | Add fee item | Add category to template |
| GET | `/api/v1/finance/fee-template-line-items/{id}/` | Get item detail | Details |
| PUT | `/api/v1/finance/fee-template-line-items/{id}/` | Update item | Modify amount/notes |
| DELETE | `/api/v1/finance/fee-template-line-items/{id}/` | Remove item | Remove from template |

---

### 🔟 STUDENT FEE ASSIGNMENTS

| Method | Endpoint | Purpose | Notes |
|--------|----------|---------|-------|
| GET | `/api/v1/finance/student-fee-assignments/` | List assignments | Which students use which templates |
| POST | `/api/v1/finance/student-fee-assignments/` | Assign template | Apply template to student |
| GET | `/api/v1/finance/student-fee-assignments/{id}/` | Get assignment | Details |
| PUT | `/api/v1/finance/student-fee-assignments/{id}/` | Update assignment | Change dates or notes |
| DELETE | `/api/v1/finance/student-fee-assignments/{id}/` | Remove assignment | Stop using this template |

---

### 1️⃣1️⃣ ACCOUNTS (Chart of Accounts)

| Method | Endpoint | Purpose | Notes |
|--------|----------|---------|-------|
| GET | `/api/v1/finance/accounts/` | List all accounts | Full GL chart |
| POST | `/api/v1/finance/accounts/` | Create account | New GL account |
| GET | `/api/v1/finance/accounts/{id}/` | Get account detail | Balance + transactions |
| PUT | `/api/v1/finance/accounts/{id}/` | Update account | Name, description |
| POST | `/api/v1/finance/accounts/{id}/balance/` | Get account balance | Current balance |

**Sample - Account:**
```json
{
  "id": 3,
  "account_code": "1200",
  "account_name": "Student Accounts Receivable",
  "account_type": "asset",
  "balance": "1090000.00",
  "gl_entries": [
    {
      "id": 1,
      "date": "2024-01-15",
      "description": "Invoice INV-2024-1001",
      "debit": "645000.00",
      "credit": null
    }
  ]
}
```

---

### 1️⃣2️⃣ JOURNAL ENTRIES (Accounting)

| Method | Endpoint | Purpose | Notes |
|--------|----------|---------|-------|
| GET | `/api/v1/finance/journal-entries/` | List all entries | All GL postings |
| POST | `/api/v1/finance/journal-entries/` | Create entry | Manual GL posting |
| GET | `/api/v1/finance/journal-entries/{id}/` | Get entry detail | Full with line items |
| PUT | `/api/v1/finance/journal-entries/{id}/` | Update entry | Before approved |
| DELETE | `/api/v1/finance/journal-entries/{id}/` | Delete entry | Before approved |
| POST | `/api/v1/finance/journal-entries/{id}/submit/` | Submit for approval | Change status |
| POST | `/api/v1/finance/journal-entries/{id}/approve/` | Approve entry | Authorized user approval |
| POST | `/api/v1/finance/journal-entries/{id}/post/` | Post to GL | Make GL posting final |
| POST | `/api/v1/finance/journal-entries/{id}/reverse/` | Reverse entry | Undo posting |

**Sample - Journal Entry:**
```json
{
  "id": 1,
  "entry_date": "2024-02-15",
  "reference": "INV-2024-1001",
  "description": "Invoice posting",
  "status": "posted",
  "line_items": [
    {
      "account": 3,
      "debit": "645000.00",
      "credit": null,
      "description": "Student AR"
    },
    {
      "account": 10,
      "debit": null,
      "credit": "645000.00",
      "description": "Tuition Income"
    }
  ]
}
```

---

### 1️⃣3️⃣ JOURNAL LINE ITEMS

| Method | Endpoint | Purpose | Notes |
|--------|----------|---------|-------|
| GET | `/api/v1/finance/journal-line-items/` | List all line items | Individual GL postings |
| POST | `/api/v1/finance/journal-line-items/` | Create line item | Add line to entry |
| GET | `/api/v1/finance/journal-line-items/{id}/` | Get item detail | Details |
| PUT | `/api/v1/finance/journal-line-items/{id}/` | Update item | Adjust before approval |
| DELETE | `/api/v1/finance/journal-line-items/{id}/` | Remove item | Remove before approval |

---

### 1️⃣4️⃣ GENERAL LEDGER (GL View)

| Method | Endpoint | Purpose | Notes |
|--------|----------|---------|-------|
| GET | `/api/v1/finance/general-ledger/` | List GL entries | Read-only GL view |
| POST | `/api/v1/finance/general-ledger/trial_balance/` | Get trial balance | All accounts + balances |
| POST | `/api/v1/finance/general-ledger/{account}/account_balance/` | Get account balance | Balance for one account |

**Sample - Trial Balance:**
```json
[
  {
    "account_code": "1010",
    "account_name": "Cash",
    "debit": "500000.00",
    "credit": null,
    "balance": "500000.00"
  },
  {
    "account_code": "1200",
    "account_name": "Student AR",
    "debit": "1290000.00",
    "credit": "200000.00",
    "balance": "1090000.00"
  }
]
```

---

### 1️⃣5️⃣ BANK ACCOUNTS

| Method | Endpoint | Purpose | Notes |
|--------|----------|---------|-------|
| GET | `/api/v1/finance/bank-accounts/` | List accounts | All bank accounts |
| POST | `/api/v1/finance/bank-accounts/` | Create account | Add bank account |
| GET | `/api/v1/finance/bank-accounts/{id}/` | Get details | Account info |
| PUT | `/api/v1/finance/bank-accounts/{id}/` | Update account | Name, balance |
| POST | `/api/v1/finance/bank-accounts/{id}/reconcile/` | Reconcile account | Mark as reconciled |

---

### 1️⃣6️⃣ FINANCIAL PERIODS

| Method | Endpoint | Purpose | Notes |
|--------|----------|---------|-------|
| GET | `/api/v1/finance/financial-periods/` | List periods | All time periods |
| POST | `/api/v1/finance/financial-periods/` | Create period | New month/quarter/year |
| GET | `/api/v1/finance/financial-periods/{id}/` | Get period | Details |
| PUT | `/api/v1/finance/financial-periods/{id}/` | Update period | Adjust dates |
| POST | `/api/v1/finance/financial-periods/{id}/close/` | Close period | Lock from changes |

---

### 1️⃣7️⃣ CREDIT NOTES

| Method | Endpoint | Purpose | Notes |
|--------|----------|---------|-------|
| GET | `/api/v1/finance/credit-notes/` | List all credit notes | Refunds/adjustments |
| POST | `/api/v1/finance/credit-notes/` | Create credit note | Issue refund |
| GET | `/api/v1/finance/credit-notes/{id}/` | Get credit note | Details |
| PUT | `/api/v1/finance/credit-notes/{id}/` | Update note | Before approved |
| DELETE | `/api/v1/finance/credit-notes/{id}/` | Delete note | Before approved |
| POST | `/api/v1/finance/credit-notes/{id}/approve/` | Approve note | Authorize refund |

---

### 1️⃣8️⃣ AUDIT LOGS

| Method | Endpoint | Purpose | Notes |
|--------|----------|---------|-------|
| GET | `/api/v1/finance/audit-logs/` | List all changes | Complete audit trail |
| GET | `/api/v1/finance/audit-logs/{id}/` | Get log detail | Who, what, when, why |

**Sample - Audit Log:**
```json
{
  "id": 1,
  "user": "admin",
  "action": "created_invoice",
  "model": "Invoice",
  "object_id": "1",
  "timestamp": "2024-01-15T10:30:00Z",
  "changes": {
    "student": [null, 1],
    "amount": [null, "645000.00"],
    "status": [null, "draft"]
  }
}
```

---

### 1️⃣9️⃣ COST CENTERS

| Method | Endpoint | Purpose | Notes |
|--------|----------|---------|-------|
| GET | `/api/v1/finance/cost-centers/` | List cost centers | Departments/units |
| POST | `/api/v1/finance/cost-centers/` | Create cost center | New department |
| GET | `/api/v1/finance/cost-centers/{id}/` | Get details | Department info |
| PUT | `/api/v1/finance/cost-centers/{id}/` | Update cost center | Name, manager |

---

### 2️⃣0️⃣ FISCAL YEARS

| Method | Endpoint | Purpose | Notes |
|--------|----------|---------|-------|
| GET | `/api/v1/finance/fiscal-years/` | List fiscal years | All years |
| POST | `/api/v1/finance/fiscal-years/` | Create fiscal year | New year |
| GET | `/api/v1/finance/fiscal-years/{id}/` | Get details | Year info |
| PUT | `/api/v1/finance/fiscal-years/{id}/` | Update fiscal year | Adjust dates |

---

### 2️⃣1️⃣ FINANCE EXCEPTIONS

| Method | Endpoint | Purpose | Notes |
|--------|----------|---------|-------|
| GET | `/api/v1/finance/finance-exceptions/` | List exceptions | GL imbalances, errors |
| POST | `/api/v1/finance/finance-exceptions/` | Report exception | Report new issue |
| GET | `/api/v1/finance/finance-exceptions/{id}/` | Get exception | Details |
| POST | `/api/v1/finance/finance-exceptions/{id}/resolve/` | Resolve exception | Mark as fixed |

---

## 🔍 FILTERING, SEARCHING & SORTING

All list endpoints support:

### Query Parameters
```bash
# Pagination
?page=1
?page_size=50

# Filtering
?status=outstanding
?student=1
?payment_method=bank_transfer
?is_overdue=true

# Searching
?search=charlie
?search=INV-2024-1001

# Ordering
?ordering=due_date
?ordering=-amount (descending)

# Combined
/api/v1/finance/invoices/?status=overdue&ordering=-due_date&page_size=25
```

### Example Queries

```bash
# Get all overdue invoices, newest first
/api/v1/finance/invoices/?status=overdue&ordering=-due_date

# Get student 1's invoices, sorted by due date
/api/v1/finance/invoices/?student=1&ordering=due_date

# Search for invoice INV-2024-1001
/api/v1/finance/invoices/?search=INV-2024-1001

# Get unallocated payments
/api/v1/finance/payments/?status=unallocated

# Get payments from January 2024
/api/v1/finance/payments/?payment_date__gte=2024-01-01&payment_date__lte=2024-01-31
```

---

## 🔐 AUTHENTICATION

All endpoints require JWT token:

```bash
# 1. Get token
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password123"
  }'

# 2. Use in requests
curl -H "Authorization: Bearer eyJ0eXAi..." \
  http://localhost:8000/api/v1/finance/students/

# Token lasts 1 hour (configurable)
# Use refresh endpoint to get new token
```

---

## 📊 COMMON API WORKFLOWS

### Workflow 1: Invoice a Student

```bash
# 1. Get fee template
GET /api/v1/finance/fee-templates/

# 2. Create invoice
POST /api/v1/finance/invoices/
{
  "student": 1,
  "fee_template": 1,
  "invoice_date": "2024-04-01",
  "due_date": "2024-04-15"
}

# 3. Issue invoice
POST /api/v1/finance/invoices/1/issue/

# Invoice is now on student's bill list
```

### Workflow 2: Record & Allocate Payment

```bash
# 1. Record payment
POST /api/v1/finance/payments/
{
  "student": 1,
  "amount": "150000.00",
  "payment_method": "mobile_money",
  "payment_date": "2024-04-05"
}

# 2. Confirm payment
POST /api/v1/finance/payments/1/confirm/

# 3. Allocate to invoice
POST /api/v1/finance/payment-allocations/
{
  "payment": 1,
  "invoice": 1,
  "amount": "150000.00"
}

# 4. Check updated balance
GET /api/v1/finance/students/1/balance/
```

### Workflow 3: Record Journal Entry

```bash
# 1. Create journal entry (manual posting)
POST /api/v1/finance/journal-entries/
{
  "entry_date": "2024-04-05",
  "reference": "MISC-001",
  "description": "Teacher salary payment"
}

# 2. Add line items
POST /api/v1/finance/journal-line-items/
{
  "journal_entry": 1,
  "account": 10,  # Teacher Salaries (expense)
  "debit": "500000.00"
}

POST /api/v1/finance/journal-line-items/
{
  "journal_entry": 1,
  "account": 1,   # Cash (asset)
  "credit": "500000.00"
}

# 3. Submit for approval
POST /api/v1/finance/journal-entries/1/submit/

# 4. Approve
POST /api/v1/finance/journal-entries/1/approve/

# 5. Post to general ledger
POST /api/v1/finance/journal-entries/1/post/
```

---

## 🎯 ENDPOINT SUMMARY TABLE

**Total Endpoints: 50+**

| Module | Count | Base URL |
|--------|-------|----------|
| Students | 9 | `/api/v1/finance/students/` |
| Invoices | 10 | `/api/v1/finance/invoices/` |
| Payments | 10 | `/api/v1/finance/payments/` |
| Accounts | 5 | `/api/v1/finance/accounts/` |
| Journaling | 8 | `/api/v1/finance/journal-entries/` |
| GL | 3 | `/api/v1/finance/general-ledger/` |
| Setup | 16+ | Various |
| **TOTAL** | **50+** | `/api/v1/finance/` |

---

## 💡 TIPS & TRICKS

1. **Always use filtering** - Don't load all records, use filters
2. **Check status codes** - 200 OK, 201 Created, 400 Bad Request, 403 Forbidden, 404 Not Found
3. **Paginate results** - Use `?page=2&page_size=25` for large datasets
4. **Use search** - Fast text search on multiple fields
5. **Check documentation** - Each endpoint has detailed help text

---

## 🧪 TESTING ENDPOINTS (Postman/curl)

```bash
# Import into Postman:
# Create environment with:
# - base_url: http://localhost:8000
# - token: (get from /api/token/)

# Test each endpoint:
GET /api/v1/finance/students/
GET /api/v1/finance/invoices/
GET /api/v1/finance/payments/
GET /api/v1/finance/accounts/
GET /api/v1/finance/general-ledger/
POST /api/v1/finance/general-ledger/trial_balance/
```

---

**Ready to test?** See `FINANCE_LOGIN_CREDENTIALS.md` for test user logins and `FINANCE_TESTING_GUIDE.md` for detailed testing scenarios.
