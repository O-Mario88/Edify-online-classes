from rest_framework.routers import DefaultRouter
from .views import ExamSimulationViewSet, ExamAttemptViewSet, MistakeNotebookViewSet, ReadinessReportView

router = DefaultRouter()
router.register(r'exams', ExamSimulationViewSet, basename='exam-sim')
router.register(r'attempts', ExamAttemptViewSet, basename='exam-sim-attempt')
router.register(r'mistake-notebook', MistakeNotebookViewSet, basename='mistake-notebook')
router.register(r'readiness', ReadinessReportView, basename='exam-sim-readiness')

urlpatterns = router.urls
