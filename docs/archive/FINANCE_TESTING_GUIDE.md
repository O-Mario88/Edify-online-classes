# 🧪 Finance ERP - Testing Guide (Institution-Scoped)

**Complete setup for testing the Finance ERP system scoped to institution dashboards**

---

## 📌 Important: Institution-Scoped Access

**The Finance ERP is now institution-scoped and only accessible through the school/institution dashboard.**

- ✅ Accessed via: `/dashboard/institution/{id}/` → Finance Hub tab
- ✅ API endpoints: `/api/v1/institutions/{institution_id}/finance/...`
- ❌ NOT available at: `/api/v1/finance/` (deprecated)
- ✅ Multi-tenant by design: Data strictly isolated by institution

---

## 🚀 QUICK START (2 Steps)

### Step 1: Run Django Migrations

```bash
cd /Users/omario/Desktop/Notebook\ LM/edify\ online\ school

# Generate and apply migrations (includes institution field)
python manage.py makemigrations finance
python manage.py migrate finance

# Create superuser (for admin panel)
python manage.py createsuperuser
```

### Step 2: Populate Test Data

```bash
# Create mock institution with students, teachers, invoices (institution-scoped)
python manage.py populate_finance_test_data --institution=1

# Output shows all test login credentials + institution assignment
```

---

## 📋 TEST LOGIN CREDENTIALS

After running the setup, you'll have these test accounts:

### 🔐 ADMIN LOGIN
```
Username: admin
Password: password123
Email: admin@school.test
Role: Full system access (can create invoices, approve payments, see all data)
```

### 👨‍🏫 TEACHER LOGIN
```
Username: teacher01
Password: password123
Email: teacher@school.test
Role: Can view classes and student payments (limited access)
```

### 👨‍🎓 STUDENT LOGIN #1 (Partial Payment)
```
Username: student01
Password: password123
Email: student1@school.test
First Name: Charlie
Last Name: Student
Status: In Arrears
Outstanding Amount: 445,000 UGX (has paid 200,000 UGX)
Payment History: 1 payment recorded
```

### 👩‍🎓 STUDENT LOGIN #2 (No Payment)
```
Username: student02
Password: password123
Email: student2@school.test
First Name: Diana
Last Name: Scholar
Status: In Arrears
Outstanding Amount: 645,000 UGX (no payments)
Total Invoiced: 645,000 UGX
```

---

## 📊 TEST DATA CREATED

### Institution Details
```
Institution Type: Secondary School (S4/S5/S6)
Location: Uganda (test)
Fiscal Year: 2024
Currency: UGX (Uganda Shilling)
```

### Students
```
Student 1: Charlie Student
  - Email: student1@school.test
  - Status: In Arrears (30 days)
  - Balance: 445,000 UGX
  - Day Scholar: Yes

Student 2: Diana Scholar
  - Email: student2@school.test
  - Status: In Arrears (60 days)
  - Balance: 645,000 UGX
  - Boarding Student: Yes
```

### Fee Structure (Semester Billing)
```
Tuition Fee:        500,000 UGX (mandatory, per term)
Exam Fee:           50,000 UGX (per term)
Lab Fee:            30,000 UGX (per term)
Uniform:            25,000 UGX (one-time)
Books & Supplies:   40,000 UGX (one-time)
─────────────────────────────────
TOTAL PER TERM:     645,000 UGX
```

### Invoices (4 total)
```
Invoice 1: student01 - January 2024 - 645,000 UGX - Partially Paid (200,000 UGX)
Invoice 2: student01 - February 2024 - 645,000 UGX - Outstanding
Invoice 3: student02 - January 2024 - 645,000 UGX - Outstanding
Invoice 4: student02 - February 2024 - 645,000 UGX - Outstanding
```

### Payments (1 total)
```
Payment 1: student01 - 200,000 UGX - Bank Transfer - Confirmed
  - Allocated to Invoice 1: 200,000 UGX
```

### Financial Accounts (8 total)
```
ASSETS:
  1010 - Cash
  1020 - Bank Account
  1200 - Student Accounts Receivable (AR)

INCOME:
  4100 - Tuition Fee Income
  4200 - Exam Fee Income
  4300 - Other Income

EXPENSES:
  5100 - Teacher Salaries
  5200 - Utilities
```

---

## 🧪 TESTING SCENARIOS

