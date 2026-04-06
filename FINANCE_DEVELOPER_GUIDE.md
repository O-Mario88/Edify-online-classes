# 🛠️ Finance ERP - Institution-Scoping Developer Guide

**Quick reference for implementing institution-scoped finance views**

---

## 📋 Checklist per ViewSet

For each ViewSet in `finance/views.py`, follow this checklist:

### ✅ Basic Setup
- [ ] Add `InstitutionScopedViewSetMixin` as parent class
- [ ] Import permission classes from `finance/permissions.py`
- [ ] Set `permission_classes` attribute

### ✅ Code Example

```python
# BEFORE (standalone):
from rest_framework import viewsets
from .serializers import InvoiceSerializer
from .models import Invoice

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]


# AFTER (institution-scoped):
from rest_framework import viewsets
from .serializers import InvoiceSerializer
from .models import Invoice
from .mixins import InstitutionScopedViewSetMixin
from .permissions import IsInstitutionMember

class InvoiceViewSet(
    InstitutionScopedViewSetMixin,  # ← ADD THIS
    viewsets.ModelViewSet
):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsInstitutionMember]  # ← UPDATE THIS
```

---

## 🎯 Permission Classes by ViewSet

Use this matrix to assign correct permission class:

| ViewSet | Permission Class | Reason |
|---------|-----------------|--------|
| StudentFinancialProfileViewSet | `IsInstitutionMember` | Everyone needs to see students |
| InvoiceViewSet | `IsInstitutionMember` | Admin/Finance create, everyone views |
| PaymentViewSet | `IsInstitutionMember` | Multiple roles need access |
| ReceiptViewSet | `IsInstitutionMember` | Students need own receipts |
| AccountViewSet | `IsInstitutionAdmin` | GL access - admin only |
| GeneralLedgerViewSet | `IsInstitutionAdmin` | GL access - admin only |
| JournalEntryViewSet | `IsInstitutionAdmin` | Journal access - admin only |
| FeeCategoryViewSet | `IsInstitutionMember` | Finance officers manage |
| FeeTemplateViewSet | `IsInstitutionMember` | Finance officers manage |

---

## 🔧 Implementation Steps

### Step 1: Add Mixin and Permission

```python
from .mixins import InstitutionScopedViewSetMixin
from .permissions import IsInstitutionMember, IsInstitutionAdmin

# Add mixin as parent
class MyViewSet(InstitutionScopedViewSetMixin, viewsets.ModelViewSet):
    queryset = MyModel.objects.all()
    serializer_class = MySerializer
    
    # Update permission class
    permission_classes = [IsInstitutionMember]  # OR IsInstitutionAdmin
```

### Step 2: Verify Queryset Filtering

The mixin auto-filters by `institution_id` from URL:

```python
# API call:
GET /api/v1/institutions/1/finance/invoices/

# Automatically becomes:
queryset = Invoice.objects.filter(institution_id=1)

# No extra code needed! ✅
```

### Step 3: Test It

```bash
# Should work (user is member of institution 1):
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/institutions/1/finance/invoices/
# ✅ 200 OK

# Should fail (user not member of institution 2):
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/institutions/2/finance/invoices/
# ❌ 403 Forbidden
```

---

## 🚨 Common Mistakes to Avoid

### ❌ Mistake 1: Forgetting the Mixin

```python
# WRONG - Not institution-scoped
class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()  # Returns ALL institutions!
    serializer_class = InvoiceSerializer

# RIGHT - Institution-scoped
class InvoiceViewSet(InstitutionScopedViewSetMixin, viewsets.ModelViewSet):
    queryset = Invoice.objects.all()  # Auto-filtered to current institution
    serializer_class = InvoiceSerializer
```

### ❌ Mistake 2: Wrong Permission Class

```python
# WRONG - GL exposed to finance officers
class GeneralLedgerViewSet(InstitutionScopedViewSetMixin, viewsets.ViewSet):
    permission_classes = [IsInstitutionMember]  # Too permissive!

# RIGHT - GL restricted to admins only
class GeneralLedgerViewSet(InstitutionScopedViewSetMixin, viewsets.ViewSet):
    permission_classes = [IsInstitutionAdmin]  # Admin-only
```

### ❌ Mistake 3: Hardcoding Institution ID

```python
# WRONG - Hardcoded institution
def get_queryset(self):
    return Invoice.objects.filter(institution_id=1)  # Always inst 1!

# RIGHT - Use mixin or get from kwargs
def get_queryset(self):
    queryset = super().get_queryset()
    institution_id = self.get_institution_id()
    return queryset.filter(institution_id=institution_id)
```

### ❌ Mistake 4: Forgetting to Update permission_classes

```python
# WRONG - Uses old permission class
class InvoiceViewSet(InstitutionScopedViewSetMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]  # Too broad

# RIGHT - Uses institution-specific
class InvoiceViewSet(InstitutionScopedViewSetMixin, viewsets.ModelViewSet):
    permission_classes = [IsInstitutionMember]  # Correct
```

---

## 📊 Data Flow Example

### Creating an Invoice

```
1. Frontend calls:
   POST /api/v1/institutions/1/finance/invoices/
   
2. Django extracts institution_id=1 from URL
   
3. ViewSet.perform_create() is called:
   - Mixin auto-sets institution_id=1 on save
   - Invoice.institution = Institution(id=1)
   
4. Permission check:
   - IsInstitutionMember verifies user is member of inst 1
   - If not, returns 403 Forbidden
   
5. Permissions.perform_create called:
   serializer.save(institution_id=1)  # ← Mixin does this
   
6. Invoice saved with institution_id=1
```

