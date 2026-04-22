# 🔐 FINANCE ERP - TEST LOGIN CREDENTIALS

**Quick reference for all test accounts created by populate_finance_test_data command**

---

## 📋 Test Users Summary

| Role | Username | Password | Email | Access Level |
|------|----------|----------|-------|--------------|
| **Admin** | `admin` | `password123` | admin@school.test | Full system access |
| **Teacher** | `teacher01` | `password123` | teacher@school.test | Staff/Limited access |
| **Student #1** | `student01` | `password123` | student1@school.test | Own data only |
| **Student #2** | `student02` | `password123` | student2@school.test | Own data only |

---

## 🔓 LOGIN LOCATIONS

### Django Admin Panel
```
URL: http://localhost:8000/admin
Username: admin
Password: password123
```

### API Token (for REST endpoints)
```bash
POST http://localhost:8000/api/token/
{
  "username": "admin",
  "password": "password123"
}
```

### Frontend (Future)
```
URL: http://localhost:5173 (or next.js)
Username: student01 (or any user)
Password: password123
```

---

## 👤 ADMIN ACCOUNT

**Purpose**: Full system access, create/edit all records

```
Username:        admin
Password:        password123
Email:           admin@school.test
First Name:      Admin
Last Name:       User
Is Superuser:    Yes
Is Staff:        Yes
```

**Can Do:**
- ✅ Create invoices for any student
- ✅ Record payments
- ✅ Create fee categories
- ✅ Manage Chart of Accounts
- ✅ Create journal entries
- ✅ Approve workflows
- ✅ View all audit logs
- ✅ Create new users
- ✅ Export reports

---

## 👨‍🏫 TEACHER ACCOUNT

**Purpose**: View student payments, limited classroom data

```
Username:        teacher01
Password:        password123
Email:           teacher@school.test
First Name:      Teacher
Last Name:       One
Is Superuser:    No
Is Staff:        Yes
```

**Can Do:**
- ✅ View assigned students
- ✅ See student payment status
- ✅ Print payment statements
- ✅ View class-level analytics
- ❌ Cannot create invoices
- ❌ Cannot record payments
- ❌ Cannot modify fees

---

## 👨‍🎓 STUDENT #1 - Charlie

**Purpose**: Test student with partial payment made

```
Username:        student01
Password:        password123
Email:           student1@school.test
First Name:      Charlie
Last Name:       Student
User Type:       Student
Guardian Email:  parent1@email.test
```

**Financial Profile:**
```
Total Invoiced:     645,000 UGX
Amount Paid:        200,000 UGX
Outstanding:        445,000 UGX
Status:             In Arrears
Days Overdue:       30+
Payment Method:     Bank Transfer
```

**Invoices:**
```
Invoice 1: January 2024,  645,000 UGX - PARTIALLY PAID (200,000 paid)
Invoice 2: February 2024, 645,000 UGX - OUTSTANDING
```

**Can Do:**
- ✅ View own invoices
- ✅ View own payment history
- ✅ See balance statement
- ✅ Download receipts
- ❌ View other students' data
- ❌ Create invoices
- ❌ Record payments (in parent portal)

---

## 👩‍🎓 STUDENT #2 - Diana

**Purpose**: Test student with no payment (completely outstanding)

```
Username:        student02
Password:        password123
Email:           student2@school.test
First Name:      Diana
Last Name:       Scholar
User Type:       Student
Guardian Email:  parent2@email.test
```

**Financial Profile:**
```
Total Invoiced:     645,000 UGX
Amount Paid:        0 UGX
Outstanding:        645,000 UGX
Status:             In Arrears
Days Overdue:       60+
Payment Method:     None yet
```

**Invoices:**
```
Invoice 1: January 2024,  645,000 UGX - OUTSTANDING
Invoice 2: February 2024, 645,000 UGX - OUTSTANDING
```

