from rest_framework.routers import DefaultRouter
from .views import CohortViewSet, CohortEnrollmentViewSet

router = DefaultRouter()
router.register(r'cohorts', CohortViewSet, basename='cohort')
router.register(r'enrollments', CohortEnrollmentViewSet, basename='cohort-enrollment')

urlpatterns = router.urls