### Scenario 1: Access Finance via Institution Dashboard

**As Institution Admin:**
1. Login: http://localhost:8000/dashboard/institution/
2. Username: admin
3. Password: password123
4. Navigate to: Finance & Bursary Hub tab
5. Expected: See institution's financial dashboard
   - Students in this institution only
   - Invoices for this institution only
   - Payments for this institution only

**NOT accessing directly**:
```bash
❌ curl http://localhost:8000/api/v1/finance/students/
# Returns 404 - endpoint doesn't exist

✅ curl http://localhost:8000/api/v1/institutions/1/finance/students/
# Returns 200 - institution-scoped endpoint
```

### Scenario 2: View Institution's Student Balance

**Via Institution Dashboard:**
1. Login and navigate to Finance Hub
2. Go to: Executive Dashboard tab
3. Expected: 
   - See students from YOUR institution only
   - See balances and arrears
   - Cannot see students from other institutions

**Via API (Institution-Scoped):**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/institutions/1/finance/students/
# ✅ 200 OK - Returns students in institution 1 only

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/institutions/2/finance/students/
# ❌ 403 Forbidden - User not member of institution 2 OR
# ❌ 404 Not Found - If user only has access to institution 1
```

### Scenario 3: Multi-Institution Test

**If testing school chain**:
```python
# Institution 1: Kampala Campus
api_url_1 = "/api/v1/institutions/1/finance/students/"

# Institution 2: Jinja Campus
api_url_2 = "/api/v1/institutions/2/finance/students/"

# Admin can switch between institutions
# Student can only see own institution's data
```

### Scenario 4: Multi-Tenant Data Isolation

**Admin from Institution 1:**
```bash
curl -H "Authorization: Bearer $TOKEN_ADMIN_INST1" \
  http://localhost:8000/api/v1/institutions/1/finance/students/
# ✅ 200 OK - Sees all students in Institution 1

curl -H "Authorization: Bearer $TOKEN_ADMIN_INST1" \
  http://localhost:8000/api/v1/institutions/2/finance/students/
# ❌ 403 Forbidden - Not a member of Institution 2
```

**Student from Institution 1:**
```bash
# Student can view their OWN invoices (via special endpoint)
curl -H "Authorization: Bearer $TOKEN_STUDENT_INST1" \
  http://localhost:8000/api/v1/institutions/1/finance/my-invoices/
# ✅ 200 OK - Own invoices only

# Student CANNOT access full student list
curl -H "Authorization: Bearer $TOKEN_STUDENT_INST1" \
  http://localhost:8000/api/v1/institutions/1/finance/students/
# ❌ 403 Forbidden - Insufficient permissions
```

### Scenario 5: Create Invoice for Student

**Via Institution Dashboard:**
1. Finance Hub → Ledgers & Receipts tab
2. Click "New Invoice"
3. Select: Student from institutional list (auto-filtered)
4. Automatic: Student + Institution are set
5. Submit: Creates invoice scoped to institution

**Via API:**
```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  http://localhost:8000/api/v1/institutions/1/finance/invoices/ \
  -d '{
    "student": 1,
    "amount": "645000.00",
    "invoice_date": "2024-04-01",
    "due_date": "2024-04-15"
  }'
# ✅ 201 Created - Invoice created in Institution 1 context
# Institution field is auto-populated from URL
```

### Scenario 6: Record Payment (Institution-Scoped)

**Via Institution Dashboard:**
1. Finance Hub → Ledgers & Receipts tab
2. Click "Record Payment"
3. Select: Student (auto-filtered to institution)
4. Fill payment details
5. Submit

**Via API:**
```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/institutions/1/finance/payments/ \
  -d '{
    "student": 1,
    "amount": "200000.00",
    "payment_method": "bank_transfer"
  }'
# ✅ 201 Created - Payment assigned to Institution 1
```

### Scenario 7: View General Ledger (Admin Only)

**Access Control:**
```bash
# Admin CAN access GL
curl -H "Authorization: Bearer $TOKEN_ADMIN" \
  http://localhost:8000/api/v1/institutions/1/finance/general-ledger/
# ✅ 200 OK - GL data for institution

# Finance Officer CANNOT access GL
curl -H "Authorization: Bearer $TOKEN_FINANCE_OFFICER" \
  http://localhost:8000/api/v1/institutions/1/finance/general-ledger/
