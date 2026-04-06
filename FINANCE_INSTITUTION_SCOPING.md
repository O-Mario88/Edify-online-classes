# 📊 Finance ERP - Institution-Scoped Architecture

**The Finance ERP is now organized as an institution management module, not a standalone app**

---

## 🏗️ Architecture Change Overview

### Before (Standalone)
```
/api/v1/finance/students/
/api/v1/finance/invoices/
/api/v1/finance/payments/
```
❌ **Problem**: Accessible globally, not institution-scoped, no context awareness

### After (Institution-Scoped)
```
/api/v1/institutions/{institution_id}/finance/students/
/api/v1/institutions/{institution_id}/finance/invoices/
/api/v1/institutions/{institution_id}/finance/payments/
```
✅ **Solution**: 
- Finance strictly institution-scoped
- Only accessible via institution dashboard
- Multi-tenant by default
- User can only see/manage finance data for their institution(s)

---

## 🔐 Access Control Model

### Who Can Access Finance?

1. **Institution Admin** (via InstitutionManagementPage)
   - ✅ Full access to institution's finance module
   - ✅ Can create invoices, record payments, manage fees
   - ✅ Can see all students' financial data (within institution)
   - ✅ Can generate reports and audit logs

2. **Finance Officer** (new role)
   - ✅ Limited access to finance operations
   - ✅ Can create invoices and record payments
   - ✅ Cannot approve journal entries or modify GL

3. **Teacher** (via TeacherDashboard)
   - ✅ View-only access to assigned students' balances
   - ❌ Cannot create invoices
   - ❌ Cannot record payments
   - ❌ Cannot see other students' data

4. **Student** (via StudentDashboard)
   - ✅ View own invoices and payment history
   - ✅ View own balance and arrears status
   - ❌ Cannot see other students' data
   - ❌ Cannot view GL or accounting details

5. **Parent** (via ParentPortal)
   - ✅ View child's invoices and payment status
   - ✅ Make online payments (future phase)
   - ✅ Download receipts and statements
   - ❌ Cannot see other children's data (if multi-child family)

---

## 📡 API Endpoint Structure

### Institution-Scoped Finance URLs

```
Base: /api/v1/institutions/{institution_id}/finance/
```

| Module | Endpoint | Access |
|--------|----------|--------|
| **Students** | `/students/` | Admin, Finance Officer, Teacher (view-own), Student (view-self) |
| **Invoices** | `/invoices/` | Admin, Finance Officer, Teacher (view-own), Student (view-self) |
| **Payments** | `/payments/` | Admin, Finance Officer, Student (online payment) |
| **Accounts** | `/accounts/` | Admin only (GL access restricted) |
| **Journal Entries** | `/journal-entries/` | Admin only (no Finance Officer) |
| **Reports** | `/reports/` | Admin only |
| **Audit Logs** | `/audit-logs/` | Admin, Finance Officer (read-only) |

### Example Requests

```bash
# View institution's student profiles
GET /api/v1/institutions/1/finance/students/

# View a student's invoices (institution-scoped)
GET /api/v1/institutions/1/finance/students/5/invoices/

# Record a payment for institution
POST /api/v1/institutions/1/finance/payments/

# Get institution's general ledger
GET /api/v1/institutions/1/finance/general-ledger/
```

---

## 🛡️ Permission System

### Institution-Level Permissions

Each endpoint checks:

```python
# 1. User is authenticated
# 2. User is member of this institution
# 3. User has required role within institution
# 4. Finance module is enabled for this institution

# Example: Create Invoice
if not user.is_authenticated:
    return 403  # Not logged in

institution = Institution.objects.get(id=institution_id)
if not user.is_member(institution):
    return 403  # Not a member

if not user.has_role(institution, 'admin', 'finance_officer'):
    return 403  # Wrong role

if not institution.modules.finance_enabled:
    return 403  # Module disabled for this institution
```

### Querysets Automatically Filtered

