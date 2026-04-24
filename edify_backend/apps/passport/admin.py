from django.contrib import admin
from .models import LearningPassport, PassportEntry, Credential, IssuedCredential


@admin.register(LearningPassport)
class LearningPassportAdmin(admin.ModelAdmin):
    list_display = ('student', 'visibility', 'updated_at')
    list_filter = ('visibility',)


@admin.register(PassportEntry)
class PassportEntryAdmin(admin.ModelAdmin):
    list_display = ('passport', 'entry_type', 'title', 'issued_at')
    list_filter = ('entry_type',)


@admin.register(Credential)
class CredentialAdmin(admin.ModelAdmin):
    list_display = ('title', 'credential_type', 'issuer_type', 'is_published')
    list_filter = ('credential_type', 'issuer_type', 'is_published')
    prepopulated_fields = {'slug': ('title',)}


@admin.register(IssuedCredential)
class IssuedCredentialAdmin(admin.ModelAdmin):
    list_display = ('verification_code', 'credential', 'student', 'issued_at')
    search_fields = ('verification_code', 'student__email', 'credential__title')