# ❌ 403 Forbidden - Admin role required for GL access

# Teacher CANNOT access GL
curl -H "Authorization: Bearer $TOKEN_TEACHER" \
  http://localhost:8000/api/v1/institutions/1/finance/general-ledger/
# ❌ 403 Forbidden - Admin role required
```

---

## 🔧 API TESTING WITH CURL (Institution-Scoped)

### Login & Get Token

```bash
# Get JWT token
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password123"
  }'

# Save the token from response
TOKEN="your_token_here"

# Replace {institution_id} with actual institution ID (usually 1 for testing)
INSTITUTION=1
```

### List All Students in Institution

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/institutions/$INSTITUTION/finance/students/
```

### Get Student Balance

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/institutions/$INSTITUTION/finance/students/1/balance/
```

### List Invoices in Institution

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/institutions/$INSTITUTION/finance/invoices/
```

### List Invoices for Specific Student

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/institutions/$INSTITUTION/finance/students/1/invoices/
```

### List Overdue Invoices in Institution

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/institutions/$INSTITUTION/finance/invoices/overdue/
```

### Record a Payment in Institution

```bash
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  http://localhost:8000/api/v1/institutions/$INSTITUTION/finance/payments/ \
  -d '{
    "student": 1,
    "amount": "150000.00",
    "payment_method": "bank_transfer",
    "payment_date": "2024-04-06"
  }'
```

### Confirm a Payment

```bash
curl -X POST -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/institutions/$INSTITUTION/finance/payments/1/confirm/
```

### View Chart of Accounts (Admin Only)

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/institutions/$INSTITUTION/finance/accounts/
```

### Get Account Balance

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/institutions/$INSTITUTION/finance/accounts/1/balance/
```

### View Institution's General Ledger (Admin Only)

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/institutions/$INSTITUTION/finance/general-ledger/
```

---

### Permission Examples

**Admin User** - Full Access
```bash
TOKEN=$(curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}' | grep -o '"access":"[^"]*' | cut -d'"' -f4)

# Can access all endpoints
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/institutions/1/finance/invoices/
# ✅ 200 OK
```

**Finance Officer** - Limited Access
```bash
TOKEN=$(curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"finance_officer","password":"password123"}' | grep -o '"access":"[^"]*' | cut -d'"' -f4)

# Can view invoices
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/institutions/1/finance/invoices/
# ✅ 200 OK

# CANNOT access GL (admin only)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/institutions/1/finance/general-ledger/
# ❌ 403 Forbidden
```

**Student User** - View Only Own Data
```bash
TOKEN=$(curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"student01","password":"password123"}' | grep -o '"access":"[^"]*' | cut -d'"' -f4)

# Can view own invoices
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/institutions/1/finance/my-invoices/
# ✅ 200 OK - Own invoices only

# CANNOT list all students
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/institutions/1/finance/students/
# ❌ 403 Forbidden
```

---

## 🧹 CLEARING TEST DATA

To clear all test data and start fresh:

```bash
python manage.py populate_finance_test_data --clear

# This will:
# - Delete all test users (admin, teacher01, student01, student02)
# - Delete related financial data
# - Re-create fresh test data
```

Or manually delete specific users:

```bash
python manage.py shell