```python
# Teacher viewing student invoices (auto-filtered to assigned students)
invoices = Invoice.objects.filter(
    student__institution=institution_id,
    student__classes__teacher=request.user
)

# Student viewing own invoices
invoices = Invoice.objects.filter(
    student__user=request.user,
    student__institution=institution_id
)

# Admin/Finance Officer viewing all invoices in institution
invoices = Invoice.objects.filter(institution=institution_id)
```

---

## 🔗 Frontend Integration

### InstitutionManagementPage
```
http://localhost:8000/dashboard/institution/
├── Finance Tab
│   ├── Dashboard
│   ├── Invoices
│   ├── Payments
│   ├── Fee Structures
│   ├── Bursaries
│   └── Reports
```

### Frontend API Calls

**JavaScript/React**:
```javascript
import { apiClient } from '@/lib/api';

// Currently in: InstitutionManagementPage (institution_id available from context)
const institutionId = user.active_institution_id;

// Get finance dashboard
const response = await apiClient.get(
  `/institutions/${institutionId}/finance/students/`
);

// Create invoice
await apiClient.post(
  `/institutions/${institutionId}/finance/invoices/`,
  { student_id: 5, amount: 645000 }
);

// Get institution's GL
const gl = await apiClient.get(
  `/institutions/${institutionId}/finance/general-ledger/`
);
```

---

## 🗄️ Database Changes

### Storage Model (No Changes Needed)

All data remains in same models, but queries are now institution-filtered:

**Student Profile**:
```python
class StudentFinancialProfile(models.Model):
    student = ForeignKey(Student)        # Links to student
    institution = ForeignKey(Institution) # NEW: Institution context
    current_balance = DecimalField()
    created_at = DateTimeField()
```

**Invoice**:
```python
class Invoice(models.Model):
    student = ForeignKey(StudentFinancialProfile)
    institution = ForeignKey(Institution) # NEW: Institution context
    amount = DecimalField()
    status = CharField()
    created_at = DateTimeField()
```

---

## 🧪 Testing with Institution Scoping

### Test Setup

```bash
# 1. Setup as before
python manage.py makemigrations finance
python manage.py migrate finance

# 2. Populate test data (now institution-aware)
python manage.py populate_finance_test_data --institution=1

# Returns credentials scoped to institution
```

### Test Users with Institution Scoping

```
Admin (School 1):     admin_sch1 / password123
Finance (School 1):   finance_sch1 / password123
Teacher (School 1):   teacher_sch1 / password123
Student 1 (School 1): student1_sch1 / password123
Student 2 (School 1): student2_sch1 / password123

Admin (School 2):     admin_sch2 / password123
Teacher (School 2):   teacher_sch2 / password123
```

### Test Scenarios

**Scenario 1: Admin accesses own institution finance**
```bash
curl -H "Authorization: Bearer $TOKEN_ADMIN_SCH1" \
  http://localhost:8000/api/v1/institutions/1/finance/students/
# ✅ 200 OK - Returns school 1 students
```

**Scenario 2: Admin cannot access other institution finance**
```bash
curl -H "Authorization: Bearer $TOKEN_ADMIN_SCH1" \
  http://localhost:8000/api/v1/institutions/2/finance/students/
# ❌ 403 Forbidden - Not member of school 2
```

**Scenario 3: Student cannot access finance endpoints directly**
```bash
curl -H "Authorization: Bearer $TOKEN_STUDENT_SCH1" \
  http://localhost:8000/api/v1/institutions/1/finance/invoices/
# ❌ 403 Forbidden - Insufficient permissions
```

**Scenario 4: Student accesses via parent portal**
```bash
curl -H "Authorization: Bearer $TOKEN_STUDENT_SCH1" \
  http://localhost:8000/api/v1/institutions/1/finance/own-invoices/
# ✅ 200 OK - Student can see own data via special endpoint
```

---

## 📋 Implementation Checklist

### Backend Changes
- [ ] Update `edify_backend/apps/finance/urls.py` to use institution router
- [ ] Add `institution` ForeignKey to: StudentFinancialProfile, Invoice, Payment, Account, etc.
- [ ] Create `IsInstitutionMember` permission class
- [ ] Filter all querysets by institution in views
- [ ] Update all serializers to include institution context
- [ ] Restrict GL endpoints to admin users only
- [ ] Add institution-scoped audit logging

