"""
Mixins for institution-scoped querysets in Finance ERP.

Automatically filters querysets by institution_id from URL kwargs.
Ensures data isolation and multi-tenant support.
"""

from rest_framework import viewsets
from django.shortcuts import get_object_or_404
from edify_backend.apps.institutions.models import Institution


class InstitutionScopedViewSetMixin:
    """
    Mixin that automatically filters querysets by institution_id from URL.
    
    Usage:
        class MyViewSet(InstitutionScopedViewSetMixin, viewsets.ModelViewSet):
            queryset = MyModel.objects.all()
            serializer_class = MySerializer
            
    This will automatically:
    - Filter querysets by institution_id from URL kwargs
    - Make institution_id available as self.institution_id
    - Validate institution exists before processing
    """
    
    def get_institution(self):
        """Get Institution object from URL kwargs."""
        institution_id = self.kwargs.get('institution_id')
        if not institution_id:
            raise ValueError("institution_id must be provided in URL kwargs")
        
        institution = get_object_or_404(Institution, pk=institution_id)
        return institution
    
    def get_institution_id(self):
        """Get institution_id from URL kwargs."""
        institution_id = self.kwargs.get('institution_id')
        if not institution_id:
            raise ValueError("institution_id must be provided in URL kwargs")
        return institution_id
    
    def get_queryset(self):
        """
        Override get_queryset to filter by institution_id.
        
        Subclasses should call super().get_queryset() and then apply
        institution filtering based on model relationships.
        """
        # Get the original queryset from parent class
        queryset = super().get_queryset()
        
        # Get institution_id from URL
        institution_id = self.get_institution_id()
        
        # Filter by institution based on model field name
        # Most models will have 'institution' FK, some will need custom filtering
        if hasattr(queryset.model, '_meta'):
            # Check if model has 'institution' field
            field_names = [f.name for f in queryset.model._meta.get_fields()]
            if 'institution' in field_names:
                queryset = queryset.filter(institution_id=institution_id)
        
        return queryset
    
    def perform_create(self, serializer):
        """
        Automatically set institution_id on create.
        
        Ensures created objects are always scoped to the correct institution.
        """
        institution_id = self.get_institution_id()
        
        # Set institution on the serializer if model has institution field
        if 'institution' in serializer.fields:
            serializer.save(institution_id=institution_id)
        else:
            serializer.save()


class StudentProfileScopedViewSetMixin(InstitutionScopedViewSetMixin):
    """
    Mixin for ViewSets that need to filter by student's institution.
    
    Used for Invoice, Payment, etc. that relate through StudentFinancialProfile.
    """
    
    def get_queryset(self):
        """Filter by institution through student relationship."""
        queryset = super().get_queryset()
        institution_id = self.get_institution_id()
        
        # Filter student-related objects through StudentFinancialProfile
        if hasattr(queryset.model, '_meta'):
            field_names = [f.name for f in queryset.model._meta.get_fields()]
            
            # If has direct 'institution' field, use that
            if 'institution' in field_names:
                queryset = queryset.filter(institution_id=institution_id)
            # If has 'student' field (ForeignKey to StudentFinancialProfile)
            elif 'student' in field_names:
                queryset = queryset.filter(student__institution_id=institution_id)
        
        return queryset