---

## 🧪 Testing a ViewSet

```python
# test_finance_views.py

def test_invoice_creation_institution_scoped():
    # Setup: Create institution and user
    institution = Institution.objects.create(name="School 1")
    user = User.objects.create(username="admin")
    InstitutionMembership.objects.create(
        user=user,
        institution=institution,
        role='admin'
    )
    
    # Create invoice in institution 1
    client = APIClient()
    client.force_authenticate(user=user)
    
    response = client.post(
        f'/api/v1/institutions/{institution.id}/finance/invoices/',
        {'student': 1, 'amount': 645000}
    )
    
    # Verify
    assert response.status_code == 201
    invoice = Invoice.objects.first()
    assert invoice.institution_id == institution.id
    
    
def test_invoice_access_denied_other_institution():
    # Admin from institution 2 cannot access institution 1
    inst1 = Institution.objects.create(name="School 1")
    inst2 = Institution.objects.create(name="School 2")
    user = User.objects.create(username="admin2")
    InstitutionMembership.objects.create(
        user=user,
        institution=inst2,
        role='admin'
    )
    
    client = APIClient()
    client.force_authenticate(user=user)
    
    response = client.get(
        f'/api/v1/institutions/{inst1.id}/finance/invoices/'
    )
    
    # Verify access denied
    assert response.status_code == 403
```

---

## 🔄 Dependency Order

When implementing, do in this order:

1. ✅ **URLs** - Already updated (edify_core/urls.py)
2. ✅ **Permissions** - Already created (finance/permissions.py)
3. ✅ **Mixins** - Already created (finance/mixins.py)
4. ⏳ **Models** - Add institution FK to models
5. ⏳ **Migrations** - Run makemigrations and migrate
6. ⏳ **Views** - Add mixin + update permission_classes
7. ⏳ **Serializers** - Add institution field (read-only)
8. ⏳ **Frontend** - Update API calls with institution ID

---

## 🎯 Institution FK Locations

Add to these models:

```python
# edify_backend/apps/finance/models/

# student_profile.py
class StudentFinancialProfile(models.Model):
    student = ForeignKey(Student)
    institution = ForeignKey(Institution)  # ← ADD
    current_balance = DecimalField()

# invoicing.py
class Invoice(models.Model):
    student = ForeignKey(StudentFinancialProfile)
    institution = ForeignKey(Institution)  # ← ADD
    amount = DecimalField()

class CreditNote(models.Model):
    invoice = ForeignKey(Invoice)
    institution = ForeignKey(Institution)  # ← ADD

# payments.py
class Payment(models.Model):
    student = ForeignKey(StudentFinancialProfile)
    institution = ForeignKey(Institution)  # ← ADD
    amount = DecimalField()

class Receipt(models.Model):
    payment = ForeignKey(Payment)
    institution = ForeignKey(Institution)  # ← ADD

# accounting.py
class Account(models.Model):
    account_code = CharField()
    institution = ForeignKey(Institution)  # ← ADD

class JournalEntry(models.Model):
    entry_date = DateField()
    institution = ForeignKey(Institution)  # ← ADD

class FinancialPeriod(models.Model):
    start_date = DateField()
    institution = ForeignKey(Institution)  # ← ADD

# fees.py
class FeeCategory(models.Model):
    name = CharField()
    institution = ForeignKey(Institution)  # ← ADD

class FeeTemplate(models.Model):
    name = CharField()
    institution = ForeignKey(Institution)  # ← ADD

# support.py
class CostCenter(models.Model):
    name = CharField()
    institution = ForeignKey(Institution)  # ← ADD

class DiscountRule(models.Model):
    name = CharField()
    institution = ForeignKey(Institution)  # ← ADD
```

---

## 📝 Migration Template

```python
# Generated by: python manage.py makemigrations finance

from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):
    dependencies = [
        ('institutions', 'XXXX_previous_migration'),
        ('finance', 'XXXX_previous_migration'),
    ]

    operations = [
        # Add institution FK to each model
        migrations.AddField(
            model_name='studentfinancialprofile',
            name='institution',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                to='institutions.institution',
                null=True,  # Allow null initially for existing records
            ),
        ),
        # Repeat for each model that needs institution field...
    ]
```

---

## ✅ Verification Checklist

After implementing institution-scoping, verify:

- [ ] All ViewSets use `InstitutionScopedViewSetMixin`
- [ ] All ViewSets have correct `permission_classes`
- [ ] Models have `institution` ForeignKey
- [ ] Migrations created and applied
- [ ] URLs use pattern: `/api/v1/institutions/{id}/finance/...`
- [ ] Admin can access own institution
- [ ] Admin gets 403 accessing other institution
- [ ] Student can only view own data
- [ ] GL endpoints restricted to admin only
- [ ] Tests cover cross-institution access denial

---

## 📞 Reference Implementation

See existing institution-scoped code:
- **Institutions app**: `edify_backend/apps/institutions/`
- **Classes app**: `edify_backend/apps/classes/` (likely uses institution)
- **Lessons app**: `edify_backend/apps/lessons/` (likely uses institution)

Look at how these apps implement institution-scoping for reference.

---

**Status**: Ready to implement views and models! 🚀