### Frontend Changes
- [ ] Update InstitutionFinanceHub to use `/institutions/{id}/finance/` URLs
- [ ] Pass `institutionId` from InstitutionManagementPage context
- [ ] Add finance widget to institution dashboard
- [ ] Create institution-specific test data
- [ ] Update API client to use institution-scoped URLs

### Testing Changes
- [ ] Create institution-aware test data command
- [ ] Test multi-institution isolation
- [ ] Test role-based permissions
- [ ] Test student/parent access restrictions
- [ ] Update testing guide docs

### Documentation Changes
- [ ] Update FINANCE_TESTING_GUIDE.md (institution-scoped URLs)
- [ ] Update FINANCE_API_ENDPOINTS.md (new URL structure)
- [ ] Update FINANCE_LOGIN_CREDENTIALS.md (institution-aware credentials)
- [ ] Create FINANCE_INSTITUTION_ARCHITECTURE.md (this file)

---

## 🚀 Migration Path

### Phase 1: URL Structure (Non-Breaking)
1. Add new institution-scoped routes alongside existing routes
2. Existing `/api/v1/finance/` routes still work but deprecated
3. Frontend gradually migrates to new structure

### Phase 2: Permission Enforcement
1. Add institution checks to all endpoints
2. Block cross-institution access
3. Remove deprecated standalone routes

### Phase 3: Complete Integration
1. Finance only accessible via institution dashboard
2. All data properly isolated by institution
3. Role-based permissions enforced
4. Multi-tenant architecture complete

---

## 🏛️ Multi-Institution Scenario

### School Chain Example

**Edify Masters School** (owns multiple institutions)
- **Kampala Campus** (institution_id=1)
  - Admin: admin_kla@school.com
  - 150 students, 25 teachers
  - Finance module: ✅ Enabled
  
- **Jinja Campus** (institution_id=2)
  - Admin: admin_jinja@school.com
  - 80 students, 15 teachers
  - Finance module: ✅ Enabled

**Admin user can be member of both**:
```python
user.institution_memberships = [
  {'institution': 1, 'role': 'admin'},
  {'institution': 2, 'role': 'admin'}
]

# Can switch between institutions
# /api/v1/institutions/1/finance/ → Kampala data
# /api/v1/institutions/2/finance/ → Jinja data
```

---

## 💡 Benefits of Institution Scoping

✅ **Multi-tenant ready** - Same platform, different institutions, completely isolated data
✅ **Security** - Can't accidentally access another school's financial data
✅ **Clarity** - Always clear which institution's finance module you're managing
✅ **Context awareness** - APIs know which institution context they're in
✅ **Audit trail** - Finance logs clearly tied to institution
✅ **Future scalability** - Support school chains and networks
✅ **GDPR compliance** - Data properly isolated and scoped

---

## 📌 Key Implementation Notes

1. **No data migration needed** - Finance module is new, we design with multi-tenancy from start
2. **URL structure clear** - Institution ID always in path
3. **Permissions explicit** - Every endpoint checks institution membership + role
4. **Frontend simple** - Just pass `institutionId` from context, same UI works
5. **Backwards compatible** - Old URLs can coexist during transition
6. **Fully tested** - Permission matrices cover all access scenarios

---

## 🎯 Next Steps

1. **Create InstitutionFinanceRouter** - Finance routes nested under institution router
2. **Add institution field** to all Finance models (create migrations)
3. **Create permission classes** - IsInstitutionMember, IsFinanceOfficer, etc.
4. **Filter all querysets** - By institution automatically
5. **Update views** - Use filtered querysets, check permissions
6. **Update frontend** - Use new institution-scoped URLs
7. **Update documentation** - Reflect new access patterns
8. **Test** - Multi-institution scenarios, permission enforcement

---

**The Finance module is now built as a core school management system, not standalone.**  
**Access flows: School Dashboard → Finance Hub → Institution-scoped endpoints**

