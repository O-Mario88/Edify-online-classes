from django.apps import AppConfig


class FinanceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'edify_backend.apps.finance'
    verbose_name = 'Finance ERP System'
    
    def ready(self):
        """Import signals when app is ready."""
        import edify_backend.apps.finance.signals  # noqa