from django.contrib.auth.models import User
User.objects.filter(username__in=['admin', 'teacher01', 'student01', 'student02']).delete()
exit()
```

---

## 📝 TESTING CHECKLIST

### ✅ Setup & Access
- [ ] Migrations ran successfully
- [ ] Superuser created
- [ ] Test data populated
- [ ] Admin panel accessible (http://localhost:8000/admin)
- [ ] API accessible (http://localhost:8000/api/v1/finance/)

### ✅ Student Management
- [ ] View student financial profile
- [ ] See student balance (positive/negative)
- [ ] View financial status history
- [ ] See all invoices for student
- [ ] See all payments for student

### ✅ Invoicing
- [ ] View all invoices
- [ ] Filter invoices by status
- [ ] See overdue invoices
- [ ] Create new invoice
- [ ] Mark invoice as overdue
- [ ] Calculate correct balance

### ✅ Payments
- [ ] Record payment
- [ ] Confirm payment
- [ ] View allocation to invoices
- [ ] See multiple payments per student
- [ ] Track payment method (cash, bank, mobile money)

### ✅ Accounting
- [ ] View Chart of Accounts
- [ ] Get account balance
- [ ] See GL entries
- [ ] Verify GL posts automatically on invoices/payments
- [ ] GL debits equal credits (balanced)

### ✅ Audit & Compliance
- [ ] View audit logs
- [ ] See user who created invoice
- [ ] See timestamp of changes
- [ ] Check old/new values in audit trail

### ✅ API & Permissions
- [ ] Admin can see all data
- [ ] Teacher can see limited data
- [ ] Student can see own data only
- [ ] Proper HTTP status codes (200, 400, 403, 404)

---

## 🐛 TROUBLESHOOTING

### Issue: "No migrations found"
**Solution:**
```bash
python manage.py migrate auth
python manage.py makemigrations finance
python manage.py migrate finance
```

### Issue: "Table already exists"
**Solution:**
```bash
# Backup your database first!
# Then delete db.sqlite3 and rerun:
python manage.py migrate finance
```

### Issue: "populate_finance_test_data command not found"
**Solution:**
```bash
# Make sure __init__.py files exist:
ls edify_backend/apps/finance/management/__init__.py
ls edify_backend/apps/finance/management/commands/__init__.py

# If missing, create them:
touch edify_backend/apps/finance/management/__init__.py
touch edify_backend/apps/finance/management/commands/__init__.py
```

### Issue: Foreign key constraint errors
**Solution:**
```bash
# Make sure all dependent migrations ran:
python manage.py showmigrations

# Reapply migrations:
python manage.py migrate finance --plan
python manage.py migrate finance
```

---

## 📊 EXPECTED TEST DATA FLOW

```
Institution (School)
├── Students [2]
│   ├── student01 (Charlie Student)
│   └── student02 (Diana Scholar)
│
├── Financial Profiles [2]
│   ├── Profile 1: 445,000 UGX outstanding
│   └── Profile 2: 645,000 UGX outstanding
│
├── Invoices [4]
│   ├── INV-2024-1001: student01, Jan 2024, 645,000
│   ├── INV-2024-1002: student01, Feb 2024, 645,000
│   ├── INV-2024-1011: student02, Jan 2024, 645,000
│   └── INV-2024-1012: student02, Feb 2024, 645,000
│
├── Payments [1]
│   └── PAY-2024-001: student01, 200,000 (Bank Transfer)
│
└── Chart of Accounts [8]
    ├── Assets [3]
    ├── Income [3]
    └── Expenses [2]
```

---

## 🎓 LEARNING RESOURCES

### Understanding the System

1. **Models**: See all data structures in `edify_backend/apps/finance/models/`
2. **API**: All endpoints documented in `PHASE_1_PART_B_COMPLETE.md`
3. **Admin**: Browse at http://localhost:8000/admin
4. **Database**: Check `db.sqlite3` with SQLite viewer

### Key Files

- **Test Command**: `edify_backend/apps/finance/management/commands/populate_finance_test_data.py`
- **Models**: `edify_backend/apps/finance/models/`
- **Serializers**: `edify_backend/apps/finance/serializers.py`
- **Views**: `edify_backend/apps/finance/views.py`
- **URLs**: `edify_backend/apps/finance/urls.py`

---

## 💡 NEXT STEPS AFTER TESTING

1. **Create React Components** - Build frontend for student/teacher portals
2. **Implement Services** - Add business logic for calculations
3. **Add Reports** - Generate financial statements
4. **Setup Notifications** - Email payment reminders
5. **Add Budgeting** - Budget planning and control

---

## 🎉 YOU'RE READY TO TEST!

Run these commands in order:

```bash
cd /Users/omario/Desktop/Notebook\ LM/edify\ online\ school

# 1. Apply migrations
python manage.py makemigrations finance
python manage.py migrate finance

# 2. Create admin user
python manage.py createsuperuser

# 3. Populate test data
python manage.py populate_finance_test_data

# 4. Start server
python manage.py runserver

# In another terminal:
# 5. Start frontend (if needed)
cd ../frontend
npm install
npm run dev
```

Then visit:
- **Admin**: http://localhost:8000/admin
- **API**: http://localhost:8000/api/v1/finance/
- **Frontend**: http://localhost:5173

Happy testing! 🚀