**Can Do:**
- ✅ View own invoices
- ✅ See that no payments have been made
- ✅ Download payment instructions
- ❌ View other students' data
- ❌ View teacher or admin data

---

## 🧪 TEST DATA STRUCTURE

### Fee Categories (Used in Bills)
```
Category                Amount      Type
──────────────────────────────────────
Tuition Fee          500,000 UGX   Mandatory
Exam Fee              50,000 UGX   Optional per term
Lab Fee               30,000 UGX   Optional per term
Boarding Fee         (varies)      For boarders only
Uniform               25,000 UGX   One-time
Books & Supplies      40,000 UGX   One-time
──────────────────────────────────────
TOTAL TERM BILL      645,000 UGX
```

### Financial Accounts (Chart of Accounts)
```
1010 - Cash                              (Asset)
1020 - Bank Account                      (Asset)
1200 - Student Accounts Receivable (AR)  (Asset)
4100 - Tuition Fee Income               (Income)
4200 - Exam Fee Income                  (Income)
4300 - Other Income                     (Income)
5100 - Teacher Salaries                 (Expense)
5200 - Utilities                        (Expense)
```

### Payment Methods Available
```
✓ Cash
✓ Bank Transfer
✓ Mobile Money (MTN, Airtel, Africell)
✓ Card Payment
✓ Cheque
✓ Other
```

---

## 🎬 HOW TO USE THESE CREDENTIALS

### 1. Login to Admin Dashboard

```bash
# Start the server if not running
cd /Users/omario/Desktop/Notebook\ LM/edify\ online\ school
python manage.py runserver
```

Then navigate to: **http://localhost:8000/admin**

Login as:
- **Username**: `admin`
- **Password**: `password123`

### 2. Test as Different Users

**View as Admin:**
```bash
# See all students and data
http://localhost:8000/admin
Login: admin / password123
```

**View as Teacher:**
```bash
# Would see only assigned students (if role-based views added)
Login: teacher01 / password123
```

**View as Student:**
```bash
# Would see only own invoices and payments
Login: student01 / password123
```

### 3. API Testing

```bash
# Get token
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'

# Use token for API calls
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/finance/students/
```

---

## 📊 EXPECTED LOGIN RESPONSES

### Admin Login Success
```
{
  "id": 1,
  "username": "admin",
  "email": "admin@school.test",
  "first_name": "Admin",
  "last_name": "User",
  "is_staff": true,
  "is_superuser": true
}
```

### Student Login Success
```
{
  "id": 2,
  "username": "student01",
  "email": "student1@school.test",
  "first_name": "Charlie",
  "last_name": "Student",
  "student_id": 1,
  "financial_profile": {
    "current_balance": -445000,
    "financial_status": "in_arrears"
  }
}
```

---

## ⚠️ IMPORTANT NOTES

1. **These are TEST credentials only** - Do not use in production
2. **Password is "password123"** - Same for all test users
3. **Email addresses are fake** - They don't actually receive emails
4. **Data will be cleared** - Run `populate_finance_test_data --clear` to reset
5. **Superuser access** - Admin can see & do everything in the system

---

## 🔄 RESETTING TEST CREDENTIALS

To clear all test data and start fresh:

```bash
python manage.py populate_finance_test_data --clear
```

This will:
- ✅ Delete test users (admin, teacher01, student01, student02)
- ✅ Delete all related financial data
- ✅ Re-create fresh test data with new credentials

---

## 🚀 QUICK START

```bash
# 1. Apply migrations
python manage.py migrate finance

# 2. Create superuser (optional, if not using populate command)
python manage.py createsuperuser

# 3. Populate test data
python manage.py populate_finance_test_data

# 4. Start server
python manage.py runserver

# 5. Login
# Admin:   http://localhost:8000/admin → admin / password123
# API:     POST /api/token/ → admin / password123
```

---

**Happy Testing!** 🎉

Use these credentials to explore the Finance ERP system and test all functionality. For detailed testing guide, see `FINANCE_TESTING_GUIDE.md`.
